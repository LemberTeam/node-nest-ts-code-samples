import { Injectable } from '@nestjs/common';
import { db, Tables } from '../../database';
import {
  PasswordRecovery,
  PasswordRecoveryReason,
} from './password-recovery.model';

@Injectable()
export class PasswordRecoveryRegistry {
  async create(
    userId: number,
    reason: PasswordRecoveryReason,
    secret: string,
    createdAt: Date,
  ): Promise<void> {
    await db.table(Tables.PasswordRecovery).insert({
      secret,
      userId,
      reason,
      createdAt,
    });
  }

  async findOneBySecret(secret: string): Promise<PasswordRecovery | null> {
    return db
      .select('*')
      .first()
      .from(Tables.PasswordRecovery)
      .where({ secret });
  }

  async deleteAllByUser(userId: number): Promise<void> {
    return db
      .delete()
      .from(Tables.PasswordRecovery)
      .where({ userId });
  }

  async deleteOlderThan(date: Date): Promise<void> {
    return db
      .delete()
      .from(Tables.PasswordRecovery)
      .where('createdAt', '<', date);
  }
}
