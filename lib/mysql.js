/**
 * Created by lailai on 2017/10/11.
 */
var mysql=require('mysql');
var config=require('../config/default.js');

var pool=mysql.createPool({
    host: config.database.HOST,
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE
});
let query=function(sql,values){
    return new Promise((resolve,reject)=>{
            pool.getConnection(function(err,connection){
                if(err){
                    resolve(err);
                }else{
                    connection.query(sql,values,(err,rows)=>{
                        if(err){
                            reject(err);
                        }else{
                            resolve(rows);
                        }
                        connection.release();
                    })
                }
            })
        })
};
let users=
    `create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     pass VARCHAR(40) NOT NULL,
     PRIMARY KEY ( id )
    );`;
let posts=
    `create table if not exists posts(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     title VARCHAR(40) NOT NULL,
     content  VARCHAR(40) NOT NULL,
     uid  VARCHAR(40) NOT NULL,
     moment  VARCHAR(40) NOT NULL,
     comments  VARCHAR(40) NOT NULL DEFAULT '0',
     pv  VARCHAR(40) NOT NULL DEFAULT '0',
     PRIMARY KEY ( id )
    );`;

let comment=
    `create table if not exists comment(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     content VARCHAR(40) NOT NULL,
     postid VARCHAR(40) NOT NULL,
     PRIMARY KEY ( id )
    );`;

let createTable=function(sql){
    return query(sql,[]);
};
//建表
createTable(users);
createTable(posts);
createTable(comment);

//注册用户
let insertData=function(values){
    let sql="insert into users(name,pass) values(?,?);";
    return query(sql,values);
};
//发表文章
let insertPost=function(value){
    let sql="insert into posts(name,title,content,uid,moment) values(?,?,?,?,?);";
    return query(sql,value);
};
//更新文章评论数
let updatePostComment=function(value){
    let sql="update posts set comments=? where id=?;";
    return query(sql,value);
};
//根据名字查找用户
let findDataByName=function(name){
    let sql='SELECT * from users where name=?;';
    return query(sql,name);
};
//根据用户查找文章
let findDataByUser=function(name){
    let sql='select * from posts where name=?;';
    return query(sql,name);
};
//查找所有文章
let findAllPost=function(){
    let sql="select * from posts;";
    return query(sql);
};
//根据文章Id查找
let findDataById=function(id){
    let sql='select * from posts where id=?;';
    return query(sql,id);
};
//更新文章浏览数
let updatePostPv=function(value){
    let sql="update posts set pv=? where id=?;";
    return query(sql,value);
};
//根据文章id查找所有评论
let findCommentById=function(id){
    let sql='select * from comment where postid=?;';
    return query(sql,id);
};
//发表评论
let insertComment=function(value){
    let sql="insert into comment(name,content,postid) values(?,?,?);";
    return query(sql,value);
};
//删除评论
let deleteComment=function(commentid){
    let sql='delete from comment where id=?;';
    return query(sql,commentid);
};
//删除所有文章评论
let deleteAllPostComment=function(postid){
    let sql='delete from comment where postid=?;';
    return query(sql,postid);
};
//删除文章
let deletePost=function(postid){
    let sql='delete from posts where id=?;';
    return query(sql,postid);
};
//修改文章
let updatePost=function(value){
    let sql='update posts set title=?,content=? where id=?;';
    return query(sql,value);
};
//查找评论数
let fingCommentCount=function(postid){
    let sql='select count(1) as num from comment where postid=?;';
    return query(sql,postid);
};
module.exports={
    query,
    createTable,
    insertData,
    insertPost,
    updatePostComment,
    findDataByName,
    findDataByUser,
    findAllPost,
    findDataById,
    updatePostPv,
    findCommentById,
    insertComment,
    deleteComment,
    deleteAllPostComment,
    deletePost,
    updatePost,
    fingCommentCount
};