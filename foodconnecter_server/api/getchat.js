//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;



var api={
    "get": function (req, res, next) {
        console.log(config);
        //urlパース設定
        var url=require('url');
        var url_parse=url.parse(req.url,true);
        var query=url_parse.query;
        
        //パラメータ取得
        var user=query.user;
        var touser=query.touser;
        if(user == null || touser==null){
            res.status(200).json([{status:"user又はtouserが入力されていません。"}]);
        }
        else{
            //sqlデータベース接続
            var i=0;
            var result=[];
            //データベース接続
            mssql.connect(config,function(err){
                //エラーがあるとき
                console.log(err);
                if(err!=null){
                    res.status(400).json([{msg:"データベースにアクセスできませんでした。"}]);
                }
                else{
                    var request=new mssql.Request();
                    //パラメータ設定
                    request.input('user',mssql.NVarChar,user);
                    request.input('touser',mssql.NVarChar,touser);
                    //ストリーミングを許可
                    request.stream = true; 
                    request.query('select chat.id,chat.text,chat.createdAt From dbo.chat WHERE (chat.id=@user and chat.touser=@touser) or (chat.touser=@user and chat.id=@touser) ');
                    request.on('recordset', function(columns) {
                        // レコードセットを取得するたびに呼び出される
                    });
                    request.on('row', function(row) {
                        // 行を取得するたびに呼ばれる
                        //配列に行を追加
                        if(row.id==user){
                            row.flag=0;
                        }
                        else{
                            row.flag=1;
                        }
                        row.datetime=row.createdAt;
                        row.username=row.id;
                        delete row.createdAt;
                        delete row.id;
                        result[i]=row;
                        i++;
                    });
            
                    request.on('error', function(err) {
                        // エラーが発生するたびによばれる
                        console.log(err);
                        //res.status(400).json([{msg:"データベースから取り出す際にエラーがでました"}]);
                        result=err;
                    });
            
                    request.on('done', function(returnValue) {
                        // 常時最後によばれる,テーブルの表示
                        var valu=[];
                        valu=result.sort(function(a,b) {
                            return (a.datetime > b.datetime ? 1 : -1);
                        });
                        console.log(valu);
                        //res.status(200).json(result);
                        res.status(200).json(valu);
                        
                    });                    
                }

    
            });  
        }
    }
};
module.exports = api;
