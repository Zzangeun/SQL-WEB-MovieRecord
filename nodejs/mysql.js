var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'tkddms4199',
  database : 'my_movie'
});
 
connection.connect();
 
connection.query('SELECT * FROM MOVIE', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
});
 
connection.end();