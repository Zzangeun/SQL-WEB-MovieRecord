var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'tkddms4199',
    database : 'my_movie'
  });
  
db.connect();

module.exports = db;