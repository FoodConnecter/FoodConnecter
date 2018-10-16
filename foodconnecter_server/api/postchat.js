//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "post": function (req, res, next) {
        var body=req.body;
        
        var user=body.user;
        var touser=body.touser;
        var text=body.text;
        console.log(body);
        if(user == "" || touser == "" || text == ""){
            res.status(200).json([{status:"userまたはtouser、textが入力されていません。"}]);
        }
        else{
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{msg:"データベースとの接続に失敗"}]);
                }
                else{
                    var request=new mssql.Request();
                    //パラメータ
                    request.input('user',mssql.NVarChar,user);
                    request.input('touser',mssql.NVarChar,touser);
                    request.input('text',mssql.NVarChar,text);
                    
                    request.query('INSERT INTO dbo.chat(id,touser,text) VALUES(@user,@touser,@text)');
                    res.status(200).json([{msg:"succeed"}]);                    
                }
            });

        }
    }
};
module.exports = api;
