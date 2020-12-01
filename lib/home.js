var db = require('./db');
var template = require('./template.js');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query(`SELECT * FROM movie`, function(error,movies){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.movie_list(movies);
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`
        );
        response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        response.end(html);
    });
}

exports.page = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    
    db.query(`SELECT * FROM RECORD`, function(error, records){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE CONCAT(RECORD.U_ID, RECORD.M_ID)=?`,[queryData.id], function(error2, record){
            // db.query(`SELECT * FROM record WHERE M_ID=?`,[queryData.id], function(error2, record){
            if(error2){
                throw error2;
            }
            var title = record[0].M_Name;
            var description = record[0].R_Eval;
            var list = template.record_list(records);
            var html = template.HTML(title, list,
             `
             <h2>${sanitizeHtml(title)}</h2>
             ${sanitizeHtml(description)}
             <p>by ${sanitizeHtml(record[0].U_ID)}</p>
             `,
             ` 
             <a href="/create">create</a>
             <a href="/update?id=${queryData.id}">update</a>
             <form action="delete_process" method="post">
               <input type="hidden" name="id" value="${queryData.id}">
               <input type="submit" value="delete">
             </form>
             `
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
            
        })
    });
}

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        db.query('SELECT * FROM author', function(error2, authors){
            var title = 'Create';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `
                <form action="/create_process" method="post">
                  <p><input type="text" name="title" placeholder="title"></p>
                  <p>
                    <textarea name="description" placeholder="description"></textarea>
                  </p>
                  <p>
                    ${template.authorSelect(authors)}
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>
                `,
                `<a href="/create">create</a>`
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
        });
      });
}

exports.create_process = function(request, response){
    var body = '';
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query(
            `
            INSERT INTO topic (title, description, created, author_id) 
            VALUES(?, ?, NOW(), ?)
            `,
            [post.title, post.description, post.author], 
            function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/?id=${result.insertId}`});
                response.end();
            }
        )
    });
}

exports.update = function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query('SELECT * FROM topic', function(error, topics){
        if(error){
          throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2;
          }
          db.query('SELECT * FROM author', function(error2, authors){
            var list = template.list(topics);
            var html = template.HTML(topic[0].title, list,
              `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });

        });
      });
}

exports.update_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author, post.id], function(error, result){
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          })
      });
}

exports.delete_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('DELETE FROM topic WHERE id = ?', [post.id], function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          });
      });
} 

exports.register = function(request, response){
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

exports.register_process = function(request, response){
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

exports.login = function(request, response){
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

exports.login_process = function(request, response){
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
                response.writeHead(302, {Location: `/`, 'Content-Type':'text/html; charset=utf-8'});
                response.end();
                return post.id;
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

exports.logout = function(request, response){
    response.writeHead(302, {Location: `/`, 'Content-Type':'text/html; charset=utf-8'});
    response.end();
    return '';
}