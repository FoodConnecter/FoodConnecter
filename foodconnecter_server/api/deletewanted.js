//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

//欲しいものリストを削除
function delwanted(param,query,request,callback){
    //エラー検知用
    var i=0;
    //パラメータ生成
    request.input('id',mssql.NVarChar,param.id);
    request.input('eventnum',mssql.Int,param.eventnum);
    request.input('foodname',mssql.NVarChar,param.foodname);
    request.stream=true;
    //クエリ実行
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
            console.log("success");
        }
    });
}

var api={
    "delete": function (req, res, next) {
        //urlパース設定
        var url=require('url');
        var url_parse=url.parse(req.url,true);
        var param=url_parse.query;
        if(param.id==null || param.eventnum==null || param.foodname==null){
            res.status(400).send();
        }
        else{
            //クエリの書き込み
            var query="DELETE FROM dbo.eventfood WHERE eventfood.foodname=@foodname and eventfood.eventnum=@eventnum and eventfood.id=@id";
            
            mssql.connect(config,function(err){
                console.log("connected");
                var request=new mssql.Request();
                //欲しいものリストを削除
                delwanted(param,query,request,function(result){
                    if(result=="error"){
                        res.status(400).send();
                    }  
                    else{
                        res.status(200).send();
                    }
                });
            });            
        }
    }
};

module.exports =api; 
