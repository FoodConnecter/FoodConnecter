//sqlデータベース設定
var mssql = require('mssql')

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "get": function (req, res, next) {
        //urlバース設定
        var url = require('url');
        var url_parse = url.parse(req.url,true);
        var query = url_parse.query;
        var i = 0;
        var result = [];
        
        if(query.pref == null){
            res.status(400).json([{msg:"県名が入力されていません"}]);
        }
        else{
            mssql.connect(config,function(err){
                if(err != null){
                    console.log('error');
                    res.status(400).json([{msg:"データベースへの接続に失敗しました。"}]);
                }
                else{
                    var request = new mssql.Request();
                    //パラメーター設定
                    request.stream = true;
                    request.input('pref',mssql.NVarChar,query.pref);
                    //時間が2時間後以降のイベントの表示
                    request.query('Select event.id,event.eventnum,event.eventname,event.eventcity,event.eventplace,event.eventdate From dbo.event where event.pref=@pref and event.eventdate>=DATEADD(HOUR,9+2,GETDATE())');
                    
                    request.on('recordset',function(columns){
                        //レコードセット取得
                    });
                    request.on('row',function(row){
                        //行の取得
                        row.userid=row.id;
                        row.num=row.eventnum;
                        row.city=row.eventcity;
                        row.place=row.eventplace;
                        delete row.eventnum;
                        delete row.eventcity;
                        delete row.eventplace;
                        delete row.id;
                        result[i]=row;
                        i++;
                        console.log(i);
                    });
                    request.on('error',function(err){
                        //res.status(400).json([{msg:"データベースから取り出す際にエラーがでました"}]);
                    });
                    
                    request.on('done',function(returnValue){
                        console.log(result);
                        res.status(200).json(result);
                    });
                    
                } 
                
            });
        }
    }
};
module.exports = api;
