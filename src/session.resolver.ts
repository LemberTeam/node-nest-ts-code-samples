import { Int } from 'type-graphql';
import { UAParser } from 'ua-parser-js';
import { SessionService } from './session.service';
import {
  Mutation,
  Parent,
  Context,
  Resolver,
  ResolveProperty,
  Args,
  Query,
  Subscription,
} from '@nestjs/graphql';
import { Device, Session, UserAgent } from './session.model';
import { User } from './user.model';
import { UserService } from './user.service';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql.auth.guard';
import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { UseridAuthGuard } from './userid.auth.guard';
import { OnlineManagerService } from '../online/online.manager.service';

@Resolver(of => Session)
export class SessionResolver {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly onlineManagerService: OnlineManagerService,
    @Inject('PUB_SUB')
    private readonly pubSub: PubSub,
  ) {
    this.onlineManagerService.observe().subscribe(async sessionStatus => {
      const session = await this.sessionService.authorize(sessionStatus.id);
      if (session) {
        session.online = sessionStatus.online || session.online;
      }
      await this.pubSub.publish('sessionOnlineChange', {
        sessionOnlineChange: session,
      });
    });
  }

  @Query(returns => Session)
  async session(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Context('req') req,
  ): Promise<Session> {
    const session = await this.sessionService.getById(id);

    if (!session || session.userId !== req.context.user.id) {
      throw new GraphQLError('Session not found or access not allowed');
    }

    return session;
  }

  @UseGuards(new GqlAuthGuard())
  @ResolveProperty('user', returns => User)
  async user(@Parent() session: Session): Promise<User> {
    return this.userService.findOneById(session.userId);
  }

  @UseGuards(new GqlAuthGuard())
  @ResolveProperty('current', returns => Boolean)
  isCurrent(@Parent() session: Session, @Context('req') req): boolean {
    return req.context.session.id === session.id;
  }

  @UseGuards(new GqlAuthGuard())
  @ResolveProperty('online', returns => Boolean)
  isOnline(@Parent() session: Session, @Context('req') req): boolean {
    return session.online || this.onlineManagerService.isOnline(session);
  }

  @UseGuards(new GqlAuthGuard())
  @ResolveProperty('userAgent', returns => UserAgent)
  userAgent(@Parent() session: Session): UserAgent {
    const ua = new UAParser(session.agent);
    const result = new UserAgent();
    result.browser = ua.getBrowser().name;
    result.os = ua.getOS().name;
    result.device = new Device();
    result.device.model = ua.getDevice().model || 'unknown';
    result.device.vendor = ua.getDevice().vendor || 'unknown';
    result.device.type = ua.getDevice().type || 'unknown';
    return result;
  }

  @UseGuards(new GqlAuthGuard())
  @UseGuards(UseridAuthGuard)
  @Subscription(returns => Session, {
    filter: (payload: any, args: any, context: any) => {
      return payload.sessionOnlineChange.userId === context.req.context.user.id;
    },
  })
  sessionOnlineChange(@Context('req') req: any) {
    return this.pubSub.asyncIterator<Session>('sessionOnlineChange');
  }

  @UseGuards(new GqlAuthGuard())
  @Mutation(returns => Boolean)
  async deleteSession(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Context('req') req,
  ): Promise<boolean> {
    return this.sessionService.logoutById(id, req.context.user.id);
  }
}
