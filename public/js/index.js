/**
 * Created by lailai on 2017/10/9.
 */
//使用window.onload在页面准备好之后实例化HiChat
window.onload=function(){
    var hichat=new HiChat();
    hichat.init();
};
//定义HiChat类
var HiChat=function(){
    this.socket=null;
};
//向原型添加义务方法
HiChat.prototype={
    //init方法初始化程序
    init:function(){
        var that=this;
        this.socket=io.connect();
        this.socket.on('connect',function(){
            document.getElementById('info').textContent='get yourself a nickname:';
            document.getElementById('nickWrapper').style.display='block';
            document.getElementById('nicknameInput').focus();
        });
        document.getElementById('loginBtn').addEventListener('click',function(){
            var nickname=document.getElementById('nicknameInput').value;
            if(nickname.trim().length!=0){
                that.socket.emit('login',nickname);
            }else{
                document.getElementById('nicknameInput').focus();
            }
        },false);
        this.socket.on('nickExisted',function(){
            document.getElementById('info').textContent='nickname is taken,choose another';
        });
        //登录成功-去除遮罩层
        this.socket.on('loginSuccess',function(){
            document.title='hichat | '+document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display='none';
            document.getElementById('messageInput').focus();
        });
        //显示系统消息
        this.socket.on('system',function(nickname,userCount,type){
            var msg=nickname+(type=='login'?' joined':' left');
            //var p=document.createElement('p');
            //p.textContent=msg;
            //document.getElementById('historyMsg').appendChild(p);
            that._displayNewMsg('system',msg,'red');
            //将在线人数显示到页面顶部
            document.getElementById('status').textContent=userCount+(userCount> 1 ? ' users':' user')+' online';
        });
        //发送消息
        document.getElementById('sendBtn').addEventListener('click',function(){
            var messageInput=document.getElementById('messageInput'),
                msg=messageInput.value,
                color=document.getElementById('colorStyle').value;
            messageInput.value='';
            messageInput.focus();
            if(msg.trim().length!=0){
                that.socket.emit('postMsg',msg,color);
                that._displayNewMsg('me',msg,color,'my');
            }
        },false);
        //显示新消息
        this.socket.on('newMsg',function(user,msg,color){
            that._displayNewMsg(user,msg,color);//将消息显示到页面中
        });
        document.getElementById('sendImage').addEventListener('change',function(){
            if(this.files.length!=0){
                var file=this.files[0];
                var reader=new FileReader();
                if(!reader){
                    that._displayNewMsg('system','你的浏览器不支持fileReader','red');
                    this.value='';
                    return;
                }
                reader.onload=function(e){
                    this.value='';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('me', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        },false);
        //显示图片信息
        this.socket.on('newImg',function(user,img){
            that._displayImage(user,img);
        });
        this._initialEmoji(); //初始化表情包

        document.getElementById('emoji').addEventListener('click',function(e){
            var emojiwrapper=document.getElementById('emojiWrapper');
            emojiwrapper.style.display='block';
            e.stopPropagation();
        },false);
        document.body.addEventListener('click',function(e){
            var emojiWrapper=document.getElementById('emojiWrapper');
            if(e.target!=emojiWrapper){
                emojiWrapper.style.display='none';
            }
        });
        document.getElementById('emojiWrapper').addEventListener('click',function(e){
            var target= e.target;
            if(target.nodeName.toLowerCase()=='img'){
                var messageInput=document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value=messageInput.value+'[emoji:'+target.title+']';
            }
        },false);
        //enter键操作登录
        document.getElementById('nicknameInput').addEventListener('keyup',function(e){
            if(e.keyCode==13){
                var nickname=document.getElementById('nicknameInput').value;
                if(nickname.trim().length!=0){
                    that.socket.emit('login',nickname);
                }
            }
        },false);
        //enter键发送消息
        document.getElementById('messageInput').addEventListener('keyup',function(e){
            var messageInput=document.getElementById('messageInput'),
                msg=messageInput.value,
                color=document.getElementById('colorStyle').value;
            if(e.keyCode==13 && msg.trim().length!=0){
                messageInput.value='';
                that.socket.emit('postMsg',msg,color);
                that._displayNewMsg('me',msg,color,'my');
            }
        },false);
        document.getElementById('clearBtn').addEventListener('click',function(){
            var childLength=document.getElementById('historyMsg').children.length;
            if(childLength>0){
                var historyMsg=document.getElementById('historyMsg');
                while(historyMsg.hasChildNodes()){
                    historyMsg.removeChild(historyMsg.firstChild);
                }
                var messageInput=document.getElementById('messageInput');
                messageInput.focus();
            }
        },false);
    },
    //显示消息
    _displayNewMsg:function(user,msg,color,isSelf){
        var container=document.getElementById('historyMsg'),
            msgToDisplay=document.createElement('p'),
            date=new Date().toTimeString().substr(0,8);
        msg=this._showEmoji(msg);//将消息中的表情转化为图片
        msgToDisplay.style.color=color || '#000';
        msgToDisplay.style.textAlign=(isSelf === 'my' ? 'right' : 'left');
        msgToDisplay.innerHTML=user+'<span class="timespan">('+date+'):</span><br/>'+'<span class="showText">'+msg+'</span>';
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },
    //显示图片
    _displayImage:function(user,imgData,color){
        var container=document.getElementById('historyMsg'),
            msgToDisplay=document.createElement('p'),
            date=new Date().toTimeString().substr(0,8);
        msgToDisplay.style.color=color || '#000';
        //msgToDisplay.style.textAlign=(isSelf === 'my' ? 'right' : 'left');
        msgToDisplay.innerHTML=user+'<span class="timespan">('+date+'):</span><br/>'+'<a href="'+imgData+'" target="_blank"><img src="'+imgData+'"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop=container.scrollHeight;
    },
    //初始化表情
    _initialEmoji:function(){
        var emojiContainer=document.getElementById('emojiWrapper'),
            docFragment=document.createDocumentFragment();
        for(var i=69;i>0;i--){
            var emojiItem=document.createElement('img');
            emojiItem.src='../content/emoji/'+i+'.gif';
            emojiItem.title=i;
            docFragment.appendChild(emojiItem);
        }
        emojiContainer.appendChild(docFragment);
    },
    //替换消息中的标志为对于的表情图片
    _showEmoji:function(msg){
        var match,result=msg,
            reg=/\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNun=document.getElementById('emojiWrapper').children.length;
        while((match=reg.exec(msg))!=null){
            //slice:从已有的数组中返回选定的元素slice(start,end)
            //start：必须，起始位置，如果值为负数时，从末尾位置往前数
            //end：可选，省略时，代表末尾位置，为负数时，从末尾位置开始计算，往前数
            emojiIndex=match[0].slice(7,-1);
            if(emojiIndex>totalEmojiNun){
                result=result.replace(match[0],'[X]');
            }else{
                result=result.replace(match[0],'<img class="emoji" src="../content/emoji/'+emojiIndex+'.gif"/>');
            }
        }
        return result;
    }
};