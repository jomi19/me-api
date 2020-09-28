CREATE TABLE IF NOT EXISTS users (
    email VARCHAR(255) NOT NULL,
    pass VARCHAR(60) NOT NULL,
    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS kmom (
    kmom SMALLINT NOT NULL,
    kmomtext VARCHAR NOT NULL,
    UNIQUE(kmom)
);

CREATE TABLE IF NOT EXISTS texts (
    nr SMALLINT NOT NULL,
    texts VARCHAR NOT NULL,
    UNIQUE(nr)
);

INSERT INTO kmom (kmom, kmomtext) VALUES ("1", "Test kmom01");
INSERT INTO kmom (kmom, kmomtext) VALUES ("3", "Test kmom01");
INSERT INTO users (email, pass) VALUES ("chai@test.nu", "$2y$10$1UfzQK9VFm8mrZBNc1CNNexGwfOK1YQLZYUEMKAbrNHBZEA2R7Ay2");