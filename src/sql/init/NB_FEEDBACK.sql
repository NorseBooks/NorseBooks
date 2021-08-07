CREATE TABLE IF NOT EXISTS "NB_FEEDBACK" (
  "id"         CHAR(16)      NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "userID"     CHAR(16)      NOT NULL,
  "feedback"   VARCHAR(1023) NOT NULL,
  "submitTime" TIMESTAMP     NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),

  CONSTRAINT fk_feedback_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
