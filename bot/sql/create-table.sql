CREATE TABLE Nouns (
    id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
    content VARCHAR(100) NOT NULL UNIQUE
);

GO
    CREATE TABLE Verbs (
        id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
        content VARCHAR(100) NOT NULL UNIQUE
    );

GO
    CREATE TABLE Adjectives (
        id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
        content VARCHAR(100) NOT NULL UNIQUE
    );

GO
    CREATE TABLE Adverbs (
        id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
        content VARCHAR(100) NOT NULL UNIQUE
    );

GO
    CREATE TABLE Characters (
        id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
        content VARCHAR(100) NOT NULL UNIQUE
    );

GO
-- INSERT INTO
--     Nouns (content)
-- VALUES
--     (Upper("sherry"));

-- GO
--     -- INSERT INTO
--     --     Verbs (content)
--     -- VALUES
--     --     (Upper("run"));
--     -- GO
-- INSERT INTO
--     Characters (content)
-- VALUES
--     (Upper("Frasier")),
--     (Upper("Niles")),
--     (Upper("Martin")),
--     (Upper("Daphne")),
--     (Upper("Roz")),
--     (Upper("Kenny")),
--     (Upper("Maris")),
--     (Upper("Bulldog")),
--     (Upper("Gil")),
--     (Upper("Frederick"));

-- GO