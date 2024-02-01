// TODO: Insert account details separately in plaintext
import { open } from "sqlite"
import sqlite3 from "sqlite3"
import path from "node:path"

interface User {
    name: string,
    ing_client_number: string,
    ing_access_code: string
}

async function get_user_details(): Promise<User> {
    const db_path = path.resolve(__dirname, '..', 'porky.db')
    const db = await open({ filename: db_path, driver: sqlite3.Database })
    const retrieved = await db.get('SELECT name, ing_client_number, ing_access_code FROM user;')
    if (!retrieved) {
        throw Error('Failed to retrieve the user: null')
    }
    return retrieved
}

export default get_user_details