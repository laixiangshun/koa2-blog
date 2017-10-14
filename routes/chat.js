/**
 * Created by lailai on 2017/10/14.
 */
var router=require('koa-router')();
var checkNotLogin=require('../middlewares/check.js').checkNotLogin;
var checkLogin=require('../middlewares/check.js').checkLogin;

router.get('/chat',async(ctx,next)=>{
    await checkLogin(ctx);
    await ctx.render('chat',{
        session: ctx.session
    })
});
module .exports=router;