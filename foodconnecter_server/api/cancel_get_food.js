//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

function getcancel(request,body,query,callback){
    var error=0;
    var i=0;
    request.input('id',mssql.NVarChar,body.id);
    request.input('foodnum',mssql.NVarChar,body.foodnum);
    request.input(query);
    request.stream=true;
}

var api={
    "post": function (req, res, next) {
        var body=req.body;
        if(body.id=="" || body.foodnum==""){
            res.status(400).json({msg:"パラメータ"});
        }
        else{
            mssql.connect(config,function(err){
                var request=new mssql.Request();
                var q="UPDATE dbo.food SET food.target_id=NULL WHERE food.id=@id and food.foodnum=@foodnum";
                
                getcancel(request,body,q,function(result){
                   if(result=="error"){
                       res.status(400).json({msg:result});
                   } 
                   else{
                       res.status(200).json({msg:result});
                   }
                });
                //
            });
        }
    }
};
module.exports = api;
