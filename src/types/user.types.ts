import { Document } from 'mongoose';

export interface User {
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface IUser extends User, Document {
  comparePassword(password: string): Promise<boolean>;
}
