import { Document } from 'mongoose';
import { WobjectSubscriptions } from '../giveaway-participants.schema';

export type WobjectSubscriptionsDocumentType = WobjectSubscriptions & Document;
