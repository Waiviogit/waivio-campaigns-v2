import {
  CreateUpvoteType,
  GetUpvoteType,
  SponsorsBotUpvoteDocumentType,
  UpdateStatusType,
  UpdateUpvotesType,
  UpvotesFindType,
} from '../type';
import { UpdateWriteOpResult } from 'mongoose';

export interface SponsorsBotUpvoteRepositoryInterface {
  create(upvote: CreateUpvoteType): Promise<SponsorsBotUpvoteDocumentType>;
  getUpvotes(): Promise<GetUpvoteType[]>;
  updateStatus({
    _id,
    status,
    currentVote,
    voteWeight,
  }: UpdateStatusType): Promise<boolean>;
  updateMany({
    filter,
    update,
    options,
  }: UpdateUpvotesType): Promise<UpdateWriteOpResult>;
  findOne({
    filter,
    projection,
    options,
  }: UpvotesFindType): Promise<SponsorsBotUpvoteDocumentType>;
  find({
    filter,
    projection,
    options,
  }: UpvotesFindType): Promise<SponsorsBotUpvoteDocumentType[]>;
}
