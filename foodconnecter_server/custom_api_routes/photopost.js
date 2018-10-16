var dbpass=require('../dbpass/dbpass.js');
//sqlデータベース設定
var mssql = require('mssql');
var config=dbpass.config;

var express=require('express');
var purl=dbpass.url;


function posturl(request,imageurl,callback){
	/*値追加*/
	request.input('image_url',mssql.NVarChar,imageurl);
	var query="INSERT INTO dbo.food(image_url) Values(@image_url)";
	request.query(query);
	callback();

}
function geturl(request,imageurl,callback){
	var j=0;
	var result={};
	var i=0;
	request.input('image_url',mssql.NVarChar,imageurl);
	var query='SELECT food.foodnum FROM dbo.food WHERE food.image_url=@image_url';
	request.query(query);
	
    request.on('row', function(row) {
        // 行を取得するたびに呼ばれる
        //配列に行を追加
        result=row;
		i++;
        
    });
    request.on('error', function(err) {
        // エラーが発生するたびによばれる
        console.log(err);
        //res.status(400).json([{msg:"データベースから取り出す際にエラーがでました"}]);
    });

    request.on('done', function(returnValue) {
        // 常時最後によばれる,テーブルの表示         
        console.log(result);
		if(i>0){
			callback(result);
		}

		console.log(j);
		j++;

    });
}


module.exports = function (){
	var router = express.Router();	
    var fs = require('fs');
    var nanoid = require("nanoid");
    //画像の保存先を指定
	
	router.post('/',function(req,res,next){

        var buffers = [];
        var cnt = 0;
        

        req.on('data', (chunk) => {
            buffers.push(chunk);
            console.log(++cnt);
        });

        req.on('end', () => {
            console.log(`[done] Image upload`);
            req.rawBody = Buffer.concat(buffers);
            //画像保存名の設定
            var imagename= nanoid(10)+Date.now()+".jpg";
            //var imagename="img.img";
            //画像保存場所
            var image="./image/"+imagename;
			
			//dbに格納する画像url
			var imageurl=purl+imagename;
			
            fs.writeFile(image, req.rawBody, 'utf-8',(err) => {
                if(err) return;
                console.log(`[done] Image save`);
                console.log("good");
				
				/*ここからdb格納 */
				mssql.connect(config,function(err){
					if(err!=null){
						res.status(400).json([{msg:'err'}]);
					}
					else{
						var request=new mssql.Request();
	                    //ストリーミングを許可
                    	request.stream = true; 

						//画像のurlを投稿→urlが格納されているテーブルの列を検索
						posturl(request,imageurl,function(){
							geturl(request,imageurl,function(result){
								res.status(200).json(result);
							});
							
						});
						
					}
				});
				
				
				
				
				
				
				
				
			});
		});
	});
	return router;
};