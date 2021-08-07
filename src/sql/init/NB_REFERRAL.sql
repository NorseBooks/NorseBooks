CREATE TABLE IF NOT EXISTS "NB_REFERRAL" (
  "userID"    CHAR(16)  NOT NULL,
  "newUserID" CHAR(16)  NOT NULL,
  "verified"  BOOLEAN   NOT NULL DEFAULT FALSE,
  "referTime" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_referral_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_referral_new_user
    FOREIGN KEY ("newUserID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
