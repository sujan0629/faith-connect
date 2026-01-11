import { BadRequestException, Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../common/decorators/user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@AuthUser() user: UserDocument) {
    const found = await this.usersService.findById(user.id);
    return this.sanitize(found);
  }

  @Patch('me')
  async updateProfile(@AuthUser() user: UserDocument, @Body() dto: UpdateProfileDto) {
    try {
      const updated = await this.usersService.updateProfile(user.id, dto);
      return this.sanitize(updated);
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.username) {
        throw new BadRequestException('Username already taken');
      }
      throw error;
    }
  }

  private sanitize(user?: UserDocument | null) {
    if (!user) return null;
    const { passwordHash, magicTokenHash, signupCodeHash, refreshTokenHash, ...rest } = user.toObject();
    return { id: user.id, ...rest };
  }
}
