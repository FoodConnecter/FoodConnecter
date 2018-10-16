//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api={
    "post": function (req, res, next) {
        var body=req.body;
        if(body.id==null || body.eventnum==null){
            res.status(200).json({status:"Error"});
        }
        else{
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{status:err}]);
                }
                else{
                    var request=new mssql.Request();
                    request.input('userid',mssql.NVarChar,body.id);
                    request.input('eventnum',mssql.Int,body.eventnum);
                    //request.query('INSERT INTO dbo.eventmember(id,eventnum) Values(@userid,@eventnum)');
                    request.query('INSERT INTO dbo.eventmember(id,eventnum) select @userid,@eventnum where not exists(select * from dbo.eventmember where id=@userid and eventnum=@eventnum)');
                    
                    res.status(200).json([{msg:'succeed'}]);
                }//insert into test (ipaddr, port) select "192.168.100.100", 6379 from test where not exists (select * from test where ipaddr = "192.168.100.100" and port = 6379) limit 1
            });
        }
    }   
};
module.exports = api;
