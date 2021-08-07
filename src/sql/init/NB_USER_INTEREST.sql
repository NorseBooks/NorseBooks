CREATE TABLE IF NOT EXISTS "NB_USER_INTEREST" (
  "id"           CHAR(16)    NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "userID"       CHAR(16)    NOT NULL,
  "departmentID" INT         NOT NULL,
  "interestType" VARCHAR(63) NOT NULL DEFAULT 'INTEREST',
  "interestTime" TIMESTAMP   NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),

  CONSTRAINT fk_user_interest_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_user_interest_department
    FOREIGN KEY ("departmentID")
      REFERENCES "NB_DEPARTMENT"("id")
        ON DELETE CASCADE
);
