//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "get": function (req, res, next) {
        //urlパース設定
        var url=require('url');
        var url_parse=url.parse(req.url,true);
        var query=url_parse.query;
        //パラメータ取得
        var username=query.username;
        
        if(username == null){
            res.status(200).json([{status:"usernameが入力されていません"}]);
        }    
        else{
            var i=0;
            var result=[];
            
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{msg:"データベースにアクセスできませんでした。"}]);
                }
                else{
                    var request=new mssql.Request();
                    //パラメータ設定
                    request.input('id',mssql.NVarChar,username);
                    //ストリーミングを許可
                    request.stream=true;
                    //チャットの相手を検索
                    request.query('select chat.id,chat.touser from dbo.chat where chat.id=@id or chat.touser=@id');
                    
                    request.on('row',function(row){
                        //usernameがチャット送り主の時
                        if(row.id==username){
                            console.log("to:"+row.touser);
                            row.username=row.touser;
                            delete row.id;
                            delete row.touser;
                            result[i]=row;
                            i++;
                        }//usernameがチャットの受け手の時
                        else if(row.touser==username) {
                            console.log("u:"+row.id);
                            row.username=row.id;
                            delete row.id;
                            delete row.touser;
                            result[i]=row;
                            i++;
                        }
                    });
                    request.on('error',function(err){
                       res.json({status:'error'});
                       process.exit(1);
                    });
                    request.on('done',function(returnvalue){
                        //resultの重複をなくす
                        var arrObj = {};
                        
                        for (var i = 0; i < result.length; i++) {
                            arrObj[result[i]['username']] = result[i];
                        }
                        
                        result = [];
                        
                        for (var key in arrObj) {
                          result.push(arrObj[key]);
                        }
                        //ここまで
                        res.status(200).json(result);
                    });
                }
            });
        }    
    }
};
module.exports = api;
