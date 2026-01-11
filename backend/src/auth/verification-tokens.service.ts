import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { VerificationToken, VerificationTokenDocument } from './schemas/verification-token.schema';

@Injectable()
export class VerificationTokensService {
  constructor(
    @InjectModel(VerificationToken.name)
    private readonly tokenModel: Model<VerificationTokenDocument>,
  ) {}

  async createToken(params: {
    userId: string;
    email: string;
    token: string;
    code: string;
    userAgent?: string;
    expiresInSeconds?: number;
  }) {
    const { userId, email, token, code, userAgent, expiresInSeconds = 3600 } = params;
    const tokenHash = await bcrypt.hash(token, 10);
    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    await this.tokenModel.create({
      userId,
      email,
      tokenHash,
      codeHash,
      userAgent,
      expiresAt,
    });
  }

  async consumeByToken(email: string, token: string, userAgent?: string) {
    const records = await this.tokenModel.find({ email }).sort({ createdAt: -1 }).exec();
    for (const record of records) {
      const matches = await bcrypt.compare(token, record.tokenHash);
      if (matches) {
        await this.tokenModel.deleteOne({ _id: record._id }).exec();
        return { userId: record.userId.toString(), userAgentStored: record.userAgent, userAgentRequest: userAgent };
      }
    }
    return null;
  }

  async consumeByCode(email: string, code: string, userAgent?: string) {
    const records = await this.tokenModel.find({ email }).sort({ createdAt: -1 }).exec();
    for (const record of records) {
      const matches = await bcrypt.compare(code, record.codeHash);
      if (matches) {
        await this.tokenModel.deleteOne({ _id: record._id }).exec();
        return { userId: record.userId.toString(), userAgentStored: record.userAgent, userAgentRequest: userAgent };
      }
    }
    return null;
  }
}