CREATE TABLE IF NOT EXISTS "NB_USER" (
  "id"               CHAR(16)     NOT NULL DEFAULT SUBSTR(MD5(RANDOM()::TEXT), 0, 17),
  "firstname"        VARCHAR(63)  NOT NULL,
  "lastname"         VARCHAR(63)  NOT NULL,
  "email"            VARCHAR(63)  NOT NULL,
  "passwordHash"     VARCHAR(255) NOT NULL,
  "imageID"          CHAR(16),
  "numBooksListed"   INT          NOT NULL DEFAULT 0,
  "numBooksSold"     INT          NOT NULL DEFAULT 0,
  "moneyMade"        MONEY        NOT NULL DEFAULT '0',
  "verified"         BOOLEAN      NOT NULL DEFAULT FALSE,
  "admin"            BOOLEAN      NOT NULL DEFAULT FALSE,
  "joinTime"         TIMESTAMP    NOT NULL DEFAULT NOW(),
  "lastLoginTime"    TIMESTAMP,

  PRIMARY KEY ("id"),

  CONSTRAINT fk_user_image
    FOREIGN KEY ("imageID")
      REFERENCES "NB_IMAGE"("id")
        ON DELETE SET NULL
);
