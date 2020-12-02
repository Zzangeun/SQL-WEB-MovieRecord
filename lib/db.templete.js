//이 파일 복사해서 db.js 라고 바꾸기

var mysql = require('mysql');

var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',        //내 비밀번호 적기
    database : ''         //데이터베이스 이름 적기(my_movie)
  });
  
db.connect();

module.exports = db;