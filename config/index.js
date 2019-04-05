const mysql      = require('mysql');
const dbConnection = mysql.createConnection({
  host     : process.env.dbHost || 'localhost',
  user     : process.env.dbUser || 'root',
  password : process.env.dbPassword || '',
  database : process.env.dbName || 'ukk_ppob'
});

const secretOrKey = process.env.SECRETORKEY || "AwesomeKey"

module.exports = {
    db : dbConnection,
    secretOrKey
}