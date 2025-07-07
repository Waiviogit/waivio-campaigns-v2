import { reviewMessageRejectType, reviewMessageSuccessType } from '../types';

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
  giveawayMessage(activationPermlink: string): Promise<void>
}
