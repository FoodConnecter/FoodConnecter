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
        var id=query.id;
        
        if(id == null){
            res.status(200).json([{status:"idまたはcityが入力されていません"}]);
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
                    request.input('id',mssql.NVarChar,id);
                    //ストリーミングを許可
                    request.stream=true;
                    request.query('select event.eventname,event.eventnum,event.eventdate from dbo.event where event.id=@id and event.eventdate>DATEADD(HOUR, +9, GETDATE())');
                    
                    request.on('row',function(row){
                       result[i]=row;
                       i++; 
                    });
                    request.on('error',function(err){
                       res.json({status:'error'});
                       process.exit(1);
                    });
                    request.on('done',function(returnvalue){
                       res.status(200).json(result);
                    });
                }
            });
        }    
    }
};
module.exports = api;
