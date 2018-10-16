//sqlデータベース設定
var mssql = require('mssql');
var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var api= {
    "post": function (req, res, next) { 
        var result=[];
        var i=0;    
        var j=0;
        var k=0;
        var l=0;
        //パラメータ取得
        var body=req.body;
        if(body.id==null || body.city==null || body.username==null || body.pref==null){//何もない
            res.status(400).json([{msg:"idまたはcityまたはusernameまたはprefがありません"}]);
        }
        else{
            mssql.connect(config,function(err){
                
                console.log(err);
                var request = new mssql.Request();
                if(err==null){
                    //ストリーミングを許可
                    request.stream = true; 
                    //データベースに登録
                    request.input('id',mssql.NVarChar,body.id);
                    request.input('city', mssql.NVarChar,body.city ); 
                    request.input('username', mssql.NVarChar,body.username ); // VARCHARだろうがNVarCharにしとかないと化ける
                    request.input('pref',mssql.NVarChar,body.pref);
                    //ユーザ名の重複を探す
                    request.query('Select id from dbo.uinfo where username=@username');
                    
                    request.on('recordset',function(columns){
                        l++;
                        console.log("l"+l);
                    });
                    request.on('row',function(row){
                        result[i]=row;
                        i++;
                        console.log(i);
                    });
                    request.on('error', function(err) {
                        // エラーが発生するたびによばれる
                        console.log(err);
                        k++;
                        console.log("k"+k);
                    });
                    request.on('done', function(returnValue) {
                        console.log("googd");
                        j++;
                        console.log("j"+j);
                    });

            
                }
                else{
                    res.status(400).send({"msg":err});
                }
                
                //重複がなければ 3.5秒後
                setTimeout(function() {
                   if(i==0){
                        request.query('INSERT INTO dbo.uinfo(id,pref,city,username) VALUES (@id,@pref,@city, @username)');
                        res.status(200).send({"msg":"success"});
                        
                    }
                    else{
                        res.status(200).send({"status":"すでに登録されています"});
                    }
                    mssql.close();
                }, 3500);


            });            
        }
        

    }
};

//api.get.access='authenticated';

module.exports = api;

