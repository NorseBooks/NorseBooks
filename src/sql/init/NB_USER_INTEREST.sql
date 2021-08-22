CREATE TABLE IF NOT EXISTS "NB_USER_INTEREST" (
  "userID"       CHAR(16)    NOT NULL,
  "departmentID" INT         NOT NULL,
  "interestTime" TIMESTAMP   NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user_interest_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_user_interest_department
    FOREIGN KEY ("departmentID")
      REFERENCES "NB_DEPARTMENT"("id")
        ON DELETE CASCADE
);
