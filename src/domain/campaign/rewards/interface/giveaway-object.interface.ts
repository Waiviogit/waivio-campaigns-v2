export interface GiveawayObjectInterface {
  setNextRecurrentEvent(rruleString: string, _id: string): Promise<void>;
  startGiveaway(_id: string): Promise<void>;
  listener(key: string): Promise<void>;
}
