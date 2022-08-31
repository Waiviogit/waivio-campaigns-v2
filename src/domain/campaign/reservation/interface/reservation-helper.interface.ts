import { HiveCommentType } from '../../../../common/types';
import { MetadataType } from '../../../hive-parser/types';

export interface ReservationHelperInterface {
  parseReservationConversation(
    params: ParseReservationConversationInterface,
  ): Promise<void>;
}

export interface ParseReservationConversationInterface {
  comment: HiveCommentType;
  metadata: MetadataType;
}
