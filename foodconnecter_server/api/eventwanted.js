//sqlデータベース設定
var mssql = require('mssql');
var conf=require('../dbpass/dbpass.js');
var config=conf.config;
var c=0;
//var check=0;
function checkmanage(body,request,query,callback){
    var error=0;

    //

    var result=[];
    request.input('id',mssql.NVarChar,body.id);
    request.input('eventnum',mssql.Int,body.eventnum);
    //ストリーミングを許可
    request.stream=true;
    request.query(query);
    request.on('row',function(row){
        //console.log(row);
        result[c]=row;
        c++;
        //result=row.id;
        
    });
    request.on('error',function(err){
        error+=1;
        
    });
    request.on('done',function(resultValue){
        //console.log(result);
        //console.log(c);
        if(error>=1){
            callback("error");
        }
        else{
            if(c==1){
                //管理人のとき
                if(result[c-1].id==body.id){
                    callback("ok");
                }
                else{
                    callback("notmanager");
                }                
            }

        }            

    });
}

function insertwanted(body,query,request,callback){
    var error=0;
    //他のパラメータの準備
    request.input('id',mssql.NVarChar,body.id);    
    request.input('eventnum',mssql.Int,body.eventnum);
    request.input('foodname',mssql.NVarChar,body.food);
    request.stream=true;
    request.query(query);
        request.on('error',function(err){
        error=1;
    });
    request.on('done',function(resultValue){
        console.log(resultValue);
        if(error==1){
            callback("error");
        }
        else{
            callback("ok");
        }
    });

}

var api={
    "post": function (req, res, next) {
        var body=req.body;

        
        
        if(body.id==null || body.eventnum==null || body.food==null){
            res.status(200).json({msg:"idまたはeventnum、foodが入力されていません"});
        }

        else{
            //管理者チェック用クエリ
            var checkquery="SELECT event.id FROM dbo.event WHERE event.eventnum=@eventnum and event.id=@id";
            //挿入用クエリ
            var insertquery="INSERT INTO dbo.eventfood(id,foodname,eventnum) Values(@id,@foodname,@eventnum)";
            mssql.connect(config,function(err){
                if(err){
                    res.status(400).json({msg:"データベースとの接続エラー"});
                }
                else{
                    var request=new mssql.Request();
                    //管理者チェック
                    checkmanage(body,request,checkquery,function(checkresult){

                        if(checkresult=="ok"){
                            console.log("clearcheck");
                            //リスト挿入
                            insertwanted(body,insertquery,request,function(insertresult){
                                if(insertresult=="ok"){
                                    res.status(200).json({msg:"succeed"});
                                }
                                else{
                                    res.status(400).json({msg:"error"});
                                }
                            });
                        }
                        else if(checkresult=="notmanager"){
                            res.status(400).json({msg:"notmanager"});
                        }    
                        else{
                            res.status(400).json({msg:"error"});
                        }                     
                    });



                }
            });
        }
    }
};

module.exports =api;