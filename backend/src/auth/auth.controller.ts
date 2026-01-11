import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckEmailDto } from './dto/check-email.dto';
import { RequestSignupDto } from './dto/request-signup.dto';
import { VerifySignupCodeDto } from './dto/verify-signup-code.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { PasswordLoginDto } from './dto/password-login.dto';
import { VerifyMagicDto } from './dto/verify-magic.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('check-email')
  checkEmail(@Body() dto: CheckEmailDto) {
    return this.authService.checkEmail(dto);
  }

  @Post('request-signup')
  requestSignup(@Body() dto: RequestSignupDto) {
    return this.authService.sendSignupCode(dto);
  }

  @Post('verify-signup')
  verifySignup(@Body() dto: VerifySignupCodeDto) {
    return this.authService.verifySignupCode(dto);
  }

  @Post('verify-signup-magic')
  verifySignupMagic(@Body() dto: VerifyMagicDto) {
    return this.authService.verifySignupMagicLink(dto);
  }

  @Post('set-password')
  setPassword(@Body() dto: SetPasswordDto) {
    return this.authService.setPassword(dto);
  }

  @Post('password-login')
  passwordLogin(@Body() dto: PasswordLoginDto) {
    return this.authService.passwordLogin(dto);
  }

  @Post('verify-magic')
  verifyMagic(@Body() dto: VerifyMagicDto) {
    return this.authService.verifyMagicLink(dto);
  }

  @Post('refresh')
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }
}
