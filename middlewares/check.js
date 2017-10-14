/**
 * Created by lailai on 2017/10/11.
 * ¼ì²éÊÇ·ñµÇÂ¼
 */
module.exports={
    checkNotLogin:function(ctx){
        if(ctx.session && ctx.session.user){
            ctx.redirect('/posts');
            return false;
        }
        return true;
    },
    checkLogin: function(ctx){
        if(!ctx.session || !ctx.session.user){
            ctx.redirect('/signin');
            return false;
        }
        return true;
    }
};