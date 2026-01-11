import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerificationToken, VerificationTokenSchema } from './schemas/verification-token.schema';
import { VerificationTokensService } from './verification-tokens.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: VerificationToken.name, schema: VerificationTokenSchema }]),
  ],
  providers: [AuthService, JwtStrategy, VerificationTokensService],
  controllers: [AuthController],
})
export class AuthModule {}
