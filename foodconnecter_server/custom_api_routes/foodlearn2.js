var ap_k=require('../dbpass/dbpass.js');
var iam_apikey=ap_k.iam_apikey;

var express=require('express');

module.exports = function (){
	var router = express.Router();	
    var fs = require('fs');
    var nanoid = require("nanoid");
    //画像の保存先を指定
    //var filenames;
    var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');
    var visualRecognition = new VisualRecognitionV3({
        version: '2018-03-19',
        iam_apikey: iam_apikey
    });
    
	router.post('/',function(req,res,next){
        console.log(iam_apikey);
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
            var image="./learnimage/"+imagename;
            
            //食品認識用
            /*
            var images_file=fs.createReadStream(image);
                       

            //var images_file=fs.createReadStream("./learnimage/"+imagename);
            //書き込み*/
            fs.writeFile(image, req.rawBody, 'utf-8',(err) => {
                    if(err) return;
                    console.log(`[done] Image save`);
                    console.log("good");
                    
                    var images_file=fs.createReadStream("./learnimage/"+imagename);
                    var classifier_ids=["food"]; 
                    var threshold = 0.7;
                    
                    var params={
			            images_file:images_file,
                        classier_ids:classifier_ids,
                        threshold:threshold
		            };
                    
                    visualRecognition.classify(params, (err, response)=> {
                        console.log(err);
                        if (err){
                            res.status(200).send(err);
                            return;
                        }else{
                            res.status(200).json(response);
                        }
                    });
		
                });
                console.log("good2");
                //res.send("good");
            });
            
        //res.send(req.body);
	});
	
	return router;
};