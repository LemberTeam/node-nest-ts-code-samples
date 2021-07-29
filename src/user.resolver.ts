import { Int } from 'type-graphql';
import { UserService } from './user.service';
import {
  Args,
  Query,
  Mutation,
  ResolveProperty,
  Resolver,
  Parent,
  Context,
} from '@nestjs/graphql';
import { User } from './user.model';
import { UserRegisterInput } from './user.register.input';
import { UserLoginInput } from './user.login.input';
import { Session } from './session.model';
import { SessionService } from './session.service';
import { UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { GqlAuthGuard } from './gql.auth.guard';
import { UserSetPasswordInput } from './user.set.password.input';
import { GraphQLError } from 'graphql';

@Resolver(of => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  @UseGuards(new GqlAuthGuard())
  @Query(returns => User, { nullable: true })
  async me(@Context('req') req): Promise<User | null> {
    const u = await this.userService.findOneById(req.context.user.id);
    return u;
  }

  @UseGuards(new GqlAuthGuard())
  @Query(returns => User, { nullable: true })
  async user(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<User | null> {
    const u = await this.userService.findOneById(id);
    return u;
  }

  @UseGuards(new GqlAuthGuard())
  @Query(returns => User, { nullable: true })
  async users(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<User | null> {
    const u = await this.userService.findOneById(id);
    return u;
  }

  @UseGuards(new GqlAuthGuard())
  @ResolveProperty('sessions', returns => [Session])
  async getSessions(@Parent() user: User): Promise<Session[]> {
    return await this.sessionService.getSessions(user.id);
  }

  @Mutation(returns => Session)
  async login(
    @Args('loginUserData') loginUserData: UserLoginInput,
    @Context('req') request: Request,
  ): Promise<Session> {
    const loginResult = await this.userService.login(
      loginUserData.email,
      loginUserData.password,
      request.header('User-Agent'),
      request.ip,
    );
    if (!loginResult.success) {
      throw new GraphQLError('Wrong credentials');
    }

    return loginResult.data;
  }

  @UseGuards(new GqlAuthGuard())
  @Mutation(returns => Boolean)
  async logout(@Context('req') req): Promise<boolean> {
    return this.sessionService.logout(req.context.session.sessionId);
  }

  @Mutation(returns => Boolean)
  async register(
    @Args('inviteUserData') inviteUserData: UserRegisterInput,
  ): Promise<boolean> {
    const result = await this.userService.register(
      inviteUserData.email,
      inviteUserData.firstName,
      inviteUserData.lastName,
    );
    return result.success;
  }

  @Mutation(returns => Boolean, { nullable: true, defaultValue: null })
  async setPassword(
    @Args('setPasswordData') setPasswordData: UserSetPasswordInput,
  ): Promise<void> {
    const success =
      (await this.userService.setPassword(
        setPasswordData.secret,
        setPasswordData.password,
      )) || true;
    if (!success) {
      throw new GraphQLError('Cannot set password');
    }
  }
}
