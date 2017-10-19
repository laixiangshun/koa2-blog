/**
 * Created by lailai on 2017/10/18.
 */
var router=require('koa-router')();
router.get('/yanhua',async(ctx,next)=>{
   await ctx.render('yanhua',{
        session: ctx.session
    })
});
module.exports=router;