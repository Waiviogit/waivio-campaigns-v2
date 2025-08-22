import {
  reviewMessageRejectType,
  reviewMessageSuccessType,
  ContestWinnerType,
} from '../types';

export interface MessageOnReviewInterface {
  sendMessageSuccessReview({
    campaign,
    userReservationObject,
    reviewPermlink,
    postAuthor,
    botName,
  }: reviewMessageSuccessType): Promise<void>;
  rejectMentionMessage({
    guideName,
    reservationPermlink,
  }: reviewMessageRejectType): Promise<void>;
  giveawayMessage(activationPermlink: string): Promise<void>;
  giveawayObjectWinMessage(_id: string, eventId: string): Promise<void>;
  contestMessage(activationPermlink: string): Promise<void>;
  contestWinMessage(
    _id: string,
    eventId: string,
    winners: ContestWinnerType[],
  ): Promise<void>;
  rejectMessageObjectGiveaway(
    activationPermlink: string,
    reservationPermlink: string,
  ): Promise<void>;
}
