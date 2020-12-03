var sanitizeHtml = require('sanitize-html');

module.exports = {
  USER:function(userStatus){
    if(userStatus == ''){
      return '<a href="/login">로그인</a><a href="/register">회원가입</a>';
    }
    else{
      return `<a href="/mypage">${userStatus}</a><a href="/logout">로그아웃</a>`;
    }
  },

  HTML:function(title, list, body, control, userStatus=''){
    userStatus = this.USER(userStatus);
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="uft-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>마이무비-${title}</title>

        <!-- 합쳐지고 최소화된 최신 CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <!-- 합쳐지고 최소화된 최신 자바스크립트 -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        <script src='https://kit.fontawesome.com/a076d05399.js'></script>
        
        <style>
        .jumbotron{
          background-color: black !important;
          color: black !important;
          padding-left: 0% !important;
          padding-right: 0% !important;
          padding-bottom: 0% !important;
          padding-top: 0% !important;
        }
        
        .jumbotron h1{
            font-size: 400%;
        }
        
        .jumbotron-image{
            padding: 30px;
            background-image: url('https://postfiles.pstatic.net/MjAyMDExMjlfMTg0/MDAxNjA2NTg5NDQ4NjI3.EVhou-Oj0sOlBtkC7Y9arbkuARzUzEYOvwVBFj3u7swg.T6u7o5EgRVJwqorGqu4Rc7PUG4QWxiVVG34FoQ4I2d8g.JPEG.tkddms4199/main_banner.jpg?type=w773');
            background-position: center center;
            background-repeat: repeat-x;
            background-size: auto 100%;
        }
        
        .jumbotron a{
            color: black;
        }
        
        .jumbotron a:hover{
            color: rgb(95, 95, 95);
            text-decoration: none;
        }
        
        #main_menu{
            background-color: black;
            margin: 0%;
            overflow: hidden;
            height: auto;
            padding: 13px;
        }
        
        #main_menu a{
            padding-top: 20px;
            padding-bottom: 20px;
            padding-left: 20px;
            padding-right: 20px;
            margin: 20px;
            color: whitesmoke;
        }
        
        #main_menu a:hover{
            background-color: whitesmoke;
            color: black;
        }
        
        #top_menu a{
            padding-top: 5px;
            padding-bottom: 5px;
            padding-left: 10px;
            padding-right: 10px;
            margin-left: 10px;
            background-color: black;
            color: whitesmoke;
            border-radius: 10px;
        }
        
        footer{
            background-color: black;
            color: whitesmoke;
            padding: 10px;
        }
        
        #footer_menu, #footer_info{
            display: inline-table;
            padding: 20px;
            margin: 20px;
            border: solid 1px whitesmoke;
        }
        
        #footer_menu a{
            display: table-row;
            height: 30px;
            color: whitesmoke;
        }
        
        .main_content{
            height: auto;
            text-align: center;
        }
        </style>

        <script language = "javascript">
          function ShowSliderValue(sVal)
          {
            var obValueView = document.getElementById("slider_value_view");
            obValueView.innerHTML = sVal
          }
        </script>

    </head>
    <body>
    <!-- 타이틀 -->
    <div class="jumbotron text-center">

        <div class="jumbotron-image">
            <br>
            <!-- 최상단 메뉴 -->
            <div id="top_menu" class="container-fluid text-right">
                ${userStatus}
            </div>
            <!-- end 최상단 메뉴 -->

            <!-- 메인 타이틀 -->
            <h1><a href="/" target="_self">마이무비저장소</a></h1>
            <h3>Store &amp; Share Your Movie Reviews</h3><br>
            <!-- end 메인 타이틀-->
            <br>
        </div>

        <!-- 메인 메뉴 -->
        <div id="main_menu" class="container-fluid text-center">
            <a href="/search" target="_self">
                <span>검색</span>
            </a>
            <a href="/movie" target="_self">
                <span>장르별 모아보기</span>
            </a>
            <a href="/create_record" target="_self">
                <span>감상평 남기기</span>
            </a>
            <a href="/my_record" target="_self">
                <span>나의 감상평</span>
            </a>
        </div>
        <!-- end 메인 메뉴-->

      </div>
      <!-- end 타이틀 -->
      
      ${body}

      ${control}

      ${list}

      <footer class="text-center">
        <div id="footer_content">
          <!-- footer 메뉴 -->
          <div id="footer_menu" class="text-left">
            <p><strong>All Menu</strong></p>
            <a href="/search" target="_self">
                <span>검색</span>
            </a>
            <a href="/movie" target="_self">
                <span>장르별 모아보기</span>
            </a>
            <a href="/create_record" target="_self">
                <span>감상평 남기기</span>
            </a>
            <a href="/my_record" target="_self">
                <span>나의 감상평</span>
            </a>
          </div>
          <!-- end footer 메뉴-->

          <div id="footer_info" class="text-left">
            <p>DataBaseSystem Project</p>
            <p>Team Name : 벤토리</p>
            <p>
            Team Member : <br>
            소프트웨어학과 2014041012 오병현<br>
            소프트웨어학과 2018038021 윤상은<br>
            소프트웨어학과 2018038023 권주현
            </p>
          </div>
        </div>

        <br>
        <p>Copyright 2020. 벤토리 all rights reserved.</p>
      </footer>
    </body>
    </html>
    `;
  },
  
  movie_list:function(movies){
    var list = '<ul>';
    var i = 0;

    while(i < movies.length){
      list = list + `
                    <li>
                      <a href="/movie?id=${movies[i].M_ID}">${sanitizeHtml(movies[i].M_Name)}</a>
                    </li>
                    <img src=${movies[i].M_Poster} height=300/>
                    `;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },

  genre_list:function(genres){
    var list = '<ul>';
    var i = 0;

    while(i < genres.length){
      list = list + `
                    <li>
                      <a href="/movie?category=${genres[i].G_ID}">${sanitizeHtml(genres[i].G_Category)}</a>
                    </li>
                    `;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },

  record_list:function(records){
    var list = '<ul>';
    var i = 0;

    while(i < records.length){
      list = list + `<li><a href="/record?uid=${records[i].U_ID}&mid=${records[i].M_ID}">${sanitizeHtml(records[i].M_Name)}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },

  my_record_list:function(records){
    var list = `<h2>나의 감상평</h2>
                <ul>`;
    var i = 0;

    while(i < records.length){
      list = list + `
                    <li><a href="/record?uid=${records[i].U_ID}&mid=${records[i].M_ID}">${sanitizeHtml(records[i].M_Name)}</a></li>
                    <img src=${records[i].M_Poster} height=300/>
                    `;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },

  one_eval_list:function(records){
    var list = '<ul>';
    var i = 0;

    while(i < records.length){
      list = list + `<li>${sanitizeHtml(records[i].R_One_Eval)}</li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },

  movie_detail:function(movie){
    var body = '';

    body = body + `
                  <h2>${movie[0].M_Name}</h2>
                  <img src=${movie[0].M_Poster} height=500/>
                  <p>감독 : ${movie[0].M_Director}</p>
                  <p>개봉년도 : ${movie[0].M_RelYear}</p>
                  <p>관람등급 : ${movie[0].M_Rank}</p>
                  <p>상영시간 : ${movie[0].M_RunningTime}</p>
                  <p>평점 : ${movie[0].M_AvgGrade}</p>
                  `;

    return body;
  },

  record_detail:function(record){
    var body = '';

    body = body + `
                  <h2>${record[0].M_Name}</h2>
                  <img src=${record[0].M_Poster} height=500/>
                  <p>작성일 : ${record[0].R_Date}</p>
                  <p>평점 : ${record[0].R_Grade}</p>
                  <p>한줄평 : ${record[0].R_One_Eval}</p>
                  <p>감상문 : ${record[0].R_Eval}</p>
                  `;

    return body;
  },

  movie_select_list:function(movies){
    var list = '';
    var i = 0;

    while(i < movies.length){
      list = list + `<option value="${movies[i].M_ID}">${movies[i].M_Name}-${movies[i].M_Director}</option>`;
      i = i + 1;
    }

    return list;
  },

  genre_select_list:function(genres){
    var list = '<input type="hidden" name="genre" value="temp" checked>';
    var i = 0;

    while(i < genres.length){
      list = list + `<label><input type="checkbox" name="genre" value="${genres[i].G_ID}">${genres[i].G_Category}</label>`;
      i = i + 1;
    }

    return list;
  },

  interest_list:function(genres, interest){
    var list = '<input type="hidden" name="genre" value="temp" checked>';
    var i = 0;
    var j = 0;

    while(i < genres.length){
      if(j < interest.length){
        if(interest[j].G_ID == genres[i].G_ID){
          list = list + `<label><input type="checkbox" name="genre" value="${genres[i].G_ID}" checked>${genres[i].G_Category}</label>`;
          j = j + 1;
        }
        else{
          list = list + `<label><input type="checkbox" name="genre" value="${genres[i].G_ID}">${genres[i].G_Category}</label>`;
        }
        i = i + 1;
      }
      else{
        list = list + `<label><input type="checkbox" name="genre" value="${genres[i].G_ID}">${genres[i].G_Category}</label>`;
        i = i + 1;
      }
      
    }

    return list;
  }
}
