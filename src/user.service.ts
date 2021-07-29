import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { User } from './user.model';
import { UserRegistry } from './user.registry';
import { OperationResult } from '../../common';
import { ILoginOperationResult, LoginError } from './user.interfaces';
import { PasswordRecoveryService } from './password-recovery.service';
import { SessionService } from './session.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRegistry: UserRegistry,
    private readonly passwordRecoveryService: PasswordRecoveryService,
    private readonly sessionService: SessionService,
  ) {}

  async login(
    email: string,
    password: string,
    userAgent: string,
    ip: string,
  ): Promise<ILoginOperationResult> {
    const user = await this.userRegistry.findOneByEmail(email);
    if (!user) {
      return {
        success: false,
        error: LoginError.USER_NOT_FOUND,
      };
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: LoginError.WRONG_PASSWORD,
      };
    }

    const session = await this.sessionService.createSession(
      user.id,
      userAgent,
      ip,
      true,
    );

    return {
      success: true,
      data: session,
    };
  }

  async register(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<OperationResult> {
    const existing = await this.userRegistry.findOneByEmail(email);
    if (existing) {
      return {
        success: false,
        error: 'User exists',
      };
    }
    try {
      const user = await this.userRegistry.create(email, firstName, lastName);
      await this.passwordRecoveryService.createSetRequest(user);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        error: e.message,
      };
    }
  }

  async findOneById(id: number): Promise<User | null> {
    const user = await this.userRegistry.findOneById(id);
    return user;
  }

  async setPassword(secret: string, password: string): Promise<boolean> {
    const recoveryRequest = await this.passwordRecoveryService.getDetails(
      secret,
    );
    if (!recoveryRequest) {
      return false;
    }

    const hashed = await hash(password, 12);

    await this.userRegistry.update(recoveryRequest.userId, {
      password: hashed,
    });
    await this.passwordRecoveryService.invalidateRequests(
      recoveryRequest.userId,
    );
    return true;
  }
}
