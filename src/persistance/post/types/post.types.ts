import { Document } from 'mongoose';
import { Post } from '../post.schema';

export type ReblogToType = {
  author: string;
  permlink: string;
};

export type PostWobjects = {
  author_permlink: string;
  percent: number;
  tagged: string;
};

export type ActiveVotesType = {
  voter: string;
  weight: number;
  percent: number;
};

export type BeneficiariesType = {
  account: string;
  weight: number;
};

export type PostDocumentType = Post & Document;
