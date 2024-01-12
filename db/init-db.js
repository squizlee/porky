const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

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

    (async () => {
        // open the database
        const db = await open({
            filename: `${__dirname}/porky.db`,
            driver: sqlite3.Database
        })

        if (refresh) {
            // Fresh Creation of DB
            await db.exec('DROP TABLE IF EXISTS user;')
        }

        // TODO: Design the table structures - need to look at the data 
        await db.exec(create_user_table_command)
    })()