/**
 * Message interface.
 * @packageDocumentation
 */

/**
 * Message table schema.
 */
export interface NBMessage {
  id: string;
  fromUserID: string;
  toUserID: string;
  content: string;
  read: boolean;
  sendTime: number;
}
