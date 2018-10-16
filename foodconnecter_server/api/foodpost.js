//sqlデータベース設定
var mssql = require('mssql');
var conf=require('../dbpass/dbpass.js');
var config=conf.config;

function postfoodinfo(request,body,callback){
    request.input('id',mssql.NVarChar,body.userid);
    request.input('foodnum',mssql.Int,body.foodnum);
    request.input('fooddate',mssql.NVarChar,body.fooddate);
    request.input('foodname',mssql.NVarChar,body.food);
    request.input('info',mssql.NVarChar,body.info);
    var query="UPDATE dbo.food SET id=@id,fooddate=DATEADD(DAY,3,@fooddate),info=@info,food=@foodname Where foodnum=@foodnum";
    request.query(query);
    callback();
}

var api={
    "post": function (req, res, next) {
        var body=req.body;
        if(body.userid==null || body.foodnum==null || body.fooddate==null || body.food==null){
            res.status(400).json([{msg:"パラメータが不足"}]);
        }
        else{

            var td=new Date(); 
            var fd=new Date(body.fooddate);
            //期限を設定
            fd.setDate(fd.getDate()+3);
            //現在時間を取得（日本標準時）
            td.setHours(td.getHours() +9);
            console.log(fd);
            console.log(td);
            if(fd<td){
                res.status(400).json([{msg:"有効期限切れです"}]);
                console.log("期限切れ");
            }
            else{
                mssql.connect(config,function(err){
                   if(err){
                       res.status(400).json([{msg:"データベースとの接続エラー"}]);
                   } 
                   else{
                       var request=new mssql.Request();
                       //投稿する
                       postfoodinfo(request,body,function(){
                           res.status(200).json([{msg:"succeed"}]);
                       });
                   }
                });                
            }

        }
    }
};
module.exports = api;
