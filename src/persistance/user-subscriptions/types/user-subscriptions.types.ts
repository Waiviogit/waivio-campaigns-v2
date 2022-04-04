import { Document } from 'mongoose';
import { UserSubscriptions } from '../user-subscriptions.schema';

export type UserSubscriptionsDocumentType = UserSubscriptions & Document;
