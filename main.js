var http = require('http');
var url = require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db');
var template = require('./lib/template.js');
var dateUtils = require('date-utils');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG, DH_CHECK_P_NOT_PRIME } = require('constants');

var userStatus = '';

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if(pathname === '/'){   //메인페이지
    if(userStatus == ''){     //랜덤 추출 select cid from restaurant order by rand() limit 10
      db.query(`SELECT * FROM MOVIE ORDER BY RAND() LIMIT 5`, function(error, movies){
        db.query(`SELECT * FROM MOVIE ORDER BY M_AvgGrade DESC LIMIT 5`, function(error3, movies2){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.movie_list(movies);
          var list2 = template.movie_list(movies2);
          var html = template.HTML(title, '',
            `
            <h2>${title}</h2>${description}
            ${list}
            ${list2}
            `,
            ``,
            userStatus
          );
          response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
          response.end(html);
        });
      });
    }
    else{     //관심장르중에 랜덤 추출
      db.query(`SELECT G_ID FROM INTEREST WHERE U_ID = ?`, [userStatus], function(error2, interest){
        if(interest == ''){
          db.query(`SELECT * FROM MOVIE ORDER BY RAND() LIMIT 5`, function(error, movies){
            db.query(`SELECT * FROM MOVIE ORDER BY M_AvgGrade DESC LIMIT 5`, function(error3, movies2){
              var title = 'Welcome';
              var description = 'Hello, Node.js';
              var list = template.movie_list(movies);
              var list2 = template.movie_list(movies2);
              var html = template.HTML(title, '',
                `
                <h2>${title}</h2>${description}
                ${list}
                ${list2}
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
          var q = `WHERE `;
          var i = 0;
          q = q + `G_ID = '${interest[i].G_ID}'`;
          i = i + 1;
          while(i < interest.length){
            q = q + ` OR G_ID = '${interest[i].G_ID}'`;
            i = i + 1;
          }
          db.query(`
                SELECT * FROM MOVIE INNER JOIN BELONG ON MOVIE.M_ID = BELONG.M_ID ${q} ORDER BY RAND() LIMIT 5
                `, 
                function(error, movies){
                  db.query(`SELECT * FROM MOVIE ORDER BY M_AvgGrade DESC LIMIT 5`, function(error3, movies2){
                    var title = 'Welcome';
                    var description = 'Hello, Node.js';
                    var list = template.movie_list(movies);
                    var list2 = template.movie_list(movies2);
                    var html = template.HTML(title, '',
                      `
                      <h2>${title}</h2>${description}
                      ${list}
                      ${list2}
                      `,
                      ``,
                      userStatus
                    );
                    response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
                    response.end(html);
                  });
                }
          );
        }
      });
    }
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
      db.query(`SELECT * FROM MOVIE WHERE M_Name LIKE ? OR M_Director LIKE ? ORDER BY M_Name`, ['%'+post.search+'%', '%'+post.search+'%'], function(error, movies){
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
  else if(pathname === '/movie'){     //장르별 모아보기 페이지 (여기까지 order by 완료)
    if(queryData.id === undefined){
      if(queryData.category === undefined){
        db.query(`SELECT * FROM MOVIE ORDER BY M_Name`, function(error, movies){
          db.query(`SELECT * FROM GENRE ORDER BY G_ID`, function(error2, genres){
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
        db.query(`SELECT * FROM MOVIE INNER JOIN BELONG ON MOVIE.M_ID = BELONG.M_ID WHERE BELONG.G_ID = ? ORDER BY M_Name`, [queryData.category], function(error,movies){
          db.query(`SELECT * FROM GENRE ORDER BY G_ID`, function(error2, genres){
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
      db.query(`SELECT * FROM MOVIE WHERE M_ID = ? ORDER BY M_Name`, [queryData.id], function(error,movie){
        var title = movie[0].M_Name;
        var description = '';
        
        db.query(`SELECT * FROM RECORD WHERE M_ID = ? ORDER BY R_Date DESC`, [queryData.id], function(error2, records){
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
  else if(pathname === '/record'){      //감상문 자세히 보기
    if(queryData.uid === undefined || queryData.mid === undefined){
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
    db.query(`SELECT * FROM MOVIE ORDER BY M_Name`, function(error, movies){
      var title = '감상평 남기기';
      var list = '<br>';
      var movie_select_list = template.movie_select_list(movies);
      var html = template.HTML(title, list,
          `
          <form action="/create_record_process" method="post">
            <input type="hidden" name="id" value="${userStatus}"/>
            영화 : <br>
            <p>
              <select name="movie">
                <option value="">영화선택</option>
                ${movie_select_list}
              </select>
            </p>
            평점 : <br>
            <p><input oninput='ShowSliderValue(this.value)' type="range" name="grade" min="0" max="5" step="0.5">
            <font size=4 id = "slider_value_view">2.5</font></p>
            한줄평 : <br>
            <p>
              <textarea name="One_Eval" placeholder="한줄평"></textarea>
            </p>
            감상문 : <br>
            <p>
              <textarea name="Eval" placeholder="감상문"></textarea>
            </p>
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
    });
  }
  else if(pathname === '/create_record_process'){
    var body = '';
    var newDate = new Date();
    var date = newDate.toFormat("YYYY-MM-DD");
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);

      if(post.id != '' && post.movie != ''){
        db.query(`SELECT * FROM RECORD WHERE U_ID = ? AND M_ID = ?`, [post.id, post.movie], function(err, exist_record){
          if(exist_record == ''){
            db.query(
              `
              INSERT INTO RECORD (U_ID, M_ID, R_Date, R_One_Eval, R_Eval, R_Grade) 
              VALUES(?, ?, ?, ?, ?, ?)
              `,
              [post.id, post.movie, date, post.One_Eval, post.Eval, post.grade], 
              function(error, result){
                  if(error){
                      throw error;
                  }
              }
            );
  
            db.query(`SELECT AVG(R_Grade) AS AVG FROM RECORD WHERE M_ID = ?`, [post.movie], function(error2, result2){
              if(error2){
                throw error2;
              }
              db.query(`UPDATE MOVIE SET M_AvgGrade = ? WHERE M_ID = ?`, [result2[0].AVG, post.movie], function(error3, result3){
                if(error3){
                  throw error3;
                }
              });
            });
  
            db.query(`SELECT SUM(M_RunningTime) AS SUM FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE U_ID = ?`, [post.id], function(error2, result2){
              if(error2){
                throw error2;
              }
              db.query(`UPDATE USER SET U_Time = ? WHERE U_ID = ?`, [result2[0].SUM, post.id], function(error3, result3){
                if(error3){
                  throw error3;
                }
              });
            });
    
            response.writeHead(302, {Location: `/my_record`, 'Content-Type':'text/html; charset=utf-8'});
            response.end();
          }
          else{
            var title = '등록 실패';
            var description = '이미 존재하는 감상문입니다.';
            var list = '';
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create_record">감상문쓰기</a>`,
              userStatus
            );
            response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
            response.end(html);
          }
        })
      }
      else{
        var title = '등록 실패';
        var description = '영화를 선택하지 않았습니다.';
        var list = '';
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create_record">감상문쓰기</a>`,
          userStatus
        );
        response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        response.end(html);
      }
    });
  }
  else if(pathname === '/update_record'){     //감상평 수정하기
    db.query(`SELECT * FROM RECORD WHERE U_ID = ? AND M_ID = ?`, [queryData.uid, queryData.mid], function(error, record){
      var title = '감상평 남기기';
      var list = '<br>';
      var html = template.HTML(title, list,
          `
          <form action="/update_record_process" method="post">
            <input type="hidden" name="id" value="${queryData.uid}"/>
            <input type="hidden" name="movie" value="${queryData.mid}"/>
            평점 : <br>
            <p><input oninput='ShowSliderValue(this.value)' type="range" name="grade" min="0" max="5" step="0.5" value="${record[0].R_Grade}" />
            <font size=4 id = "slider_value_view">${record[0].R_Grade}</font></p>
            한줄평 : <br>
            <p>
              <textarea name="One_Eval" placeholder="한줄평">${record[0].R_One_Eval}</textarea>
            </p>
            감상문 : <br>
            <p>
              <textarea name="Eval" placeholder="한줄평">${record[0].R_Eval}</textarea>
            </p>
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
    });

    db.query(`SELECT * FROM MOVIE ORDER BY M_Name`, function(error, movies){
      
    });
  } 
  else if(pathname === '/update_record_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);

      if(post.id != '' && post.movie != ''){
        db.query(
            `
            UPDATE RECORD SET R_One_Eval = ?, R_Eval = ?, R_Grade = ? WHERE U_ID = ? AND M_ID = ?
            `,
            [post.One_Eval, post.Eval, post.grade, post.id, post.movie], 
            function(error, result){
                if(error){
                    throw error;
                }
            }
        );

        db.query(`SELECT AVG(R_Grade) AS AVG FROM RECORD WHERE M_ID = ?`, [post.movie], function(error2, result2){
          if(error2){
            throw error2;
          }
          db.query(`UPDATE MOVIE SET M_AvgGrade = ? WHERE M_ID = ?`, [result2[0].AVG, post.movie], function(error3, result3){
            if(error3){
              throw error3;
            }
          });
        });

        db.query(`SELECT SUM(M_RunningTime) AS SUM FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE U_ID = ?`, [post.id], function(error2, result2){
          if(error2){
            throw error2;
          }
          db.query(`UPDATE USER SET U_Time = ? WHERE U_ID = ?`, [result2[0].SUM, post.id], function(error3, result3){
            if(error3){
              throw error3;
            }
          });
        });

        response.writeHead(302, {Location: `/my_record`, 'Content-Type':'text/html; charset=utf-8'});
        response.end();
      }
      else{
        var title = '등록 실패';
        var description = '영화를 선택하지 않았습니다.';
        var list = '';
        var html = template.HTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create_record">감상문쓰기</a>`,
          userStatus
        );
        response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        response.end(html);
      }
    });
  } 
  else if(pathname === '/delete_record_process'){     //감상평 삭제
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('DELETE FROM RECORD WHERE U_ID = ? AND M_ID = ?', [post.uid, post.mid], function(error, result){
            if(error){
              throw error;
            }
          });

          db.query(`SELECT AVG(R_Grade) AS AVG FROM RECORD WHERE M_ID = ?`, [post.mid], function(error2, result2){
            if(error2){
              throw error2;
            }
            db.query(`UPDATE MOVIE SET M_AvgGrade = ? WHERE M_ID = ?`, [result2[0].AVG, post.mid], function(error3, result3){
              if(error3){
                throw error3;
              }
            });
          });
  
          db.query(`SELECT SUM(M_RunningTime) AS SUM FROM RECORD INNER JOIN MOVIE ON RECORD.M_ID = MOVIE.M_ID WHERE U_ID = ?`, [post.uid], function(error2, result2){
            if(error2){
              throw error2;
            }
            db.query(`UPDATE USER SET U_Time = ? WHERE U_ID = ?`, [result2[0].SUM, post.uid], function(error3, result3){
              if(error3){
                throw error3;
              }
            });
          });

          response.writeHead(302, {Location: `/my_record`, 'Content-Type':'text/html; charset=utf-8'});
          response.end();
      });
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
    db.query(`SELECT * FROM GENRE`, function(error2, genres){
      var title = '회원가입';
      var list = '<br>';
      var list_g = template.genre_select_list(genres);
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
          관심장르 : <br>
          <p>
            ${list_g}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<br>`
      );
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
      response.end(html);
    });
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
              }
            );
            var i = 1;
            while(i < post.genre.length){
              db.query(`INSERT INTO INTEREST (U_ID, G_ID) VALUES(?, ?)`, [post.id, post.genre[i]], function(error2, result2){
                if(error2){
                  throw error2;
                }
              });
              i = i + 1;
            }
            response.writeHead(302, {Location: `/login`, 'Content-Type':'text/html; charset=utf-8'});
            response.end();
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
  else if(pathname === '/mypage'){
    db.query(`SELECT * FROM GENRE`, function(error, genres){
      db.query(`SELECT * FROM INTEREST WHERE U_ID = ? ORDER BY G_ID`, [userStatus], function(error2, interest){
        var title = '내 관심장르 수정하기';
        var list = '<br>';
        var list_i = template.interest_list(genres, interest);
        var html = template.HTML(title, list,
          `
          <form action="/update_interest_process" method="post">
            <p>${userStatus}님의 관심장르</p>
            관심장르 : <br>
            <p>
              ${list_i}
            </p>
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
      });
    });
  }
  else if(pathname === '/update_interest_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query(`DELETE FROM INTEREST WHERE U_ID = ?`, [userStatus], function(error2, result2){
        if(error2){
          throw error2;
        }
      });
      var i = 1;
      while(i < (post.genre.length)){
        db.query(
          `
          INSERT INTO INTEREST (U_ID, G_ID) 
          VALUES(?, ?)
          `,
          [userStatus, post.genre[i]], 
          function(error2, result2){
            if(error2){
              throw error2;
            }
          }
        );
        i = i + 1;
      }
      response.writeHead(302, {Location: `/`, 'Content-Type':'text/html; charset=utf-8'});
      response.end();
    });
  }
  else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(3000);