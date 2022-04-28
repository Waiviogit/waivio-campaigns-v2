import { DetectFraudType, FraudType } from '../types';

export interface FraudDetectionInterface {
  detectFraud({ campaign, images }: DetectFraudType): Promise<FraudType>;
}
