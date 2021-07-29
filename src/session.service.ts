import { Injectable } from '@nestjs/common';
import { SessionRegistry } from './session.registry';
import { Session } from './session.model';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRegistry: SessionRegistry) {}

  async getSessions(userId: number): Promise<Session[]> {
    return this.sessionRegistry.findAllByUser(userId);
  }

  async getById(id: number): Promise<Session> {
    return this.sessionRegistry.findOneById(id);
  }

  async authorize(sessionId: string): Promise<Session | null> {
    return this.sessionRegistry.access(sessionId);
  }

  async logoutById(id: number, userId: number): Promise<boolean> {
    const session = await this.sessionRegistry.findOneById(id);
    if (!session) {
      return false;
    }

    if (session.userId !== userId) {
      return false;
    }

    await this.sessionRegistry.delete(session.id);
    return true;
  }

  async logout(sessionId: string): Promise<boolean> {
    const session = await this.sessionRegistry.findOneBySessionId(sessionId);
    if (!session) {
      return false;
    }

    await this.sessionRegistry.delete(session.id);
    return true;
  }

  async createSession(
    userId: number,
    userAgent: string,
    ip: string,
    extended: boolean,
  ): Promise<Session> {
    const session = await this.sessionRegistry.create(
      userId,
      userAgent,
      ip,
      extended,
    );
    return session;
  }
}
