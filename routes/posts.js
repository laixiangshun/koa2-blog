/**
 * Created by lailai on 2017/10/11.
 * 文章路由
 */
var router=require('koa-router')();
var userModel=require('../lib/mysql.js');
var moment=require('moment');

router.get('/',async(ctx,next)=>{
    ctx.redirect('/posts');
});
//全部文章页面
router.get('/posts',async(ctx,next)=>{
    if(ctx.request.querystring){
        console.log('ctx.request.querystring',decodeURIComponent(ctx.request.querystring.split('=')[1]));
        await userModel.findDataByUser(decodeURIComponent(ctx.request.querystring.split('=')[1]))
            .then(result=>{
                res=JSON.parse(JSON.stringify(result));
                console.log(res);
            });
        await ctx.render('posts',{
            session: ctx.session,
            posts: res
        });
    }else{
        await userModel.findAllPost().then(result=>{
            console.log(result);
            res=JSON.parse(JSON.stringify(result));
            console.log(res);
        });
        await ctx.render('posts',{
            session: ctx.session,
            posts: res
        });
    }
});
//发表文章页面
router.get('/create',async(ctx,next)=>{
    await ctx.render('create',{
        session: ctx.session
    })
});
//发表文章
router.post('/create',async(ctx,next)=>{
    console.log(ctx.session.user);
    var title=ctx.request.body.title;
    var content=ctx.request.body.content;
    var id=ctx.session.id;
    var name=ctx.session.user;
    var time=moment().format('YYYY-MM-DD HH:mm');
    console.log([name,title,content,id,time]);
    await userModel.insertPost([name,title,content,id,time]).then(()=>{
        console.log(name+'发表文章'+title+'成功');
        ctx.body='true';
    }).catch(()=>{
        console.log('发表文章失败');
        ctx.body='false';
    });
});
//查看单篇文章
router.get('/posts/:postId',async(ctx,next)=>{
    console.log(ctx.params.postId);
    // 通过文章id查找返回数据，然后增加pv 浏览 +1
    await userModel.findDataById(ctx.params.postId)
        .then(result=>{
            res=JSON.parse(JSON.stringify(result));
            res_pv=parseInt(JSON.parse(JSON.stringify(result))[0]['pv']);
            res_pv+=1;
            console.log(res);
        });
    await userModel.updatePostPv([res_pv,ctx.params.postId]);
    await userModel.findCommentById(ctx.params.postId)
        .then(result=>{
            comment_res=JSON.parse(JSON.stringify(result));
        });
    await userModel.fingCommentCount(ctx.params.postId).then(result=>{
        comment_count=parseInt(JSON.parse(JSON.stringify(result))[0]['num']);
    });
    await ctx.render('sPost',{
        session: ctx.session,
        posts: res,
        comments: comment_res,
        number: comment_count
    });
});
//发表评论
router.post('/:postId',async(ctx,next)=> {
    var name = ctx.session.user;
    var content = ctx.request.body.content;
    var postId = ctx.params.postId;
    //插入评论
    await userModel.insertComment([name, content, postId]);
    //获取文章评论数然后+1
    var res_comments;
    await userModel.findDataById(postId).then(result=>{
        res_comments = parseInt(JSON.parse(JSON.stringify(result))[0]['comments']);
        res_comments++;
    });
    await userModel.updatePostComment([res_comments,postId]).then(()=>{
        ctx.body = 'true';
        console.log('评论成功');
    }).catch(()=> {
        ctx.body = 'false';
        console.log('评论失败');
    })
});
//删除评论
router.get('/posts/:postId/comment/:commentId/remove',async(ctx,next)=>{
    var postId=ctx.params.postId;
    var commentId=ctx.params.commentId;
    //查找文章的评论数然后-1
    var res_comments;
    await userModel.findDataById(postId).then(result=>{
        res_comments=parseInt(JSON.parse(JSON.stringify(result))[0]['comments']);
        console.log('comments',res_comments);
        res_comments--;
        console.log(res_comments);
    });
    //更新文章评论数
    await userModel.updatePostComment([res_comments,postId]);
    //删除对应评论
    await userModel.deleteComment(commentId).then(()=>{
        ctx.body={
            data: 1
        };
        console.log('删除评论成功');
    }).catch(()=>{
        ctx.body={
            data: 2
        };
        console.log('删除评论失败');
    });
});
//删除文章
router.get('/posts/:postId/remove',async(ctx,next)=>{
    var postId=ctx.params.postId;
    await userModel.deleteAllPostComment(postId);
    await userModel.deletePost(postId).then(()=>{
        ctx.body={
            data: 1
        };
        console.log('删除文章成功');
    }).catch(()=>{
        ctx.body={
            data: 2
        };
        console.log('删除文章失败');
    });
});
//编辑文章页面
router.get('/posts/:postId/edit',async(ctx,next)=>{
    var postId=ctx.params.postId;
    await userModel.findDataById(postId).then(result=>{
        res=JSON.parse(JSON.stringify(result));
        console.log('修改文章',res);
    });
    await ctx.render('edit',{
        session: ctx.session,
        posts: res
    });
});
//修改文章提交
router.post('/posts/:postId/edit',async(ctx,next)=>{
    var title=ctx.request.body.title;
    var content=ctx.request.body.content;
    var id=ctx.session.id;
    var postId=ctx.params.postId;
    await userModel.updatePost([title,content,postId]).then(()=>{
        ctx.body='true';
        console.log('修改文章成功');
    }).catch(()=>{
        ctx.body='false';
        console.log('修改文章失败');
    });
});
module.exports=router;