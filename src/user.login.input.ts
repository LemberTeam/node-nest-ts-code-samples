import { Field, InputType } from 'type-graphql';
import { User } from './user.model';

@InputType()
export class UserLoginInput implements Partial<User> {
  @Field() email: string;
  @Field() password: string;
}
