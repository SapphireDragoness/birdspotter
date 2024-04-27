PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL,
    banned INTEGER
);

CREATE TABLE IF NOT EXISTS birds (
    speciesName TEXT PRIMARY KEY NOT NULL,
    commonName TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parks (
    name TEXT PRIMARY KEY NOT NULL,
    province TEXT,
    website TEXT
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY NOT NULL,
    photoPath TEXT,
    op TEXT,
    bird TEXT,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    title TEXT NOT NULL,
    comment TEXT,
    FOREIGN KEY (op) REFERENCES users(username),
    FOREIGN KEY (bird) REFERENCES birds(speciesName),
    FOREIGN KEY (location) REFERENCES parks(name)
);

CREATE TABLE IF NOT EXISTS likes (
    user TEXT,
    post INTEGER,
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (post) REFERENCES posts(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    user TEXT,
    post INTEGER,
    comment TEXT,
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (post) REFERENCES posts(id)
);


