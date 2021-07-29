import { Field, InputType } from 'type-graphql';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

@InputType()
export class UserSetPasswordInput {
  @Field()
  @IsString()
  @MinLength(4)
  @IsNotEmpty()
  password: string;
  @Field()
  @IsString()
  @IsNotEmpty()
  secret: string;
}
