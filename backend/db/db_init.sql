CREATE TABLE users(
    user_id SERIAL NOT NULL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    xp INT,
    rank INT,
    created_at TIMESTAMP CURRENT_TIMESTAMP 
);
