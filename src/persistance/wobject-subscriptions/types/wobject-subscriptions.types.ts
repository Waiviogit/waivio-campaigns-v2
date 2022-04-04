import { Document } from 'mongoose';
import { WobjectSubscriptions } from '../wobject-subscriptions.schema';

export type WobjectSubscriptionsDocumentType = WobjectSubscriptions & Document;
