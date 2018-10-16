
var fs = require('fs.extra');
var api={
	"get": function(req,res,next){
		fs.rmrf('./learnimage/', function(err){
			if(err==1){
				res.send("err");
			}
			else{
				//res.send("succeed");
				fs.mkdirp('./learnimage/', function (err) {
					if (err) {
				  		console.error(err);
				  	} 
				  	else {
				      	res.send('pow!')
				  	}
				});
			}
		});
	}
};
module.exports = api;
