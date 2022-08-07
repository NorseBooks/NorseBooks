CREATE TABLE IF NOT EXISTS "NB_BOOK" (
  "id"           CHAR(16)      NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "userID"       CHAR(16)      NOT NULL,
  "title"        VARCHAR(255)  NOT NULL,
  "author"       VARCHAR(255)  NOT NULL,
  "description"  VARCHAR(1023) NOT NULL,
  "ISBN10"       CHAR(10),
  "ISBN13"       CHAR(13),
  "imageID"      CHAR(16)      NOT NULL,
  "departmentID" INT           NOT NULL,
  "courseNumber" INT,
  "price"        MONEY         NOT NULL,
  "conditionID"  INT           NOT NULL,
  "listTime"     TIMESTAMP     NOT NULL DEFAULT NOW(),
  "editTime"     TIMESTAMP,

  PRIMARY KEY ("id"),

  CONSTRAINT fk_book_user
    FOREIGN KEY ("userID")
      REFERENCES "NB_USER"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_book_image
    FOREIGN KEY ("imageID")
      REFERENCES "NB_IMAGE"("id")
        ON DELETE CASCADE,

  CONSTRAINT fk_book_department
    FOREIGN KEY ("departmentID")
      REFERENCES "NB_DEPARTMENT"("id"),

  CONSTRAINT fk_book_condition
    FOREIGN KEY ("conditionID")
      REFERENCES "NB_BOOK_CONDITION"("id")
);
