import { Field, Int, ObjectType } from 'type-graphql';
import { DateScalar } from '../../common';

export enum PasswordRecoveryReason {
  INVITE = 'invite',
  RESET = 'reset',
}

@ObjectType()
export class PasswordRecovery {
  @Field(type => Int)
  id: number;

  @Field()
  secret: string;

  @Field(type => Int)
  userId: number;

  @Field(type => DateScalar)
  expiration?: Date;

  @Field(type => String)
  reason: PasswordRecoveryReason;
}
