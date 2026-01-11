import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { Resend } from 'resend';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CheckEmailDto } from './dto/check-email.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { VerifySignupCodeDto } from './dto/verify-signup-code.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { PasswordLoginDto } from './dto/password-login.dto';
import { VerifyMagicDto } from './dto/verify-magic.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerificationTokensService } from './verification-tokens.service';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private resend: Resend | null;
  private magicTtlMinutes: number;
  private signupTtlMinutes: number;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private verificationTokensService: VerificationTokensService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.magicTtlMinutes = Number(this.configService.get<string>('MAGIC_TOKEN_TTL_MINUTES') ?? 20);
    this.signupTtlMinutes = Number(this.configService.get<string>('SIGNUP_CODE_TTL_MINUTES') ?? 15);
  }

  async checkEmail(dto: CheckEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (user && user.status === 'active') {
      await this.sendMagicLink(user);
      return { status: 'magic-link-sent', email };
    }

    if (user && user.status === 'pending') {
      await this.sendSignupCode({ email, role: user.role });
      return { status: 'signup-incomplete', email };
    }

    return { status: 'not-found', email };
  }

  async sendSignupCode(dto: RequestSignupDto) {
    const email = dto.email.toLowerCase();
    const role = dto.role ?? 'worshiper';

    const user = await this.usersService.ensurePendingUser(email, role);
    if (user.status === 'active') {
      throw new ConflictException('Account already exists. Try logging in.');
    }

    await this.sendSignupMagicLink(user);

    return { status: 'signup-code-sent', email, expiresInMinutes: this.signupTtlMinutes };
  }

  async verifySignupCode(dto: VerifySignupCodeDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'pending') {
      throw new BadRequestException('No pending signup found for this email.');
    }

    if (!user.signupCodeHash || !user.signupCodeExpiresAt) {
      throw new BadRequestException('No verification code found. Please request a new one.');
    }

    if (new Date(user.signupCodeExpiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Verification code expired.');
    }

    const isValid = await bcrypt.compare(dto.code, user.signupCodeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code.');
    }

    await this.usersService.markSignupVerified(user.id);

    const signupToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'signup' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '30m',
      },
    );

    return { signupToken, email };
  }

  async setPassword(dto: SetPasswordDto) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type?: string }>(dto.signupToken, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
    });

    if (payload.type !== 'signup' || payload.email !== dto.email.toLowerCase()) {
      throw new UnauthorizedException('Invalid signup token.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new BadRequestException('Account not found.');
    if (user.status === 'active') throw new ConflictException('Account already active.');
    if (!user.signupCodeVerifiedAt || (user.signupCodeExpiresAt && new Date(user.signupCodeExpiresAt).getTime() < Date.now())) {
      throw new BadRequestException('Verification code has expired.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const updated = await this.usersService.activateUser(user.id, passwordHash, dto.name, dto.role ?? user.role);
    if (!updated) throw new BadRequestException('Could not activate account');

    const tokens = await this.issueTokens(updated);
    return { user: this.sanitizeUser(updated), ...tokens };
  }

  async passwordLogin(dto: PasswordLoginDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user || user.status !== 'active' || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async verifySignupMagicLink(dto: VerifyMagicDto) {
    const email = dto.email.toLowerCase();

    console.log('[verifySignupMagicLink] Attempting to verify:', { email, token: dto.token, code: dto.code });

    const byToken = dto.token
      ? await this.verificationTokensService.consumeByToken(email, dto.token, undefined)
      : null;
    const byCode = !byToken && dto.code ? await this.verificationTokensService.consumeByCode(email, dto.code, undefined) : null;

    console.log('[verifySignupMagicLink] Match results:', { byToken: !!byToken, byCode: !!byCode });

    const match = byToken || byCode;
    if (!match) {
      console.log('[verifySignupMagicLink] No match found - token/code invalid or expired');
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    const user = await this.usersService.findById(match.userId);
    console.log('[verifySignupMagicLink] User found:', { userId: user?.id, status: user?.status });
    
    if (!user || user.status !== 'pending') {
      throw new UnauthorizedException('Account not found or already active');
    }

    await this.usersService.markSignupVerified(user.id);

    const signupToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'signup' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '30m',
      },
    );

    console.log('[verifySignupMagicLink] Success - returning signupToken');
    return { signupToken, email };
  }

  async verifyMagicLink(dto: VerifyMagicDto) {
    const email = dto.email.toLowerCase();

    const byToken = dto.token
      ? await this.verificationTokensService.consumeByToken(email, dto.token, undefined)
      : null;
    const byCode = !byToken && dto.code ? await this.verificationTokensService.consumeByCode(email, dto.code, undefined) : null;

    const match = byToken || byCode;
    if (!match) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    const user = await this.usersService.findById(match.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Account not found');
    }

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const payload = await this.jwtService.verifyAsync<{ sub: string; email: string; type?: string }>(dto.refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(dto.refreshToken, user.refreshTokenHash);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.issueTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  private async sendMagicLink(user: UserDocument) {
    const token = uuid();
    const code = this.generateSixDigitCode();

    await this.verificationTokensService.createToken({
      userId: user.id,
      email: user.email.toLowerCase(),
      token,
      code,
      expiresInSeconds: this.magicTtlMinutes * 60,
    });

    const baseUrl = this.configService.get<string>('MAGIC_LINK_URL') ?? 'https://faithconnectapp.netlify.app';
    const link = `${baseUrl}?token=${token}&email=${encodeURIComponent(user.email)}&code=${code}&env=dev`;

    await this.sendEmail({
      to: user.email,
      subject: 'FaithConnect magic login link',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.5;">
          <p>Hi${user.name ? ` ${user.name}` : ''},</p>
          <p>Use the button below to securely sign in to <strong>FaithConnect</strong>:</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Continue to FaithConnect
            </a>
          </p>
          <p>If the button doesn't work, you can enter this code in the app:</p>
          <p style="font-size: 18px; font-weight: 600; letter-spacing: 2px; margin: 12px 0;">${code}</p>
          <p style="color: #475569; font-size: 14px;">This link expires in ${this.magicTtlMinutes} minutes.</p>
        </div>
      `,
    });
  }

  private async sendSignupMagicLink(user: UserDocument) {
    const token = uuid();
    const code = this.generateSixDigitCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = this.minutesFromNow(this.signupTtlMinutes);

    // Store the code in user record for manual code entry
    await this.usersService.setSignupCode(user.id, codeHash, expiresAt);

    // Store token for magic link verification
    await this.verificationTokensService.createToken({
      userId: user.id,
      email: user.email.toLowerCase(),
      token,
      code,
      expiresInSeconds: this.magicTtlMinutes * 60,
    });

    const link = `https://faithconnectapp.netlify.app?token=${token}&email=${encodeURIComponent(user.email)}&code=${code}&env=dev&signup=true`;

    await this.sendEmail({
      to: user.email,
      subject: 'Complete your FaithConnect signup',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #0f172a; line-height: 1.5;">
          <p>Welcome to <strong>FaithConnect</strong>!</p>
          <p>Use the button below to verify your email and complete your signup:</p>
          <p style="margin: 24px 0;">
            <a href="${link}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 15px;">
              Verify Email & Continue
            </a>
          </p>
          <p>Or enter this code in the app:</p>
          <p style="font-size: 18px; font-weight: 600; letter-spacing: 2px; margin: 12px 0;">${code}</p>
          <p style="color: #475569; font-size: 14px;">This link expires in ${this.magicTtlMinutes} minutes.</p>
        </div>
      `,
    });
  }

  private async sendEmail(payload: { to: string; subject: string; html: string }) {
    if (!this.resend) {
      // eslint-disable-next-line no-console
      console.warn('RESEND_API_KEY not set. Email will not be sent.');
      return;
    }

    const from = this.configService.get<string>('EMAIL_FROM') ?? 'FaithConnect <no-reply@faithconnect.app>';
    await this.resend.emails.send({ from, ...payload });
  }

  private async issueTokens(user: UserDocument): Promise<Tokens> {
    const userId = user.id;

    const accessPayload = { sub: userId, email: user.email, role: user.role, type: 'access' } as Record<string, any>;
    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET') ?? 'change-me',
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h',
    } as any);

    const refreshPayload = {
      sub: userId,
      email: user.email,
      role: user.role,
      type: 'refresh',
    } as Record<string, any>;
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? 'change-me-too',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    } as any);

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setRefreshToken(userId, refreshHash);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument | null): Partial<User> & { id?: string } {
    if (!user) return {};
    const { passwordHash, magicTokenHash, signupCodeHash, refreshTokenHash, ...rest } = user.toObject();
    return { id: user.id, ...rest };
  }

  private generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private minutesFromNow(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}