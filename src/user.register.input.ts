import { Field, InputType } from 'type-graphql';
import { IsEmail, MinLength } from 'class-validator';
import { User } from './user.model';

@InputType()
export class UserRegisterInput implements Partial<User> {
  @Field()
  @IsEmail()
  email: string;
  @Field() firstName: string;
  @Field() lastName: string;
}
