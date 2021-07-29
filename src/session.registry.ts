import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Session } from './session.model';
import { db, Tables } from '../../database';
import { omit } from 'lodash';
import * as Knex from 'knex';

const SESSION_DURATION = {
  DEFAULT: 60 * 60,
  EXTENDED: 60 * 60 * 24 * 30,
};

@Injectable()
export class SessionRegistry {
  async create(
    userId: number,
    agent: string,
    ip: string,
    extended: boolean,
  ): Promise<Session> {
    const sessionId = uuidv4();

    await db.table(Tables.Sessions).insert({
      userId,
      sessionId,
      agent,
      ip,
      extended,
      lastAccess: new Date(),
    });
    return await this.access(sessionId);
  }

  async access(
    sessionId: string,
    update: boolean = true,
  ): Promise<Session | null> {
    const session = await this.findOneBySessionId(sessionId);
    if (!session) {
      return null;
    }

    if (!update) {
      return session;
    }

    const result = (await this.update(sessionId, {
      ...session,
      lastAccess: new Date(),
    })) as Session;

    return result;
  }

  async update(sessionId: string, data: Partial<Session>): Promise<Session> {
    await db
      .table(Tables.Sessions)
      .update(omit(data, 'online'))
      .where({ sessionId });
    return await this.findOneBySessionId(sessionId);
  }

  async delete(id: number): Promise<void> {
    await db
      .table(Tables.Sessions)
      .delete()
      .where({ id });
  }

  async validateSessionTime(session: Session): Promise<boolean> {
    const sessionDuration = session.extended
      ? SESSION_DURATION.EXTENDED
      : SESSION_DURATION.DEFAULT;
    const lastValid = new Date(Date.now() - sessionDuration * 1000);
    return session.lastAccess >= lastValid;
  }

  async findOneById(id: number): Promise<Session | null> {
    const session = await db
      .select('*')
      .first()
      .from(Tables.Sessions)
      .where({ id });

    session.online = session.lastAccess.getTime() > new Date().getTime() - 3000;
    return session;
  }

  async findOneBySessionId(sessionId: string): Promise<Session | null> {
    const session = (await db
      .select('*')
      .first()
      .from(Tables.Sessions)
      .where({ sessionId })) as Session;
    session.online = session.lastAccess.getTime() > new Date().getTime() - 3000;
    return session;
  }

  async findAllByUser(userId: number): Promise<Session[]> {
    const sessionRows = (await db
      .select('*')
      .from(Tables.Sessions)
      .where({ userId })) as Session[];
    return sessionRows.map<Session>(row => ({
      ...row,
      online: row.lastAccess.getTime() > new Date().getTime() - 3000,
    }));
  }

  async deleteStaleSessions(): Promise<void> {
    await db
      .delete()
      .from(Tables.Sessions)
      .where('expiration', '>=', (db as Knex).fn.now());
  }
}
