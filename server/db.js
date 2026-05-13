import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function getDb() {
    return open({
        filename: process.env.DATABASE_PATH || './server/responses.db',
        driver: sqlite3.Database
    });
}
