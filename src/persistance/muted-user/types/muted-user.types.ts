import { Document } from 'mongoose';
import { MutedUser } from '../muted-user.schema';

export type MutedUserDocumentType = MutedUser & Document;
