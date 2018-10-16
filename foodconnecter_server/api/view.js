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
        var city=query.city;
        if(id == null || city ==null){
            res.status(200).json([{status:"idまたはcityが入力されていません"}]);
        }
        else{
        

            var i=0;
            var result=[];
            //データベース接続
           
            mssql.connect(config,function(err){
                //エラーがあるとき
                console.log(err);
                if(err!=null){
                    res.status(400).json([{msg:"データベースにアクセスできませんでした。"}]);
                }
                else{
                    var request=new mssql.Request();
                    //パラメータ設定
                    request.input('id',mssql.NVarChar,id);
                    request.input('city',mssql.NVarChar,city);
                    //ストリーミングを許可
                    request.stream = true; 
                    request.query('select uinfo.username,food.food,food.image_url,food.info,food.fooddate,food.foodnum From dbo.food,dbo.uinfo WHERE uinfo.id=food.id and uinfo.city=@city and food.fooddate>DATEADD(HOUR, +9, GETDATE()) and target_id IS NULL');
                    request.on('recordset', function(columns) {
                        // レコードセットを取得するたびに呼び出される
                    });
                    request.on('row', function(row) {
                        // 行を取得するたびに呼ばれる
                        row.id=id;
                        //配列に行を追加
                        result[i]=row;
                        i++;
                    });
            
                    request.on('error', function(err) {
                        // エラーが発生するたびによばれる
                        console.log(err);
                        res.status(400).json([{msg:"データベースから取り出す際にエラーがでました"}]);
                    });
            
                    request.on('done', function(returnValue) {
                        // 常時最後によばれる,テーブルの表示
                        
                        console.log(result);
                        res.status(200).json(result);


            
                    });                    
                }

    
            });           
        }


    }
};
module.exports = api;