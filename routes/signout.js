/**
 * Created by lailai on 2017/10/11.
 * 登出路由
 */
var router=require('koa-router')();
var userModel=require('../lib/mysql.js');

//登出操作
router.get('/signout',async(ctx,next)=>{
    ctx.session=null;
    console.log(ctx.session);
    console.log('登出成功');
    ctx.body='true';
});
module.exports=router;
