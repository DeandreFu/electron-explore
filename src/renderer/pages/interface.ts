export interface ChannelMessage {
  msgName: string;
  sendTime: number;
  [index: string]: unknown;
}
