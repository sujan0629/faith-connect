import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class LeadersService {
  constructor(private usersService: UsersService) {}

  async getLeaders(filters?: { faith?: string; search?: string }) {
    return this.usersService.getLeaders(filters);
  }

  async getFollowers(leaderId: string) {
    return this.usersService.getFollowers(leaderId);
  }

  async getFollowing(userId: string) {
    return this.usersService.getFollowing(userId);
  }
}