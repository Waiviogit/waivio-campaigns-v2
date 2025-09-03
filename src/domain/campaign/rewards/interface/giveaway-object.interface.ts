export interface GiveawayObjectInterface {
  startGiveaway(_id: string): Promise<void>;
  listener(key: string): Promise<void>;
}
