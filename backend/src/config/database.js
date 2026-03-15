const sql = require("mssql")


const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_OPTIONS_ENCRYPT === "true",
        enableArithAbort: true,
    },
    requestTimeout: 40000,
};

let pool; 

async function connectDB() {
    pool = await sql.connect(config)
    return pool
}

module.exports = connectDB
module.exports.pool = () => pool; 