import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const refresh = false

const create_user_table_command = `
    CREATE TABLE IF NOT EXISTS user (
        name TEXT PRIMARY KEY,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        ing_client_number TEXT,
        ing_access_code TEXT,
        cba_client_number TEXT,
        cba_password TEXT
    );
`

const create_accounts_table_command = `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        balance INTEGER NOT NULL,
        bank TEXT NOT NULL
    );
`

const create_transactions_table_command = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY,
        bank TEXT NOT NULL,
        description TEXT NOT NULL,
        amount TEXT NOT NULL,
        account_id INTEGER,
        FOREIGN KEY(account_id) REFERENCES accounts(id)
    );
`

async function init_db() {

    // open the database
    const db = await open({
        filename: `${__dirname}/porky.db`,
        driver: sqlite3.Database
    })

    if (refresh) {
        // Fresh Creation of DB, drop tables before creating
        await db.exec('DROP TABLE IF EXISTS user;')
        await db.exec('DROP TABLE IF EXISTS accounts;')
        await db.exec('DROP TABLE IF EXISTS transactions;')
    }

    // TODO: Design the table structures - need to look at the data 
    await db.exec(create_user_table_command)
    await db.exec(create_accounts_table_command)
    await db.exec(create_transactions_table_command)
}

init_db().then(() => console.log('db initialized'))