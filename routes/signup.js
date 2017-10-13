/**
 * Created by lailai on 2017/10/11.
 */
var router=require('koa-router')();
var userModel=require('../lib/mysql.js');
//加密
var md5=require('md5');
//注册页
router.get('/signup',async(ctx,next)=>{
    await ctx.render('signup',{
        session: ctx.session
    })
});
//注册提交
router.post('/signup',async(ctx,next)=>{
    console.log(ctx.request.body);
    var user={
        name: ctx.request.body.name,
        password: ctx.request.body.password,
        repeatpass: ctx.request.body.repeatpass
    };
    await userModel.findDataByName(user.name).then(result=>{
        console.log(result);
        if(result.length){
            try{
                throw Error('用户存在');
            }catch (error){
                console.log(error);
            }
            ctx.body={
                data: 1
            };
        }else if(user.password !== user.repeatpass || user.password==''){
            ctx.body={
                data: 2
            };
        }else{
            ctx.body={
                data: 3
            };
            console.log('注册成功');
            userModel.insertData([ctx.request.body.name,md5(ctx.request.body.password)]);
        }
    })
});
module.exports=router;