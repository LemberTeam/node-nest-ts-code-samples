import { Field, Int, ObjectType } from 'type-graphql';
import { Session } from './session.model';
import { Timesheet } from './timesheet.model';

@ObjectType()
export class User {
  @Field(type => Int)
  id: number;

  @Field({ nullable: false })
  email: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(type => [Session])
  sessions: Session[];

  @Field(type => [Timesheet])
  timesheets: Timesheet[];

  @Field(type => Timesheet, { nullable: true })
  currentTimesheet?: Timesheet;
}
