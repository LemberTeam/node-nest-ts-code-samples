import { Field, Int, ObjectType } from 'type-graphql';
import { DateTimeScalar } from '../../common/scalars/datetime.scalar';
import { IsIP } from 'class-validator';

@ObjectType()
export class Device {
  @Field()
  model: string;

  @Field()
  type: string;

  @Field()
  vendor: string;
}

@ObjectType()
export class UserAgent {
  @Field()
  browser: string;

  @Field()
  os: string;

  @Field()
  device: Device;
}

@ObjectType()
export class Session {
  @Field(type => Int)
  id: number;

  @Field()
  sessionId: string;

  @Field(type => Int)
  userId: number;

  @Field(type => Boolean)
  extended: boolean;

  @Field()
  agent: string;

  @IsIP()
  @Field()
  ip: string;

  @Field(type => DateTimeScalar)
  lastAccess?: Date;

  @Field()
  current: boolean;

  @Field()
  online: boolean;

  @Field()
  userAgent: UserAgent;
}
