CREATE TABLE IF NOT EXISTS "NB_RESOURCE" (
  "name"  VARCHAR(255) NOT NULL,
  "value" TEXT         NOT NULL,
  "type"  VARCHAR(63)  NOT NULL,

  PRIMARY KEY ("name")
);
