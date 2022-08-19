<template>
    <div class="chatContent" v-if="drawerVisible">
        <!-- <div class="motail"></div> -->
        <div class="imContent dragDom"   v-show="retreatIMState">
            <div class="chatRight">
                <div class="chatHeaderName" v-dialogDragDom v-if="isHistory">
                    <div class="patientTitle" >
                        <span>患者：{{name +'  '+ sexStr + '  '+ age }}</span>
                        <span class="onlineState" v-if="isOnline">在线</span>
                        <span clas="nolineState" v-if="!isOnline">离线</span>
                    </div>
                    <i class="el-icon-close closeBtnChat" @click="close"></i>
                    <i class="el-icon-minus put" @click="putHandle"></i>
                </div>
                <div :class="isHistory?'scroll-view':'scroll-view scroll-view-isHistory'" v-loading="loading" ref="scrollView" @scroll="handleScrollEvent">
                    <div class="chat-item" v-for="(item,index) in messageList" :key="index" :id="`id${index}`">
                        <div class="chat" :class="[item.isMy?'row-reverse':'row']">
                            <el-avatar v-if="item.isMy" class="head-img" :size="40" :src="require('@/assets/images/chat/doctor.png')"></el-avatar>
                            <el-avatar v-else class="head-img" :size="40" :src="require('@/assets/images/chat/patient.png')"></el-avatar>
                            <div class="chat-word" v-if="item.msgType == 'text'">
                                <div class="name" v-if="!item.isMy">{{chatName}}</div>
                                <div class="word" :class="[item.isMy?'my':'other']">{{item.content}}</div>
                            </div>
                            <div class="chat-word" v-if="item.msgType == 'image'"><img  :src="showImageUrl + item.content.b" @click.stop="previewImage(showImageUrl + item.content.b)" /></div>
                            <!-- @load="imgOnload" -->
                            <!-- 拒接-取消-结束等状态信息 -->
                            <div class="refuseC" v-if="(item.msgType == 'audio_video' ||item.msgType == 'audio_video_finish') && item.userType == 'P'"><i class="el-icon-video-camera patientListBtn"></i>{{item.content.showText}}</div>
                            <div class="refuseB" v-if="item.msgType == 'audio_video' && item.userType == 'D'">{{item.content.showText}}<i class="el-icon-video-camera patientListBtn" style="transform:rotate(180deg)"></i></div>
                            
                        </div>
                    </div>
                </div>
                <div class="panel" v-if="isHistory">
                    <el-form :model="formData" :rules="rules" ref="chatForm">
                        <el-form-item >
                            <el-input type="textarea"  id="chatIdss" class="messageInput"  :rows="4" resize="none"  v-model="formData.textMessage" @keyup.native="enterSendText()" @focus="changeValue(0)" placeholder="回复"></el-input>
                            
                        </el-form-item>
                        <div class="operate-area" >
                            <el-upload :show-file-list="false" :action="uploadUrl" :headers="uploadHeader" :data="uploadData" :on-success="handleAvatarSuccess"><i class="el-icon-picture"></i></el-upload>
                            <i class="el-icon-video-camera patientListBtn"  @click="voiceBtnHandle"  v-show="!isPreviewed"></i>
                            <el-button class="handleWordMessageEvnt" size="small" type="primary" @click="handleWordMessageEvnt" >发送</el-button>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>
        <!-- <el-drawer :title='`患者：${name} ${sexStr} ${age}`' size="50%" :visible="drawerVisible" :with-header="false" custom-class="my-drawer" @close="close">
            <div class="chatLeft">
                <div class="agoraRegion" v-if="rtc.agoraCreatState">
                    <div class="agoraVideoPre" id="agoraVideoPre" @mouseover="agoraMove" @mouseleave="agoraLeave"></div>
                    <div class="agoraCloseBtn" v-show="rtc.agoraCloseStatus" @mouseover="agoraMove" @click="closeVideo">
                        <i class="el-icon-phone" ></i>
                    </div>
                    
                    <div class="agoraVideoRem" id="agoraVideoRem"></div>
                </div>
            </div>
            
        </el-drawer> -->
        
        <div class="dialog" v-if="dialogVisible" @click.capture="handleMask" v-show="retreatVedioState">
            <div class="con"><img :src="viewImage" id="previewImg" />
                <!-- <div class="downlaod" @click.stop="downLoadImg"><i class="el-icon-download"></i></div> -->
            </div>
        </div>
        <div class="patientList dragDom"  v-if="isPreviewed" v-show="retreatVedioState" >
            <div v-dialogDragDom style="height:100%;">
                <div class="previewVideo"  v-show="previewstate">
                    <video ref="previewVideo" autoplay muted playsinline @mouseover="mouseoverPre" @mouseleave="mouseleavePre"></video>
                    <div class="closePhoneBtn" v-show="closePhoneBtnPre" @mouseover="mouseoverPre"   @click="closeVoiceBtnHandle">
                        <i class="el-icon-phone" ></i>
                    </div>
                    <div class="putPreVedio" @click="putPreVedio">
                        <i class="el-icon-minus" ></i>
                    </div>
                </div>
                <div class="remoteVideo"  v-show="!previewstate">
                    <video ref="remoteVideo" class="dragDom" autoplay muted playsinline  @mouseover="mouseoverRem" @mouseleave="mouseleaveRem"></video>
                    <div class="closePhoneBtn" @mouseover="mouseoverRem"  @click="closeVoiceBtnHandle" v-show="closePhoneBtnRem" >
                        <i class="el-icon-phone"></i>
                    </div>
                    <div class="putPreVedio" @click="putPreVedio">
                        <i class="el-icon-minus" ></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Socket from '@/assets/js/socket.js';
    import ISMicCam from './chat.js';
    let socketUrl = 'ws://192.168.110.55:8184/websocket?memberId=1';
    let prefixUrl = 'ws://192.168.110.55:8184/';
    import { ZegoExpressEngine } from 'zego-express-engine-webrtc';//tcpOnly 为 true 则用tcp 推拉流，false 则用udp 
    import {
        formatTime,
        showDate
    } from '@/assets/js/format.js'
    

    export default {
        name: 'ChatDrawer',
        computed: {
            isEryuan() {
                return this.$limits.isDiffInternet(this)
            },
            isAtmeng(){
                return this.$limits.isFun(this)
            },
            isJshun() {
                return this.$limits.isDiffJshun(this)        
            },
            isBren() {
                return this.$limits.isDiffBren(this)        
            },
        },
        props: {
            //弹窗的状态
            drawerVisible: {
                type: Boolean,
                default: false,
                require: true
            },
            //IM状态
            retreatIMState: {
                type: Boolean,
                default: false,
                require: true
            },
            //vedio状态
            retreatVedioState: {
                type: Boolean,
                default: false,
                require: true
            },
            isHistory:{//聊天还是历史记录
                type:Boolean,
                default:true
            },
            dataSoket:{
                type:Object,
                default:function(){
                    return {
                        doctorId:'M0050'
                    }
                }
            }
        },
        data() {
            return {
                socketType:'D',
                currentIndex:0,
                patiendListData:[],//患者列表
                uploadUrl: window.globalUrl.chatHttptUrl + `/chat/fileupload3`,//图片上传地址
                showImageUrl: window.globalUrl.chatImageUrl,    // 图片显示地址
                uploadData: {
                    type: 0
                },
                uploadHeader: {
                    token: sessionStorage.getItem('token')
                },
                formData: {
                    textMessage: '',
                },
                loading: false,
                patientId: '', 
                chatName: '',
                name: '',
                sexStr: '',
                age: '',
                customerId: 1,
                messageList: [],
                dialogVisible: false,
                viewImage: '',
                socket:null,//测试
                frequency:1,//执行频率
                rules: {
                    textMessage: [{
                        required: true,
                        message: '回复内容不能为空',
                        trigger: 'blur'
                    }]
                },
                ops: {
                    bar: {
                        background: '#000'
                    }
                },
                isOnline:false,//患者状态
                //测试音频数据
                rtc_config:{
                    appid: '',
                    server: '',
                    logUrl: "",
                    nickName:'D'+new Date().getTime(),
                    roomID:'',//房间ID
                },
                zg:null,
                saveRoomIdStatus: false,    //房间号保存状态
                appid : '', // 必填，应用id，请从 即构管理控制台-https://console.zego.im/acount/register 或邮件中获取
                publishStreamId : 'webrtc' + new Date().getTime(),
                previewVideo: HTMLVideoElement,
                useLocalStreamList:[],
                remoteVideo:HTMLVideoElement,
                localStream:MediaStream,
                previewstate:true,//预览视频
                isPreviewed:false,//未开启视频 
                isMicrophoneBtn:false,//音频按钮状态
                channel:1,//渠道 1 zego 2 声网  3 腾讯云
                //挂断按钮状态
                closePhoneBtnPre:false,
                closePhoneBtnRem:false,
                duration:0,//视频时长
                setTime:null,//定时器
                //声网测试数据start
                rtc:{
                    client: null,//音频对象
                    joined: false,//加入频道
                    published: false,//推流状态
                    localStream: null,//本地流
                    remoteStreams: [],//远程流
                    params: {},//参数
                    agoraCloseStatus:false,//关闭按钮状态
                    agoraCreatState:false,//打开音频
                },
                option:{
                    appID: "",
                    channel: "",
                    uid: null,
                    token:""
                },
                //腾讯云
                TCloud:{
                    mode: 'rtc',
                    sdkAppId:'',
                    userId:'',
                    userSig:'',
                    roomId:'',
                },
                tCloudClient:null,//腾讯音频对象
                tCloudStream:null,//本地视频流
                //设备状态---麦克风-摄像头
                micCam:{
                    MediaDevices :[],
                    isHTTPs : location.protocol === 'https:',
                    canEnumerate : false,
                    hasMicrophone : false,
                    hasSpeakers : false,
                    hasWebcam : false,
                    isMicrophoneAlreadyCaptured : false,
                    isWebcamAlreadyCaptured : false,
                    skip:false,
                    isMicState:true,//麦克风
                    isCamState:true,//摄像头
                },
                // retreatIMState:true,//聊天文字窗
                // retreatVedioState:true,//聊天视频
                
                

            }
        },
        mounted() {
            window.addEventListener('scroll', this.handleScrollEvent, true);
            
        },
        created() {

            // if(this.isEryuan) {
            //     import('zego-express-engine-webrtc').then( ZegoExpressEngine => {
            //     })
            // }
 
            let idEmp = this.getUserStorage().idEmp;
            this.$axios.get('/org/emp/findEmpInfo', {idEmp: idEmp}).then(res => {
                if (res.success) {
                    this.dataSoket.doctorId =  res.data.empCode;
                }else{
                    this.$message({
                        type:'error',
                        message:res.message
                    })
                }
            })
            //初始化---即构测试
            this.zegoConfig();
            //初始化---声网测试
            // this.agoraInit();
            //初始化---腾讯云
            // this.tCloudInit();
            // this.handleWordMessageEvnt();
            // this.$refs.scrollView.scrollBottom = 0;

        },
        methods: {
            //移除自动获取光标文本域
            changeValue(index) {
                //初始化文本域失去焦点
                if (this.frequency == index + 1) {
                    //下面这行是关键代码，if条件判断多个文本域失去焦点
                    document.querySelectorAll("textarea")[index].blur();
                    this.frequency++;
                }
            },
            // 父组件触发
            async handleParentEvent(e) {
                this.loading = true
                // 父级点击事件的传值
                this.patientId = this.dataSoket.patientId
                this.name = e.name
                this.chatName = e.chatName
                this.sexStr = e.sexStr || ''
                this.age = e.age || ''
                this.headUrl = e.headUrl // 列表用户的头像

                // 拉取历史消息
                this.handleHistoryMessage();

                // 已读消息接口
                // await this.$axios.get('chat/archives/readMessage', {
                //    userId: this.idUser,
                //    userType: 'C'
                // })

                // 实例化 socket
                this.socket = new Socket({
                   wssurl: window.globalUrl.chatWsUrl +`/websocket4?memberId=D${this.dataSoket.doctorId}`,
                   patientId:this.dataSoket.patientId,
                   doctorId:this.dataSoket.doctorId,
                   hospitalIdVisit:this.dataSoket.hospitalIdVisit,//就诊号
                   headUrl: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqiaqbZj1uBMqSibca2HLLticePzEJnOa4KWm7m7fKmXFyOxFgnGeeTE3ufNqEYnRibSm0tKFAzVicZShg/132',
                   msgCallback: this.msgCallback,
                   windowDontHasSocketCallback: this.windowDontHasSocketCallback,
                })
            },
            //zg预览--鼠标移入
            mouseoverRem(){
                this.closePhoneBtnRem = true;
            },
            //zg预览--鼠标移出
            mouseleaveRem(){
                this.closePhoneBtnRem = false;
            },
            //zg接通--鼠标移入
            mouseoverPre(){
                this.closePhoneBtnPre = true;
            },
            //zg接通--鼠标移出
            mouseleavePre(){
                this.closePhoneBtnPre = false;
            },
            //
            //zg获取初始配置
            async zegoConfig(){
                //获取APPID SERVER
                let ajaxDataConf = await this.getConfig({audioVideoType:1}).then( (ajaxDataConf) => {
                    if(ajaxDataConf.success){
                        this.rtc_config.appid = Number(ajaxDataConf.data.appId);
                        this.rtc_config.server = ajaxDataConf.data.serverWeb;
                    }else{
                        this.$message({
                            type:'error',
                            message:ajaxDataConf.message
                        })
                    }
                })
                
                //获取动态房间号
                this.getRoomId({
                    audioVideoType:1
                }).then(async (resDate) => {
                    if(resDate.success){
                        this.rtc_config.roomID = resDate.data;
                        if(this.isJshun) {
                            this.saveRoomIdStatus = false;
                            let st = await this.saveRoomId();
                            this.saveRoomIdStatus = !!st;
                        }
                    }else{
                        this.$message({
                            type:'error',
                            message:resDate.message
                        })
                    }
                })
            },
            //开启语音开关---视频
            async voiceBtnHandle(){
                
                if(this.channel == 1){//zego
                    //判断有没有摄像头
                    this.checkDeviceSupport()
                    if(this.micCam.isMicState&&this.micCam.isCamState){
                        //开始呼叫患者
                        this.handleWordMessageEvnt('1')
                    }
                    
                
                }else if(this.channel == 2){//声网
                    this.rtc.agoraCreatState = true;//视频区打开
                    let ajaxData = await this.getRoomId({audioVideoType:2});//查房间'/频道ID
                    if(ajaxData.success){
                        this.option.channel = ajaxData.data;//频道号
                        //开始呼叫患者
                        this.handleWordMessageEvnt('1');
                    }else{
                        this.$message({
                            type:'error',
                            message:ajaxData.message
                        })
                    }
                    let ajaxDataToken =  await this.getToken({audioVideoType:2,idName:this.socketType+this.dataSoket.doctorId,channelName:this.option.channel,agoraTokenType:2});//生成token
                    if(ajaxDataToken.success){
                        this.option.token = ajaxDataToken.data;
                    }else{
                        this.$message({
                            type:'error',
                            message:ajaxDataToken.message
                        })
                    }
                    let ajaxDataConf = await this.getConfig({audioVideoType:2});//获取APPID
                    if(ajaxDataConf.success){
                        let appid = ajaxDataConf.data.appId;
                        this.option.appID = appid;//appid
                         this.rtc.client.init(appid, ()=> {
                             //加入频道
                            this.agoraAdd({ 
                                token:this.option.token, 
                                channel:this.option.channel, 
                                uid:this.socketType+this.dataSoket.doctorId
                            });
                         })
                    }else{
                        this.$message({
                            type:'error',
                            message:ajaxDataConf.message
                        })
                    }
                
                }else{//腾讯云
                    this.rtc.agoraCreatState = true;//视频区打开
                    this.tCloudInit();//初始化腾讯配置
                }
            },
            //zg关闭语音
            closeVoiceBtnHandle(){
                
                this.handleWordMessageEvnt("0");
                this.logout();
            },
            //初始化ZEGO
            initZeGo(){
                this.checkHttp();//初始化zego
            },
            //ZEGO监听
            monitorZeGo(){
                let _that_ = this;
                this.zg.on('playerStateUpdate', result => {
                    if (result.state == 'PLAYING') {
                        console.info(' play  success');
                    } else if (result.state == 'PLAY_REQUESTING') {
                        // this.$message('视频已接通');
                        // duration:0,//视频时长
                        this.setTime = setInterval(() => {
                            this.duration += 1;
                        }, 1000);
                        console.info(' play  retry');
                        console.info('result：',result);
                        _that_.previewstate = false;
                    }else if(result.state == 'PUBLISHING'){
                        //这里代表成功？
                        console.log('PUBLISHING~~~！！！！');
                    } else {
                        if (result.errorCode == 0) {
                            console.warn('play stop ' + result.errorCode);
                        } else {
                            console.error('play error ' + result.errorCode);
                        }
                    }
                });
                //推流状态
                this.zg.on('publisherStateUpdate',result => {
                    console.log('推流状态回调：',result);
                    if(result.state == 'NO_PUBLISH'){
                        // this.$message({
                        //     type:'error',
                        //     message:'推流失败'
                        // })
                    }
                })
                //推流质量
                this.zg.on('publishQualityUpdate',(result)=>{
                    console.log('推流质量：',result);
                })
                //拉流
                this.zg.off('roomStreamUpdate');
                this.zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
                    if (updateType == 'ADD') {
                        for (let i = 0; i < streamList.length; i++) {
                            _that_.useLocalStreamList.push(streamList[i]);
                            let remoteStream;
                            try {
                                remoteStream = await _that_.zg.startPlayingStream(streamList[i].streamID);
                            } catch (error) {
                                console.error(error);
                                break;
                            }
                             _that_.$refs.remoteVideo.srcObject = remoteStream; 
                            _that_.$refs.remoteVideo.muted = false;
                            
                        }
                    } else if (updateType == 'DELETE') {
                        for (let k = 0; k < _that_.useLocalStreamList.length; k++) {
                            for (let j = 0; j < streamList.length; j++) {
                                if (_that_.useLocalStreamList[k].streamID === streamList[j].streamID) {
                                    try {
                                        _that_.zg.stopPlayingStream(_that_.useLocalStreamList[k].streamID);
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    _that_.useLocalStreamList.splice(k, 1);
                                    break;
                                }
                            }
                        }
                        _that_.logout();
                    }
                });
                //监听进出房间以及网络状态
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
                this.zg.on('roomUserUpdate', (roomID, updateType, userList) => {
                    console.log('进出房间状态：',updateType)
                    
                });
            },
            async checkHttp(){
                var xmlhttp;
                let that = this;
                //初始化音频
                this.zg = new ZegoExpressEngine(this.rtc_config.appid, this.rtc_config.server);
                //德州二院
                if(this.isEryuan) {
                    this.zg.zegoWebRTC.setTurnOverTcpOnly(true);  // tcpOnly 为 true 则用tcp 推拉流，false 则用udp 
                }
                this.zg.setLogConfig({
                    logLevel:'error', 
                    remoteLogLevel:'error',
                })
                this.monitorZeGo();//开启监听
               let videoToken = await this.getToken({audioVideoType:1,idName:this.socketType+this.dataSoket.doctorId});
               if(videoToken.success){
                    let zgCreatedData = await that.zg.loginRoom(that.rtc_config.roomID, videoToken.data, { userID:'D'+this.dataSoket.doctorId, userName:that.rtc_config.nickName, }, { userUpdate: true });
                    if(zgCreatedData){
                        //
                        // this.localStream = await that.zg.createStream();
                        try {
                            this.localStream = await that.zg.createStream();
                        } catch (error) {
                            //提示用户创建刘失败   用户再次发起
                            console.log('创建流失败信息：',error);
                            // this.localStream = await that.zg.createStream();
                        }
                        this.$refs.previewVideo.srcObject = that.localStream;
                        that.zg.startPublishingStream(that.publishStreamId,that.localStream);
                        
                        //录制接口
                        this.record({roomId:that.rtc_config.roomID})
                    }else{
                        console.log('创建房间失败~')
                    }
                    
                    
               }else{
                   this.$message({
                       type:'error',
                       message:videoToken.message
                   })
               }
            },
            //zg退出音频
            async logout(){
                //停止录制
                this.stopRecord({roomId:this.rtc_config.roomID});
                // 停止推流
                if (this.isPreviewed) {
                    this.zg.stopPublishingStream(this.publishStreamId);
                    this.zg.destroyStream(this.localStream);
                    this.isPreviewed = false;
                    this.previewVideo.srcObject = null;
                }
                // 停止拉流
                for (let i = 0; i < this.useLocalStreamList.length; i++) {
                    this.useLocalStreamList[i].streamID && this.zg.stopPlayingStream(this.useLocalStreamList[i].streamID);
                }
                // 清空页面
                this.useLocalStreamList = [];
                //退出登录
                this.zg.logoutRoom(this.rtc_config.roomID);
                this.previewstate = true;//预览视频
                this.localStream = MediaStream;
                clearInterval(this.setTime);//清除定时器
                
            },
            //停止录制
            stopRecord(data){
                let ajaxUrl = '/zego/stopRecord';
                this.$axios.post(window.globalUrl.recordUrl+ajaxUrl,data)
            },
            //声网相关操作
            //Agora鼠标移入
            agoraMove(){
                this.rtc.agoraCloseStatus = true;
            },
            //移出
            agoraLeave(){
                this.rtc.agoraCloseStatus = false;
            },
            //初始化声网
            agoraInit(){
                this.rtc.client = AgoraRTC.createClient({mode: "rtc", codec: "h264"});
                //订阅远端流
                this.rtc.client.on("stream-added", function (evt) {  
                    var remoteStream = evt.stream;
                    var id = remoteStream.getId();
                    if (id !== this.rtc.params.uid) {
                        this.rtc.client.subscribe(remoteStream, function (err) {
                            console.log("流订阅失败", err);
                        })
                    }
                });
                //订阅成功播放远端流
                this.rtc.client.on("stream-subscribed",  (evt)=> {
                    var remoteStream = evt.stream;
                    var id = remoteStream.getId();
                    // 播放订阅的远程流
                    remoteStream.play("agoraVideoPre");
                    // 开始录制
                    this.record({token:this.option.token,roomId:this.option.channel});
                })
                //监听删除远端流
                this.rtc.client.on("stream-removed", function (evt) {
                    var remoteStream = evt.stream;
                    var id = remoteStream.getId();
                    // 停止录制 --- 后台直接调第三方前端不处理
                })
            },
            //获取房间/频道ID
            getRoomId(data) {
                let ajaxUrl = '/chat/audioVideo/getRoomId';
                return this.$axios.get(window.globalUrl.chatHttptUrl+ajaxUrl,data);
            },

            //保存房间/频道ID
            async saveRoomId() {
                let parmas = {
                    serviceRoomId: this.rtc_config.roomID,  //房间id,音视频服务使用的房间id
                    appId: this.rtc_config.appid,           //音视频服务AppId
                    businessType: 1,                        //业务类型 1:互联网诊疗接诊 2:会诊
                    businessId: '',                         //业务id 互联网诊疗:c端就诊id 会诊:会诊id
                    hospitalIdVisit: this.dataSoket.hospitalIdVisit,  //院内his就诊id
                }
               
                let ajaxUrl = '/chat/audioVideoRoom/saveAudioVideoRoom';
                let resData = await this.$axios._post(window.globalUrl.chatHttptUrl+ajaxUrl,parmas);
                if(resData.success) {
                    return  true;
                }
                this.$message.warning(resData.message);
                return  false
            },
            //获取agora动态token
            getToken(data){
                let ajaxUrl = '/chat/audioVideo/getLoginAccessToken';
                return this.$axios.get(window.globalUrl.chatHttptUrl+ajaxUrl,data);
            },
            //获取第三方配置(1机构，2声网，3腾讯云)
            getConfig(data){
                let ajaxUrl = "/chat/audioVideo/getInitConfig";
                return this.$axios.get(window.globalUrl.chatHttptUrl + ajaxUrl,data);
            },
            //agora加入频道
            agoraAdd({token,channel,uid}){
                //加入频道
                this.rtc.client.join(token, channel, uid , (uid) => {
                    console.log("加入频道: " + channel + " 成功, uid: " + uid);
                    //发布本地流
                    this.rtc.localStream = AgoraRTC.createStream({
                        streamID: uid,
                        audio: true,
                        video: true,
                        screen: false,
                    })
                    this.rtc.localStream.init( ()=> {
                        console.log("初始化本地流 success");
                        this.rtc.localStream.play("agoraVideoPre");

                        // 发布本地流
                        this.rtc.client.publish(this.rtc.localStream, (err)=> {
                            console.log("发布失败");
                            console.error(err);
                        })

                    }, function (err) {
                        console.error("初始化本地流失败 ", err);
                    });



                }, function(err) {
                    console.error("客户端加入失败", err)
                })
            },
            //agora关闭音频
            closeVideo(){
                if( this.channel == 2){
                    this.leaveAgora();//关闭声网音视频
                }else{
                    this.leaveTCloud();//关闭腾讯云音视频
                }
            },
            //关闭声网
            leaveAgora(){
                this.rtc.client.leave(()=>{
                    console.log('关闭音频了！')
                });
                //离开频道
                // Leave the channel
                this.rtc.client.leave(() => {
                    // 停止播放本地流
                    this.rtc.localStream.stop();
                    // 关闭本地流
                    this.rtc.localStream.close();
                    // 停止播放远程流并删除视图
                    while (this.rtc.remoteStreams.length > 0) {
                        var stream = this.rtc.remoteStreams.shift();
                        var id = stream.getId();
                        console.log('离开频道对象流',stream)
                        // stream.stop();
                        // removeView(id);
                    }
                    this.rtc.agoraCreatState = false;
                    console.log("客户端离开通道成功");
                }, function (err) {
                    console.log("频道离开失败");
                    console.error(err);
                })
            },
            // 录制接口
            record(data){
                let ajaxUrl;
                
                if(this.channel == 1){//zg录制
                    ajaxUrl = '/zego/startRecord';
                }else if(this.channel == 2){//agora录制
                    ajaxUrl = '/agora/startAgoraRecord';
                }else{//Tcloud录制
                    ajaxUrl = '';
                }
                this.$axios.post(window.globalUrl.recordUrl+ajaxUrl,data);
            },
            //腾讯云---集成
            async tCloudInit(){
                //获取APPID
                let conf = await this.getConfig({audioVideoType:3});
                if(conf.success){
                    this.TCloud.sdkAppId = conf.data.appId;
                }else{
                    this.$message({
                        type:'error',
                        message:conf.message
                    })
                }
                //token获取
                let token = await this.getToken({audioVideoType:3,idName:this.socketType+this.dataSoket.doctorId});
                if(token.success){
                    this.TCloud.userSig = token.data;
                }else{
                    this.$message({
                        type:'error',
                        message:token.message
                    })
                }
                //创建腾讯云音频对象
                this.tCloudClient = TRTC.createClient({
                    mode: 'rtc',
                    sdkAppId:this.TCloud.sdkAppId,
                    userId:this.socketType+this.dataSoket.doctorId,
                    userSig:this.TCloud.userSig
                })
                //获取频道(房间号)
                let roomData = await this.getRoomId({audioVideoType:3});
                if(roomData.success){
                    this.TCloud.roomId = roomData.data;
                }else{
                    this.message({
                        type:'error',
                        message:roomData.message
                    })
                }
                //进入房间
                this.tCloudClient.join({ roomId:this.TCloud.roomId })
                .catch(error => {
                    console.error('进房失败 ' + error);
                })
                .then(() => {
                    console.log('进房成功');
                });
                //创建本地流
                this.createVideoStream();
                //监听远端流
                this.subscribeStream();
            },
            //创建本地视频流
            createVideoStream(){
                this.tCloudStream = TRTC.createStream({
                    userId:this.socketType+this.dataSoket.doctorId,
                    audio:true,
                    video:true
                });
                console.log('视频本地流：', this.tCloudStream);
                //初始化本地视频流
                this.tCloudStream.initialize()
                .catch(error => {
                    console.error('初始化本地流失败 ' + error);
                })
                .then(() => {
                    console.log('初始化本地流成功');
                    //播放本地流
                    this.tCloudStream.play('agoraVideoPre');
                    //发布本地流
                    this.releaseLocalStream();
                });
                
            },
            //发布本地流
            releaseLocalStream(){
                //发布本地流
                this.tCloudClient.publish(this.tCloudStream)
                .catch(error => {
                    console.error('本地流发布失败 ' + error);
                })
                .then(() => {
                    console.log('本地流发布成功');
                });
            },
            //订阅远端音视频流
            subscribeStream(){
                this.tCloudClient.on('stream-added', event => {
                    const remoteStream = event.stream;
                    console.log('远端流增加: ' + remoteStream.getId());
                    //订阅远端流
                    this.tCloudClient.subscribe(remoteStream,{ audio: true, video: true });
                });
                this.tCloudClient.on('stream-subscribed', event => {
                    const remoteStream = event.stream;
                    console.log('远端流订阅成功：' + remoteStream.getId());
                    // 播放远端流
                    remoteStream.play('remote_stream-' + remoteStream.getId());
                });
            },
            //退出房间
            leaveTCloud(){
                this.tCloudClient
                .leave()
                .then(() => {
                    // 退房成功，可再次调用client.join重新进房开启新的通话。
                    console.log('腾讯云退出房间成功！');
                    this.rtc.agoraCreatState = false;//视频区关闭
                    this.tCloudStream.stop();
                    this.tCloudStream.close();
                    this.tCloudClient = null;//腾讯音频对象
                    this.tCloudStream = null;//本地视频流
                })
                .catch(error => {
                    console.error('退房失败 ' + error);
                // 错误不可恢复，需要刷新页面。
                });
            },
            //end 音频


            //关闭 drawer
            close() {
                this.$confirm('确定关闭聊天, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.isOnline=false;
                    try {
                        this.socket.isClose = true;
                        this.socket.close();
                    } catch (error) {
                        // ...do nothing
                    }
                    //音频存在 关闭
                    if(this.isPreviewed){
                        this.closeVoiceBtnHandle();
                    }
                    this.$emit('update:drawerVisible', false);
                    this.$emit('closeIMView');//通知父级关闭聊天
                    if(this.$refs['chatForm']) this.$refs['chatForm'].resetFields();
                    this.messageList = [];
                    this.frequency = 1;
                }).catch(() => {
                    console.log('取消关闭！')        
                });
                
            },

            // 历史消息
            async handleHistoryMessage(time = '') {
                this.loadingData = true;
                if(!this.dataSoket.doctorId || !this.dataSoket.patientId) return
                let ajaxData = await this.$axios.get( window.globalUrl.chatHttptUrl +`/chat/treatment/messageList?doctorId=${this.dataSoket.doctorId}&patientId=${this.dataSoket.patientId}&imDt=${time}&count=15`);
                this.loading = false;
                if (ajaxData.success) {
                    if (ajaxData.data.length > 0) {
                        let list = [];
                        ajaxData.data.map( v => {
                            v.isMy = v.userType == 'D' ? true : false
                            if (v.msgType == 'image'|| v.msgType == 'audio_video') v.content = JSON.parse(v.content);

                             if(v.msgType == 'image' || v.msgType == 'text' ||  v.msgType == 'audio_video') list.push(v);

                        })
                        this.messageList = [...list, ...this.messageList];
                        this.loadingData = false;
                        if (!time) { // 第一次加载历史记录，scroll 滚动到最后
                            this.scrollBottom()
                        } else {
                            // 处理 scrolltop 的问题
                            if( document.querySelector('.scroll-view'))  document.querySelector('.scroll-view').scrollTop = list.length * 90;
                            
                        }
                    } else {
                        this.nodata = true;
                    }
                } else {
                    this.$message({
                        type: 'error',
                        message: ajaxData.message
                    })
                }

            },

            // 发送事件
            handleWordMessageEvnt(type) {
                if(type === '2'){
                     //诊闭发送
                    this.socket.onSend({
                        content: '诊闭结束',
                        hospitalIdVisit:this.dataSoket.hospitalIdVisit,
                        doctorId:this.dataSoket.doctorId,
                        patientId:this.dataSoket.patientId,
                        msgType: 'consult_finish',
                    })
                   
                }else if(type === '1'){
                    if(this.isJshun && !this.saveRoomIdStatus) {
                        return this.$message.warning('房间号保存失败！')
                    }
                    //呼叫发送
                    this.socket.onSend({
                        patientId:this.dataSoket.patientId,
                        doctorId:this.dataSoket.doctorId,
                        userType:this.socketType,
                        msgType:"audio_video_doctor_call",
                        content:{roomId:this.rtc_config.roomID,callType:1},
                        hospitalIdVisit:this.dataSoket.hospitalIdVisit
                    })
                    this.isPreviewed = true;//打开视频弹窗
                    this.initZeGo();//初始化zego音频
                } else if(type === '0'){
                    //取消通话
                    if(this.previewstate){
                        this.$message("您取消了视频")
                        //医生主动取消---未接通
                        this.socket.onSend({
                            patientId:this.dataSoket.patientId,
                            doctorId:this.dataSoket.doctorId,
                            userType:"P",
                            msgType:"audio_video_doctor_cancel",
                            content:{
                                roomId:this.rtc_config.roomID,
                                callType:1
                            },
                            hospitalIdVisit:this.dataSoket.hospitalIdVisit
                        })
                    }else{
                        let timeStr = this.secondsFormat(this.duration);
                        //医生主动结束通话---已接通
                        this.socket.onSend({
                            hospitalIdVisit:this.dataSoket.hospitalIdVisit,
                            doctorId:this.dataSoket.doctorId,
                            patientId:this.dataSoket.patientId,
                            userType:"P",
                            content:{
                                roomId:this.rtc_config.roomID,
                                callType:1,
                                showText:`通话时长 ${timeStr}`
                            },
                            msgType: 'audio_video_finish',
                        })
                        clearInterval(this.setTime);//清除时间记录
                        this.$message("您结束了视频")
                    }
                    
                } else if(type == '3'){//接诊呼叫 -- 开始
                    this.socket.onSend({
                        content: '呼叫患者',
                        hospitalIdVisit:this.dataSoket.hospitalIdVisit,
                        doctorId:this.dataSoket.doctorId,
                        patientId:this.dataSoket.patientId,
                        msgType: 'doctor_call',
                    })
                }else if(type == '4'){//接诊呼叫 -- 结束
                     this.socket.onSend({
                        content: '您没有应答，医生结束本次呼叫，请等待医生再次发起呼叫',
                        hospitalIdVisit:this.dataSoket.hospitalIdVisit,
                        doctorId:this.dataSoket.doctorId,
                        patientId:this.dataSoket.patientId,
                        msgType: 'system',
                    })
                } else {
                    let that = this;
                    //正常数据发送
                    that.socket.onSend({
                        content: that.formData.textMessage,
                        hospitalIdVisit:that.dataSoket.hospitalIdVisit,
                        doctorId:that.dataSoket.doctorId,
                        patientId:that.dataSoket.patientId,
                        msgType: 'text',
                    })
                    that.formData.textMessage = '';
                    
                }
                
            },
            //键盘回车-发送
            enterSendText(){
                let that = this;
                document.onkeydown = function(e) {
                    var key = e.keyCode;
                    if ( key === 13) {
                        if(document.getElementById('chatIdss') !== document.activeElement )  return
                        //正常数据发送
                        that.socket.onSend({
                            content: that.formData.textMessage,
                            hospitalIdVisit:that.dataSoket.hospitalIdVisit,
                            doctorId:that.dataSoket.doctorId,
                            patientId:that.dataSoket.patientId,
                            msgType: 'text',
                        })
                        event.returnValue = false;
                        that.formData.textMessage = '';
                    }
                }
            },

            // 接收服务器消息
            msgCallback(data) {
                let msgItem = JSON.parse(data);
                if(msgItem.msgType != 'into_room'){
                    // 获取最后一条消息的时间，超过 5 分钟，则显示时间
                    // let lastTime = this.messageList[this.messageList.length - 1].imDt;
                    // let lastTimestamp = new Date(lastTime).getTime();
                    // let currentTimestamp = Date.now();
                    // if (Math.abs(currentTimestamp - lastTimestamp) / 1000 > 300) {
                    //     msgItem.imTimeStamp = 1
                    //     msgItem.imDt = formatTime(new Date())
                    // }
                    //用户是否在线状态消息不做聊天记录处理
                    if(msgItem.msgType == "user_online_state"){
                        if(msgItem.content.P == 1){
                            //患者在线
                            this.isOnline = true;
                        }else{
                            //不在线
                            this.isOnline = false;
                        }
                        
                    }else{//聊天内容相关处理
                        //对方拒接
                        if(msgItem.msgType == "audio_video_patient_refuse"){
                            this.$message('对方已拒接');
                            this.logout();
                        }else if(msgItem.msgType == "audio_video_patient_accept"){
                            console.log('患者接通了~！');
                        }
                        if (msgItem.userType == this.socketType) {
                            msgItem.isMy = true
                        } else {
                            msgItem.isMy = false
                        }
                        if (msgItem.patientId == this.patientId) {
                            // 只有图片和文本类型的 前端展示
                            if(msgItem.msgType === 'image' || msgItem.msgType === 'text' || msgItem.msgType === 'calltype' ||  msgItem.msgType === 'audio_video') {
                                if( msgItem.msgType === 'audio_video'){
                                    msgItem.content = typeof(msgItem.content) == 'string'? JSON.parse(msgItem.content) : msgItem.content;
                                }
                                this.messageList.push(msgItem)
                            }
                            
                        }
                        if(!document.querySelector('.scroll-view')) return;
                        this.scrollBottom();
                    }
                }else{
                    //呼叫成功跳转诊室---聊天
                    this.$emit('watchCPatient',{type:false})
                }
                
            },

            // scroll
            scrollBottom() {
                if(!document.querySelector('.scroll-view')) return;
                this.$nextTick(() => {
                    setTimeout(() => {
                        if(document.querySelector('.scroll-view')) document.querySelector('.scroll-view').scrollTop = document.querySelector('.scroll-view').scrollHeight;//this.messageList.length * 90;
                        
                    }, 100)
                })
                // this.$refs.scrollView.scrollTop = this.$refs.scrollView.scrollHeight+76;
            },
            //图片渲染完成监听滚动
            // imgOnload(){
            //     this.$nextTick(() => {
            //         console.log('图片加载完成-------：',document.querySelector('.scroll-view').scrollHeight)
            //         document.querySelector('.scroll-view').scrollTop = document.querySelector('.scroll-view').scrollHeight;
            //     })
            // },
            // 发送图片
            handleAvatarSuccess(res) {
                if (res.success) {
                    this.socket.onSend({
                        content: res.data,
                        hospitalIdVisit:this.dataSoket.hospitalIdVisit,
                        doctorId:this.dataSoket.doctorId,
                        patientId:this.dataSoket.patientId,
                        msgType: 'image'
                    })
                } else {
                    this.$message.error(res.message || '上传失败')
                }
            },

            // 图片预览
            previewImage(imgUrl) {
                let date = new Date()
                let year = date.getFullYear()
                let month = date.getMonth() + 1
                let day = date.getDate()
                let hour = date.getHours()
                let minute = date.getMinutes()
                let second = date.getSeconds()

                let list = [year, month, day, hour, minute, second].map(n => {
                    n = n.toString()
                    return n[1] ? n : `0${n}`
                }) // 添加时间后缀

                this.dialogVisible = true
                this.downlaodImgName = `${this.name}${list.join('')}`
                this.viewImage = imgUrl
            },

            // 下载图片
            downLoadImg() {
                let src = this.viewImage;
                let name = this.downlaodImgName
                const image = new Image();
                // 解决跨域 canvas 污染问题
                image.setAttribute('crossOrigin', 'anonymous');
                image.src = src

                image.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    const context = canvas.getContext('2d');
                    context.drawImage(image, 0, 0, image.width, image.height);
                    const url = canvas.toDataURL('image/png');
                    // 生成一个 a 标签
                    const a = document.createElement('a');
                    // 创建一个点击事件
                    const event = new MouseEvent('click');
                    // 将 a 的 download 属性设置为我们想要下载的图片的名称，若 name 不存在则使用'图片'作为默认名称
                    a.download = name || '图片';
                    // 将生成的 URL 设置为 a.href 属性
                    a.href = url;
                    // 触发 a 的点击事件
                    a.dispatchEvent(event);
                }
            },

            // downLoadImg() {
            //     this.getUrlBase64(this.viewImage).then(base64 => {
            //         let link = document.createElement('a')
            //         link.href = base64
            //         link.download = 'qrCode.png'
            //         link.click()
            //      })
            // },

            // getUrlBase64(url) {
            //     return new Promise(resolve => {
            //             let canvas = document.createElement('canvas')
            //             let ctx = canvas.getContext('2d')
            //             let img = new Image()
            //             img.crossOrigin = '*' //允许跨域
            //             img.src = url
            //             img.onload = function() {
            //             canvas.height = 300
            //             canvas.width = 300
            //             ctx.drawImage(img, 0, 0, 300, 300)
            //             let dataURL = canvas.toDataURL('image/png')
            //             canvas = null
            //             resolve(dataURL)
            //         }
            //     })
            // },

            // 滚动事件
            handleScrollEvent(e) {
                if (!this.drawerVisible) return;

                let scrollTop = e.target.scrollTop;
                // 翻页没有数据时，不请求
                if (!this.nodata) {
                    // 防止多次请求数据
                    if (!this.loadingData) {
                        // scrolltop 为 0 时，加载历史记录
                        if (scrollTop == 0) {
                            this.handleHistoryMessage(this.messageList[0].imDt)
                        }
                    }
                }
            },

            // 浏览器不支持 socket
            windowDontHasSocketCallback() {
                this.$message.error('该浏览器暂不支持创建 socket')
            },

            // 图片预览遮罩
            handleMask() {
                this.dialogVisible = false
            },
            //时间转时分秒
            secondsFormat( s ){
                // //floor向下取整
                // let day = Math.floor(s/(24*3600));//天
                let hour = Math.floor(s/3600);//小时
                let minute = Math.floor((s-hour*3600)/60);//分钟
                let second = s  - hour*3600 - minute*60;//秒 
                if(hour < 10 ){
                    hour = hour == 0 ? 0 : `0${hour}`;
                }
                hour = hour < 10 ? `0${hour}`: hour;
                minute = minute < 10? `0${minute}`:minute;
                second = second < 10 ? `0${second}`:second;
                if(hour == 0){
                    return `${minute}:${second}`
                }else{
                    return `${hour}:${minute}:${second}`;
                }
            },
            //收起视频
            putPreVedio(){
                this.$emit('retreatVedio',false);
                // this.retreatVedioState = false;
            },
            //收起IM
            putHandle(){
                this.$emit('retreatIM',false);
                // this.retreatIMState = false;
            },
            //检测摄像头麦克风
            iSMicCamera(){
                if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                    // Firefox 38+ seems having support of enumerateDevicesx
                    navigator.enumerateDevices = function(callback) {
                        navigator.mediaDevices.enumerateDevices().then(callback);
                    };
                }
                if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
                    this.micCam.canEnumerate = true;
                } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
                    this.micCam.canEnumerate = true;
                }
                
                this.checkDeviceSupport();
            },
            checkDeviceSupport() {
                if (!this.micCam.canEnumerate) {
                    return;
                }
                if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
                    navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
                }
            
                if (!navigator.enumerateDevices && navigator.enumerateDevices) {
                    navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
                }
            
                if (!navigator.enumerateDevices) {
                    if (callback) {
                        callback();
                    }
                    return;
                }
            
                this.micCam.MediaDevices = [];
                navigator.enumerateDevices((devices)=> {
                    devices.forEach((_device)=> {
                        var device = {};
                        for (var d in _device) {
                            device[d] = _device[d];
                        }
            
                        if (device.kind === 'audio') {
                            device.kind = 'audioinput';
                        }
            
                        if (device.kind === 'video') {
                            device.kind = 'videoinput';
                        }
                        this.micCam.MediaDevices.forEach(function(d) {
                            if (d.id === device.id && d.kind === device.kind) {
                                this.micCam.skip = true;
                            }
                        });
            
                        if (this.micCam.skip) {
                            return;
                        }
            
                        if (!device.deviceId) {
                            device.deviceId = device.id;
                        }
            
                        if (!device.id) {
                            device.id = device.deviceId;
                        }
            
                        if (!device.label) {
                            device.label = 'Please invoke getUserMedia once.';
                            if (!this.micCam.isHTTPs) {
                                device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                            }
                        } else {
                            if (device.kind === 'videoinput' && !this.micCam.isWebcamAlreadyCaptured) {
                                this.micCam.isWebcamAlreadyCaptured = true;
                            }
            
                            if (device.kind === 'audioinput' && !this.micCam.isMicrophoneAlreadyCaptured) {
                                this.micCam.isMicrophoneAlreadyCaptured = true;
                            }
                        }
            
                        if (device.kind === 'audioinput') {
                            this.micCam.hasMicrophone = true;
                        }
            
                        if (device.kind === 'audiooutput') {
                            this.micCam.hasSpeakers = true;
                        }
            
                        if (device.kind === 'videoinput') {
                            this.micCam.hasWebcam = true;
                        }
            
                        // there is no 'videoouput' in the spec.
                        this.micCam.MediaDevices.push(device);
                    });
                    if(this.micCam.hasWebcam == false){
                        console.log("没有摄像头！");
                        this.$message({
                            type:"error",
                            message:'您的设备没有摄像头，请先安装摄像头再进行视频！'
                        })
                        this.micCam.isCamState = false;
                        // return false;
                    }else{
                        if(this.micCam.isWebcamAlreadyCaptured == false){
                            console.log("捕获摄像头失败，请重新安装摄像头！");
                            this.$message({
                                type:"error",
                                message:'捕获摄像头失败，请重新安装摄像头！！'
                            })
                            this.micCam.isCamState = false;
                            // return false;
                        }else{
                            console.log('摄像头正常');
                            this.micCam.isCamState = true;
                            // return true;
                        }
                    }
                    if(this.micCam.hasMicrophone == false){
                        console.log("没有麦克风！");
                        this.$message({
                            type:"error",
                            message:'您的设备没有麦克风，请先安装麦克风！'
                        })
                        this.micCam.isMicState = false;
                        // return false;
                    }else{
                        if(this.micCam.isMicrophoneAlreadyCaptured == false){
                            console.log("捕获麦克风失败，请重新安装麦克风！");
                            this.$message({
                                type:"error",
                                message:'捕获麦克风失败，请重新安装麦克风！'
                            })
                            this.micCam.isMicState = false;
                            // return false;
                        }else{
                            console.log('麦克风正常');
                            this.micCam.isMicState = true;
                            // return true;
                        }
                    }
                });
            }
        },
        destroyed(){
            // if(this.zg){
            //     this.zg.stopPublishingStream(this.publishStreamId);
            //     this.zg.destroyStream(this.localStream);
            //     this.previewVideo.srcObject = null;
            //     this.zg = null;
            // }
            if(this.setTime){
                clearInterval(this.setTime);
            }
        }
    }

</script>

<style lang="scss" src="./chat.scss"></style>
