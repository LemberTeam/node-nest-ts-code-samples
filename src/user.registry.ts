import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { db, Tables } from '../../database';

@Injectable()
export class UserRegistry {
  async create(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    await db.table(Tables.Users).insert({
      email,
      firstName,
      lastName,
    });
    return db
      .table(Tables.Users)
      .select('*')
      .first()
      .where({ email });
  }

  async findOneById(id: number): Promise<User | null> {
    return db
      .select('*')
      .first()
      .from(Tables.Users)
      .where({ id });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return db
      .select('*')
      .first()
      .from(Tables.Users)
      .where({ email });
  }

  async update(id: number, data: Partial<User>): Promise<void> {
    await db.table(Tables.Users).update(data);
  }
}
