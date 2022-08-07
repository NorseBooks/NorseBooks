CREATE TABLE IF NOT EXISTS "NB_SESSION" (
  "id"         CHAR(16)  NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "userID"     CHAR(16)  NOT NULL,
  "createTime" TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),

  CONSTRAINT fk_session_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
