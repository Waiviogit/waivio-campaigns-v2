import { HiddenPost } from '../hidden-post.schema';
import { Document } from 'mongoose';

export type HiddenPostDocumentType = HiddenPost & Document;
