var express=require('express');

module.exports = function () {
    //get the router Object    
    var router = express.Router();
    //var fs=require('fs');
    //画像アップロード
    var multer=require('multer');
    var nanoid = require("nanoid");
    //画像の保存先を指定
    //var filenames;
    var storage=multer.diskStorage({
        destination:'./image',
        
        filename:function(req,file,cb){
            cb(null,nanoid(10)+Date.now()+file.originalname)
        }
    });
    var upload=multer({storage:storage},
                      {limits:{ fieldSize: 25 * 1024 * 1024 }});

    //sqlデータベース設定
    var mssql = require('mssql');
    var conf=require('../dbpass/dbpass.js');
    var config=conf.config;
    //https://~の取り込み
    var url=conf.url;
    
    //画像データの受け取り    
    router.post('/',upload.single('image'),function(req,res,next){
        var file=req.file;
        //画像以外のパラメータ受け取り
        var userid=req.body.userid;
        var food=req.body.food;
        var fooddate=req.body.fooddate;
        var info=req.body.info;
        
        //エラー用
        var e=[];
        if(file==null || userid=="" || food =="" || fooddate ==""){
            var i=0;
            if(file==null){
                console.log("ファイル");
                e[i]="ファイル";
                i++;
            }
            if(userid==""){
                console.log("userid");
                e[i]="userid";
                i++;
            }
            if(food==""){
                console.log("food");
                e[i]="food";
                i++;
            }
            if(fooddate==""){
                console.log("fooddate");
                e[i]="fooddate";
                i++;
            }
            res.status(400).json([{msg:e}]);
            
            console.log("パラメータ");
        }
        else{
            //var fd=new Date(fooddate);
            var td=new Date(); 
            var fd=new Date(fooddate);
            fd.setDate(fd.getDate()+3);
            td.setHours(td.getHours() +9);
            console.log(fd);
            console.log(td);
            if(fd<td){
                res.status(200).json([{msg:"有効期限切れです"}]);
                console.log("期限切れ");
            }
            else{
                var imagename=file.filename;
                //画像のurlを格納
                var imageurl=url+imagename;
                
                mssql.connect(config,function(err){
                    if(err!=null){
                        res.status(400).json([{msg:'err'}]);
                        console.log("接続エラー");
                    }
                    
                    else{
                        var request=new mssql.Request();
                        /*値追加*/
                        request.input('id',mssql.NVarChar,userid);
                        request.input('food',mssql.NVarChar,food);
                        request.input('fooddate',mssql.NVarChar,fooddate);
                        request.input('info',mssql.NVarChar,info);
                        request.input('image_url',mssql.NVarChar,imageurl);
                        //fooddateに撮影日から3日後の日付を挿入
                        request.query('INSERT INTO dbo.food(id,food,fooddate,info,image_url) Values(@id,@food,DATEADD(DAY,3,@fooddate),@info,@image_url)'); 
                        /*値の追加*/
                        //request.query('INSERT INTO dbo.food(id,food,fooddate,info,image_url) Values(@id,@food,DATEADD(HOUR, +33, GETDATE()),@info,@image_url)'); 
                        res.status(200).json([{msg:'succeed'}]);
                    }
                });                
            }

        }
        
       
    });
    // return the router object with your code defined for the HTTP GET verb (add POST etc... if you want).
    return router;
};