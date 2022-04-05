export type SendNotificationType = {
  id: string;
  data: unknown;
};

export type SendBellNotificationType = {
  objects: string[];
  primaryObject: string;
  guideName: string;
};
