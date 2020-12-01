var http = require('http');
var url = require('url');
var qs = require('querystring');
var movie = require('./lib/movie');
var record = require('./lib/record');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db');
var template = require('./lib/template.js');

var userStatus = '';

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if(pathname === '/'){   //메인페이지
    db.query(`SELECT * FROM movie`, function(error,movies){
      var title = 'Welcome';
      var description = 'Hello, Node.js';
      var list = template.movie_list(movies);
      var html = template.HTML(title, list,
        `<h2>${title}</h2>${description}`,
        ``,
        userStatus
      );
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      response.end(html);
    });
  } 
  else if(pathname === '/search'){    //검색 페이지
    var title = '검색';
    var list = '<br>';
    var html = template.HTML(title, list,
      `
      <form action="/search_process" method="post">
        검색 : <br>
        <p><input type="text" name="search" placeholder="검색어를 입력하세요"></p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<br>`,
      userStatus
    );
    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    response.end(html);
  }
  else if(pathname === '/search_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query(`SELECT * FROM MOVIE WHERE M_Name LIKE ? OR M_Director LIKE ?`, ['%'+post.search+'%', '%'+post.search+'%'], function(error, movies){
          if(error){
            throw error;
          }
          if(movies == ''){
            var title = '검색결과';
            var description = post.search + '에 대한 검색결과입니다.';
            var list = '검색결과가 없습니다.';
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              ``,
              userStatus
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          }
          else{
            var title = '검색결과';
            var description = post.search + '에 대한 검색결과입니다.';
            var list = template.movie_list(movies);
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              ``,
              userStatus
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          }
      });
    });
  }
  else if(pathname === '/movie'){     //장르별 모아보기 페이지
    if(queryData.id === undefined){
      if(queryData.category === undefined){
        db.query(`SELECT * FROM MOVIE`, function(error, movies){
          db.query(`SELECT * FROM GENRE`, function(error2, genres){
            var title = '장르별 모아보기';
            var description = '';
            var list_m = template.movie_list(movies);
            var list_g = template.genre_list(genres);
            var html = template.HTML(title, list_m,
              `
              <h2>${title}</h2>${description}<br>
              ${list_g}
              `,
              ``,
              userStatus
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          });
        });
      }
      else{
        db.query(`SELECT * FROM MOVIE INNER JOIN BELONG ON MOVIE.M_ID = BELONG.M_ID WHERE BELONG.G_ID = ?`, [queryData.category], function(error,movies){
          db.query(`SELECT * FROM GENRE`, function(error2, genres){
            var title = '장르별 모아보기';
            var description = '';
            var list_m = template.movie_list(movies);
            var list_g = template.genre_list(genres);
            var html = template.HTML(title, list_m,
              `
              <h2>${title}</h2>${description}<br>
              ${list_g}
              `,
              ``,
              userStatus
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          });
        });
      }
    }
    else {
      db.query(`SELECT * FROM MOVIE WHERE M_ID = ?`, [queryData.id], function(error,movie){
        var title = movie[0].M_Name;
        var description = '';
        
        db.query(`SELECT * FROM RECORD WHERE M_ID = ?`, [queryData.id], function(error2, records){
          var list = template.one_eval_list(records);
          var movie_detail = template.movie_detail(movie);
          var html = template.HTML(title, list, movie_detail,
            ``,
            userStatus
          );
          response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
          response.end(html);
        });
      });
    }
  }
  else if(pathname === '/record'){
    if(queryData.uid === undefined){
      response.writeHead(404);
      response.end('Not found');
    }
    else {
        db.query(`SELECT * FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE RECORD.U_ID = ? AND RECORD.M_ID = ?`, [queryData.uid, queryData.mid], function(error, record){
          if(error){
            throw error;
          }
          var title = record[0].M_Name;
          var description = record[0].R_Eval;
          var list = '';
          var record_detail = template.record_detail(record);
          var html = template.HTML(title, list, record_detail,
            ` 
            <a href="/update_record?uid=${queryData.uid}&mid=${queryData.mid}">update</a>
            <form action="delete_record_process" method="post">
              <input type="hidden" name="uid" value="${queryData.uid}">
              <input type="hidden" name="mid" value="${queryData.mid}">
              <input type="submit" value="delete">
            </form>
            `,
            userStatus
          );
          response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
          response.end(html);
            
        })
    }
  }
  else if(pathname === '/create_record'){      //감상평 남기기 페이지
    if(queryData.id === undefined){
      record.home(request, response);
    }
    else {
      record.page(request, response);
    }
  }
  else if(pathname === '/create_record_process'){
    movie.create_process(request, response);
  }
  else if(pathname === '/update_record'){
    movie.update(request, response);
  } 
  else if(pathname === '/update_record_process'){
    movie.update_process(request, response);
  } 
  else if(pathname === '/delete_record_process'){
    movie.delete_process(request, response);
  } 
  else if(pathname === '/my_record'){     //나의 감상평 페이지
    if(userStatus === ''){
      response.writeHead(302, {Location: `/login`, 'Content-Type':'text/html; charset=utf-8'});
      response.end();
    }
    else {
      db.query(`SELECT * FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE RECORD.U_ID = ?`, [userStatus], function(error, records){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM USER WHERE U_ID = ?`, [userStatus], function(error2, user){
          var title = '나의 감상평';
          var description = `${user[0].U_Time}`;
          var list = template.my_record_list(records);
          var html = template.HTML(title, list,
            `
            <h2>내가 영화본 시간</h2>
            ${description}
            `,
            ``,
            userStatus
          );
          response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
          response.end(html);
        });
      })
    }
  }
  else if(pathname === '/register'){      //회원가입 페이지
    var title = '회원가입';
    var list = '<br>';
    var html = template.HTML(title, list,
      `
      <form action="/register_process" method="post">
        아이디 : <br>
        <p><input type="text" name="id" placeholder="아이디"></p>
        비밀번호 : <br>
        <p><input type="password" name="pwd" placeholder="비밀번호"></p>
        이름 : <br>
        <p><input type="text" name="name" placeholder="이름"></p>
        성별 : <br>
        <input type="radio" id="male" name="sex" value="1">
        <label for="male">남</label><br>
        <input type="radio" id="female" name="sex" value="0">
        <label for="female">여</label><br>
        생년월일 : <br>
        <p><input type="date" name="birth" placeholder="생년월일"></p>
        이메일 : <br>
        <p><input type="email" name="email" placeholder="이메일"></p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<br>`
    );
    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    response.end(html);
  }
  else if(pathname === '/register_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query(`SELECT * FROM USER WHERE U_ID = ?`, [post.id], function(error, result){
          if(error){
              throw error;
          }
          if(result == ''){
              db.query(
                  `
                  INSERT INTO USER (U_ID, U_Password, U_Name, U_Sex, U_Birth, U_Email, U_Time) 
                  VALUES(?, ?, ?, ?, ?, ?, 0)
                  `,
                  [post.id, post.pwd, post.name, post.sex, post.birth, post.email], 
                  function(error2, result2){
                      if(error2){
                          throw error2;
                      }
                      response.writeHead(302, {Location: `/login`, 'Content-Type':'text/html; charset=utf-8'});
                      response.end();
                  }
              );
          }
          else{
              var title = '회원가입 실패';
              var description = '중복된 아이디로 회원가입 실패했습니다.';
              var list = '';
              var html = template.HTML(title, list,
                `<h2>${title}</h2>${description}`,
                `<a href="/register">회원가입</a>`
              );
              response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
              response.end(html);
          }
      });
    });
  }
  else if(pathname === '/login'){     //로그인 페이지
    var title = '로그인';
    var list = '<br>';
    var html = template.HTML(title, list,
        `
        <form action="/login_process" method="post">
          아이디 : <br>
          <p><input type="text" name="id" placeholder="아이디"></p>
          비밀번호 : <br>
          <p><input type="password" name="pwd" placeholder="비밀번호"></p>
            <input type="submit">
          </p>
        </form>
        `,
        `<br>`
    );
    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    response.end(html);
  }
  else if(pathname === '/login_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query(`SELECT * FROM USER WHERE U_ID = ?`, [post.id], function(error, result){
          if(error){
            throw error;
          }
          if(result == ''){
            var title = '로그인 실패';
            var description = '존재하지 않는 아이디입니다.';
            var list = '';
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/login">로그인</a>`
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          }
          else if(result[0].U_Password === post.pwd){
            userStatus = post.id;
            response.writeHead(302, {Location: `/`, 'Content-Type':'text/html; charset=utf-8'});
            response.end();
          }
          else{
            var title = '로그인 실패';
            var description = '비밀번호가 일치하지 않습니다.';
            var list = '';
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/login">로그인</a>`
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          }
      });
    });
  }
  else if(pathname === '/logout'){      //로그아웃
    userStatus = '';
    response.writeHead(302, {Location: `/`, 'Content-Type':'text/html; charset=utf-8'});
    response.end();
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);