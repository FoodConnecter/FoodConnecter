//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "post": function (req, res, next) {
        var body=req.body;
        if(body.id=="" || body.eventname=="" || body.pref=="" || body.city=="" || body.place=="" || body.eventdate==""){
            res.status(400).json([{msg:"idまたはeventnameまたはcityまたはplaceまたはeventdateが入力されていません。"}]);
        }
        else{
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{msg:"データベースとの接続に失敗"}]);
                }
                else{
                    var request=new mssql.Request();
                    //エラーチェック用
                    var errorcheck=null;
                    //var result=[];
                    //パラメータ設定
                    request.input('userid',mssql.NVarChar,body.id);
                    request.input('eventname',mssql.NVarChar,body.eventname);
                    request.input('eventcity',mssql.NVarChar,body.city);
                    request.input('eventplace',mssql.NVarChar,body.place);
                    request.input('eventdate',mssql.NVarChar,body.eventdate);
                    request.input('eventpref',mssql.NVarChar,body.pref);
                    
                    request.stream=true;                   
                    request.query('INSERT INTO dbo.event(id,eventname,eventcity,eventplace,eventdate,pref) Values(@userid,@eventname,@eventcity,@eventplace,@eventdate,@eventpref)');
                 
                                        
                    request.on('error',function(err){
                        errorcheck=err;
                    });
                    request.on('done',function(resultValue){
                        if(errorcheck==null){
                            res.status(400).json({msg:"error"});
                        }
                        else{
                            res.status(200).json([{msg:"succeed"}]);
                            //request.query('INSERT INTO dbo.eventmember(id,eventnum) select @userid,@eventnum where not exists(select * from dbo.eventmember where id=@userid and eventnum=@eventnum)');
                        }
                    });
                    //res.status(200).json([{msg:"succeed"}]);
                }
            });                 
        }
    }
};
module.exports = api;
