CREATE TABLE IF NOT EXISTS "NB_MESSAGE" (
  "id"         CHAR(16)      NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "fromUserID" CHAR(16)      NOT NULL,
  "toUserID"   CHAR(16)      NOT NULL,
  "content"    VARCHAR(1023) NOT NULL,
  "read"       BOOLEAN       NOT NULL DEFAULT FALSE,
  "sendTime"   TIMESTAMP     NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),

  CONSTRAINT fk_message_from_user
    FOREIGN KEY ("fromUserID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_message_to_user
    FOREIGN KEY ("toUserID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
