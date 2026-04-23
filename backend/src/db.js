require("dotenv").config();
const { Pool } = require("pg");

class DBManager {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
    }

    async test() {
        const res = await this.pool.query("SELECT NOW()");
        console.log(res.rows);
    }

    async query(text, params) {
        return this.pool.query(text, params);
    }

    async getUserByEmail(email) {
        const res = await this.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        return res.rows[0];
    }
}

module.exports = DBManager;