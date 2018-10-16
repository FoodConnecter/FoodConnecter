//sqlデータベース設定
var mssql = require('mssql');
var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "post" : function(req,res,next){
        var body=req.body;
        if(body.id==null || body.eventnum==null || body.food==null){
            res.status(200).json([{msg:"Error"}]);
        }
        else{
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{msg:'err'}]);
                }
                else{
                    var request=new mssql.Request();
                    /*値追加*/
                    request.input('id',mssql.NVarChar,body.id);
                    request.input('eventnum',mssql.Int,body.eventnum);
                    request.input('food',mssql.NVarChar,body.food);
                    request.query('INSERT INTO dbo.gatherevent(id,eventnum,food) VALUES(@id,@eventnum,@food)');
                    res.status(200).json([{msg:'succeed'}]);
                }
            });
        }
    }
};
module.exports = api;