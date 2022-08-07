/**
 * Feedback interface.
 * @packageDocumentation
 */

/**
 * Feedback table schema.
 */
export interface NBFeedback {
  id: string;
  userID: string;
  feedback: string;
  submitTime: number;
}
