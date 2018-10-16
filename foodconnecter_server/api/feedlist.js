//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;


function dbconnect(request,query,callback){
    var result=[];
    var i=0;
    request.input('id',mssql.NVarChar,query.id);
    //ストリーミングを許可
    request.stream=true;
    var q="SELECT uinfo.username,food.food,food.foodnum FROM dbo.uinfo,dbo.food WHERE uinfo.id=food.target_id and food.id=@id and food.receive IS NULL";
    request.query(q);
    request.on('row',function(row){
        result[i]=row;
    });
    request.on('error',function(err){
        callback("error");
        return;
    });
    request.on('done',function(returnValue){
       callback(result); 
    });
}
var api={
    "get": function (req, res, next) {
        //urlパース設定
        var url=require('url');
        var url_parse=url.parse(req.url,true);
        var query=url_parse.query;
        
        
       if(query.id==null){
           res.status(400).json({msg:"パラメータ不足"});
       }
       else{
           mssql.connect(config,function(err){
               if(err!=null){
                   res.status(400).json({msg:"データベースアクセス失敗"});
               }
               else{
                   var request=new mssql.Request();
                   //dbにアクセスしてパラメータ取得
                   dbconnect(request,query,function(result){
                       if(result=="error"){
                           res.status(400).json({msg:result});
                       }
                       else{
                           res.status(200).json(result);                      
                       }

                   });
               }
           })
       }
    }
};
module.exports = api;
