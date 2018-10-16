//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

function receivefood(request,body,query,callback){
    var i=0;
    request.input('id',mssql.NVarChar,body.id);
    request.input('foodnum',mssql.Int,body.foodnum);
    request.stream=true;
    request.query(query);
    request.on('error',function(err){
        i++;
        console.log(err);
    });
    request.on('done',function(returnValue){
         if(i>=1){
             callback("error");
         }
         else{
             callback("success");
         }
    });
    
}
var api={
    "post": function (req, res, next) {
        var body=req.body;
        if(body.id==""||body.foodnum==""){
            res.status(400).json({msg:"パラメータ不足"});
        }
        else{

            //クエリ
            var query="UPDATE dbo.food SET receive=@id WHERE foodnum=@foodnum and receive IS NULL and target_id=@id";
            mssql.connect(config,function(err){
                var request=new mssql.Request();
                receivefood(request,body,query,function(result){
                    if(result=="error"){
                        res.status(400).json({msg:result});
                    }
                    else{
                        res.status(200).json({msg:result});
                    }
                });
            });
        }
    }
};
module.exports = api;
