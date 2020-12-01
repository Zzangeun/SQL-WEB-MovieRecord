module.exports = {
    isOwner:function(request, response) {
        if (request.user) {
            return true;
        } else {
            return false;
        }
    },
    statusUI:function(request, response) {
        var authStatusUI = '<a href="/login">로그인</a><a href="/register">회원가입</a>'
        if (this.isOwner(request, response)) {
            authStatusUI = `${request.user.nickname}<a href="/logout">로그아웃</a>`;
        }
        return authStatusUI;
    }
}


// var db = require('./db');
// var template = require('./template.js');

// exports.home = function(request, response){
//     db.query(`SELECT * FROM RECORD`, function(error,topics){
//         db.query(`SELECT * FROM author`, function(error2,authors){
//             var title = 'author';
//             var list = template.list(topics);
//             var html = template.HTML(title, list,
//             `
//             ${template.authorTable(authors)}
//             <style>
//                 table{
//                     border-collapse: collapse;
//                 }
//                 td{
//                     border:1px solid black;
//                 }
//             </style>
//             `,
//             `<a href="/create">create</a>`
//             );
//             response.writeHead(200);
//             response.end(html);
//         });
//     });
// }