import { Session } from './session.model';

export interface IOperationResult<T, E> {
  success: boolean;
  data?: T;
  error?: E;
}

export enum LoginError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

export type ILoginOperationResult = IOperationResult<Session, LoginError>;
