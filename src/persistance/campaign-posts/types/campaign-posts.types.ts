import { Document } from 'mongoose';
import { CampaignPost } from '../campaign-posts.schema';

export type CampaignPostsDocumentType = CampaignPost & Document;
