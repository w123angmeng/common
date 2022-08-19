const { extend } = require("vuedraggable")

export default class GZeGo {
    constructor( opt ){
        this.config = {
            roomCode:'1234',//房间号
            appid: 2312299760,
            idName: 'lys' + new Date().getTime() + '',
            nickName: 'u' + new Date().getTime(),
            server: 'wss://webliveroom-test.zego.im/ws',
            logUrl: "",
            audienceCreateRoom: true,
            publishStreamId : 'webrtc' + new Date().getTime(),
            tokenUrl:'https://wsliveroom-alpha.zego.im:8282/token',
        };
        this.zg = null;
        this.useLocalStreamList = [];
        this.localStream = MediaStream;
        //合并配置
        Object.assign(this.config,opt);
    }
    //初始化zego
    async initZeGo(){
        this.zg = new ZegoExpressEngine(this.config.appid, this.config.server);
        this.zg.setLogConfig({
            logLevel:'error', 
            remoteLogLevel:'error'
        })
    }
    //登录房间
    async loginRoom(tokenStr){
        this.zg.loginRoom(this.config.roomCode, tokenStr, { userID:this.config.idName, userName:this.config.nickName, }, { userUpdate: true });//登录房间
        // this.localStream = await 
        this.monitorZeGo();
        this.roomStreamUpdate();
        return this.zg.createStream();//创建流
        // this.zg.startPublishingStream(this.config.publishStreamId,this.localStream);//发布推流
       
    }
    //后端校验token  -->  然后登录房间
    httQuest(){
        let XMLHttp;
        let that = this;
        let  getToken;
        XMLHttp = new XMLHttpRequest();
        //从开发者后台获取token
        XMLHttp.onreadystatechange = async function() {
            if (XMLHttp.readyState == 4) {
                if (XMLHttp.status == 200) {
                    getToken = XMLHttp.responseText;
                }else {
                    alert("获取登录信息失败");
                }
            }
        };
        XMLHttp.open("GET", `${this.config.tokenUrl}?app_id=${this.config.appid}&id_name=${this.config.idName}`, false);
        XMLHttp.send();
        return that.loginRoom(getToken);
    }
    //监听房间信息
    monitorZeGo(){
        
        //订阅拉流状态回调
        this.zg.on('playerStateUpdate', result => {
            console.log('playerStateUpdate', result.streamID, result.state);
            if (result.state == 'PLAYING') {
                console.info(' play  success');
            } else if (result.state == 'PLAY_REQUESTING') {
                console.info(' play  retry');
            } else {
                if (result.errorCode == 0) {
                    console.warn('play stop ' + result.errorCode);
                } else {
                    console.error('play error ' + result.errorCode);
                }
            }
        });
        
        //房间状态更新回调
        this.zg.on('roomStateUpdate', (roomID,state,errorCode,extendedData) => {
            if (state == 'DISCONNECTED') {
                // 与房间断开了连接
                console.log('与房间断开了连接-_-!')
            }

            if (state == 'CONNECTING') {
                // 与房间尝试连接中 
                console.log('与房间尝试连接中...')
            }

            if (state == 'CONNECTED') {
                // 与房间连接成功
                console.log('与房间连接成功！')
            }
        });
        //用户进出房间回调
        this.zg.on('roomUserUpdate', (roomID, updateType, userList) => {
            console.log(`---------roomUserUpdate: room ${roomID}, user ${updateType === 'ADD' ? 'added' : 'left'} `,
                JSON.stringify(userList),
            );
        });
    }
    //
    //拉流
    roomStreamUpdate(dom){
        let that = this;
        this.zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
            if (updateType == 'ADD') {
                that.previewstate = false;
                for (let i = 0; i < streamList.length; i++) {
                    that.useLocalStreamList.push(streamList[i]);
                    let remoteStream;
                    try {
                         remoteStream = await that.zg.startPlayingStream(streamList[i].streamID);
                    } catch (error) {
                        console.error(error);
                        break;
                    }
                    if(dom){
                        dom.srcObject = remoteStream; 
                        dom.muted = false;
                    }
                }
            } else if (updateType == 'DELETE') {
                for (let k = 0; k < that.useLocalStreamList.length; k++) {
                    for (let j = 0; j < streamList.length; j++) {
                        if (that.useLocalStreamList[k].streamID === streamList[j].streamID) {
                            try {
                                that.zg.stopPlayingStream(that.useLocalStreamList[k].streamID);
                            } catch (error) {
                                console.error(error);
                            }
                            that.useLocalStreamList.splice(k, 1);
                            break;
                        }
                    }
                }
            }
        })
    }
    
}