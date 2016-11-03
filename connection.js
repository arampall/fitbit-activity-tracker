/**
 * Created by achyu on 02-Nov-16.
 */
var mysql= require('mysql');

function Connection(){
    this.pool=null;

    this.init=function(){
        this.pool=mysql.createPool({
            connectionLimit:10,
            host:'localhost',
            user:'root',
            password:'',
            database:'nursing'
        });
    };
    this.acquire=function(callback){
        this.pool.getConnection(function(err,connection){
            callback(err,connection);
        });
    };
}

module.exports=new Connection();

