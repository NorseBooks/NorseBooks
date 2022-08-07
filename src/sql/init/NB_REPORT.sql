CREATE TABLE IF NOT EXISTS "NB_REPORT" (
  "id"         CHAR(16)      NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "bookID"     CHAR(16)      NOT NULL,
  "userID"     CHAR(16)      NOT NULL,
  "reason"     VARCHAR(1023) NOT NULL,
  "reportTime" TIMESTAMP     NOT NULL DEFAULT NOW(),

  PRIMARY KEY ("id"),

  CONSTRAINT fk_report_book
    FOREIGN KEY ("bookID")
      REFERENCES "NB_BOOK"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_report_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE
);
