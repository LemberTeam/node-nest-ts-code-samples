import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PasswordRecoveryRegistry } from './password-recovery.registry';
import {
  PasswordRecovery,
  PasswordRecoveryReason,
} from './password-recovery.model';
import { User } from './user.model';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PasswordRecoveryService {
  constructor(
    private readonly passwordRecoveryRegistry: PasswordRecoveryRegistry,
    private readonly mailService: MailService,
  ) {}

  async generateRecoveryToken(): Promise<string> {
    return uuidv4();
  }

  async invalidateRequests(userId: number): Promise<void> {
    return this.passwordRecoveryRegistry.deleteAllByUser(userId);
  }

  async getDetails(secret: string): Promise<PasswordRecovery | null> {
    return this.passwordRecoveryRegistry.findOneBySecret(secret);
  }

  async createResetRequest(user: User): Promise<void> {
    const secret = await this.create(user.id, PasswordRecoveryReason.RESET);
    await this.mailService.sendInviteEmail(user, secret);
  }

  async createSetRequest(user: User): Promise<void> {
    const secret = await this.create(user.id, PasswordRecoveryReason.INVITE);
    await this.mailService.sendPasswordResetEmail(user, secret);
  }

  private async create(
    userId: number,
    reason: PasswordRecoveryReason,
  ): Promise<string> {
    const secret = await this.generateRecoveryToken();
    const date = new Date();
    await this.passwordRecoveryRegistry.create(userId, reason, secret, date);
    return secret;
  }
}
