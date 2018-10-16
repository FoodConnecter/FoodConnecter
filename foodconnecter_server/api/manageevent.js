//sqlデータベース設定
var mssql = require('mssql');

var conf=require('../dbpass/dbpass.js');
var config=conf.config;

var result=[];

//イベント名取得
function selectevent(query,callback){
    //var result=[];
    var i=0;
    var request=new mssql.Request();
    //ストリーミングを許可
    console.log(query.id);
    request.stream = true; 
    request.input("id",mssql.NVarChar,query.id);
    request.input("eventnum",mssql.Int,query.eventnum);
    request.query('select eventname,eventplace,eventcity,eventdate From dbo.event WHERE eventnum = @eventnum and id = @id');
    //request.query('select eventmember.id,uinfo.username From dbo.eventmember,dbo.uinfo WHERE eventmember.eventnum = @eventnum and eventmember.id=uinfo.id');
    console.log("1");
    console.log("selectevent");

    request.on('recordset',function(columns){
        //レコードセット取得
    });
    request.on('row',function(row){
        //行の取得
        row.date=row.eventdate;
        delete row.eventdate;
        result[i]=row;
        i++;
        
        console.log(i);
    });
    request.on('error',function(err){
        //res.status(200).json([{status:"データベースから取り出す際にエラーがでました"}]);
    });
    
    request.on('done',function(returnValue){
        setTimeout(function() {
            callback(i);
        }, 0);
        
    });    

};

//
function selectmember(query,callback){
    var member=[];
    var i=0;
    var request=new mssql.Request();
    //ストリーミングを許可
    console.log(query.id);
    request.stream = true; 
    request.input("id",mssql.NVarChar,query.id);
    request.input("eventnum",mssql.Int,query.eventnum);
    request.query('select eventmember.id,uinfo.username From dbo.eventmember,dbo.uinfo WHERE eventmember.eventnum = @eventnum and eventmember.id=uinfo.id');
    
    console.log("good");
    console.log("selectmember");
    
    //res.send(a);
    request.on('recordset',function(columns){
        //レコードセット取得
    });
    request.on('row',function(row){
        //行の取得
        member[i]=row;
        i++;
        
        //console.log(i);
    });
    request.on('error',function(err){
        //res.status(200).json([{status:"データベースから取り出す際にエラーがでました"}]);
    });
    
    request.on('done',function(returnValue){
        callback(member);
        
    });    

}

//欲しい食べ物
function selectwanted(query,callback){
    var wanted=[];
    //result.members=member;
    console.log(result);
    var i=0;
    var request=new mssql.Request();
    //ストリーミングを許可
    console.log(query.id);
    request.stream = true; 
    request.input("eventnum",mssql.Int,query.eventnum);
    request.query('select eventfood.foodname From dbo.eventfood WHERE eventfood.eventnum = @eventnum');
    //request.query('select eventmember.id,uinfo.username From dbo.eventmember,dbo.uinfo WHERE eventmember.eventnum = @eventnum and eventmember.id=uinfo.id');
    console.log("5");
    console.log("selectwanted");
    
    //res.send(a);
    request.on('recordset',function(columns){
        //レコードセット取得
    });
    request.on('row',function(row){
        //行の取得
        wanted[i]=row;
        i++;
        
        //console.log(i);
    });
    request.on('error',function(err){
        //res.status(200).json([{status:"データベースから取り出す際にエラーがでました"}]);
    });
    
    request.on('done',function(returnValue){
        //wantedの重複をなくす
        var arrObj = {};
        for (var i = 0; i < wanted.length; i++) {
            arrObj[wanted[i]['foodname']] = wanted[i];
        }
        wanted=[];
        for (var key in arrObj) {
          wanted.push(arrObj[key]);
        }
        console.log(wanted);
        callback(wanted);


    });    

}

function selectgather(query,callback){
    //result.wanted=wanted;
    var i=0;
    var request=new mssql.Request();
    var gather=[];
    //ストリーミングを許可
    console.log(query.id);
    request.stream = true; 
    request.input("eventnum",mssql.Int,query.eventnum);
    request.query('select gatherevent.food,uinfo.username From dbo.gatherevent,dbo.uinfo WHERE gatherevent.eventnum = @eventnum and uinfo.id=gatherevent.id');
    //request.query('select eventmember.id,uinfo.username From dbo.eventmember,dbo.uinfo WHERE eventmember.eventnum = @eventnum and eventmember.id=uinfo.id');
    console.log("good");
    console.log("selectgather");
    
    //res.send(a);
    request.on('recordset',function(columns){
        //レコードセット取得
    });
    request.on('row',function(row){
        //行の取得
        row.foodname=row.food;
        delete row.food;
        gather[i]=row;
        i++;
        
        //console.log(i);
    });
    request.on('error',function(err){
        //res.status(200).json([{status:"データベースから取り出す際にエラーがでました"}]);
    });
    
    request.on('done',function(returnValue){
        //console.log(result);
        
        //console.log(gather);
        setTimeout(function() {
           callback(gather); 
        }, 0);

    });    

}



var api={
    "get": function (req, res, next) {
        //urlパース設定
        var url=require('url');
        var url_parse=url.parse(req.url,true);
        var query=url_parse.query;
        
        //var result;
        
        if(query.id== null || query.eventnum==null){//何もなければ
            res.status(400).json([{status:"idまたはeventnumが入力されていません。"}]);
        }
        else{

            mssql.connect(config,function(err){
                if(err!=null){
                    console.log("error");
                    res.status(400).json([{status:"データベースへの接続が失敗しました。"}]);
                }
                else{
                    //res.json(selectevent(mssql,query));
                    //イベント情報 checkが0の時はイベントが存在しない
                    selectevent(query,function(check){
                        if(check==0){
                            res.status(400).json({msg:"nothing"});
                        }
                        else{
                            //メンバー
                            selectmember(query,function(member){
    
                                result[0]['members']=member;
                                
                                //欲しい食べ物
                                selectwanted(query,function(wanted){
                                    result[0]['wanted']=wanted;
                                    //提供済み
                                    selectgather(query,function(gather){
                                        result[0]['food']=gather;
                                        res.status(200).json(result);
                                        //responsev=result;
                                    }); 
                                });
                            });                            
                        }


                    }); 
                    
                } 
                
            });
        }
    }
};
module.exports = api;
