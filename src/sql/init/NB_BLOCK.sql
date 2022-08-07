CREATE TABLE IF NOT EXISTS "NB_BLOCK" (
  "userID"        CHAR(16)  NOT NULL,
  "blockedUserID" CHAR(16)  NOT NULL,
  "blockTime"     TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_block_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_block_blocked_user
    FOREIGN KEY ("blockedUserID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
