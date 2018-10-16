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
        var eflag=0;
        if(query.userid == null){
            res.status(400).json({status:"idが入力されていません"});
        }     
        else{
            //sqlデータベース接続
            var result={};
            
            mssql.connect(config,function(err){
                if(err!=null){
                    res.status(400).json([{msg:"データベースにアクセスできませんでした。"}]);
                }
                else{
                    var request=new mssql.Request();
                    //パラメータ設定
                    request.input('id',mssql.NVarChar,query.userid); 
                    request.stream=true;
                    request.query('select username,pref,city from dbo.uinfo where id=@id');
                    request.on('recordset',function(columns){
                        
                    });
                    request.on('row',function(row){
                        result=row;
                    });
                    request.on('error', function(err) {
                        // エラーが発生するたびによばれる
                        console.log(err);
                        //res.status(400).json([{msg:"データベースから取り出す際にエラーがでました"}]);
                        eflag=1;
                    });
            
                    request.on('done', function(returnValue) {
                        // 常時最後によばれる,テーブルの表示
                        if(eflag==1){
                            res.status(400).json({status:"データベースでエラー"});
                        }
                        else{
                            res.status(200).json(result);
                        }
                        console.log(result);
                        
                    });          
                                       
                }
                
            });
        }   
        
    }
};
module.exports = api;
