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
 
        if(id == null){
            res.status(400).json([{status:"idがありません。"}]);
        }
        else{
        
            var i=0;
            var result=[];
            //データベース接続
           
            mssql.connect(config,function(err){
                //エラー回数
                var error=0;
                var request=new mssql.Request();
                //パラメータ設定
                request.input('id',mssql.NVarChar,id);

                //ストリーミングを許可
                request.stream = true; 
                //クエリ実行 idがeventmemberまたはevent(開催者の時)に含まれるところのevent情報を検索
                request.query('SELECT eventmember.eventnum,event.eventname,event.eventdate,event.eventcity,event.eventplace From dbo.event,dbo.eventmember WHERE event.eventnum= eventmember.eventnum and ((eventmember.id=@id) or (event.id=@id)) and event.eventdate>DATEADD(HOUR, +9, GETDATE())');
                
                request.on('recordset', function(columns) {
                    // レコードセットを取得するたびに呼び出される
                });
                request.on('row', function(row) {
                    // 行を取得するたびに呼ばれる
                    // 配列パラメータ変更
                    row.num=row.eventnum;
                    row.city=row.eventcity;
                    row.place=row.eventplace;
                    row.userid=id;
                    delete row.eventcity;
                    delete row.eventnum;
                    delete row.eventplace;
                    //配列に行を追加
                    row.userid=id;

                    result[i]=row;
                    i++;
                });
        
                request.on('error', function(err) {
                    // エラーが発生するたびによばれる
                    error++;
                    console.log(err);
                   
                });
        
                request.on('done', function(returnValue) {
                    // 常時最後によばれる,テーブルの表示
                    if(error==0){
                        res.status(200).json(result);     
                    }
                    else{
                        res.status(400).json({msg:"データベースから取り出す際にエラー"})
                    }

                });                    
                
            });
        }
    }
};
module.exports = api;
