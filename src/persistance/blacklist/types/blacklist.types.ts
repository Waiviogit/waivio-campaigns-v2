import { Blacklist } from '../blacklist.schema';
import { Document } from 'mongoose';

export type BlacklistDocumentType = Blacklist & Document;
