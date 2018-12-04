<template>
  <div class="m-chat-editor">
    <div class="u-editor-input">
      <textarea ref="editTextArea" v-model="msgToSent" @focus="onInputFocus"></textarea>
      <ul v-show="isAt" :style="{left:left+'px'}" class="ait-list">
        <li
          @click="at(item)"
          v-for="(item, index) in members"
          v-if="item.alias!=='我'"
          :key="index"
        >{{item.alias}}</li>
      </ul>
    </div>
    <div class="u-editor-icons">
      <span v-if="!isRobot" class="u-editor-icon" @change="sendFileMsg">
        <i class="u-icon-img">
          <img :src="icon2">
        </i>
        <input type="file" ref="fileToSent">
      </span>
      <span
        v-if="!isRobot"
        class="u-editor-icon"
        id="showNetcallVideoLink"
        @click.stop="startTeamVoice"
      >
        <i class="u-icon-img">
          <img :src="icon3">
        </i>
      </span>
      <span class="u-editor-send" @click="sendTextMsg">发 送</span>
    </div>

  </div>
</template>

<script>
import util from "@/utils";
import config from "@/configs";
import pageUtil from "@/utils/page";


export default {
  props: {
    scene: String,
    to: String,
    isRobot: {
      type: Boolean,
      default() {
        return false;
      }
    },
    invalid: {
      type: Boolean,
      default: false
    },
    invalidHint: {
      type: String,
      default: "您无权限发送消息"
    }
  },
  watch: {
    msgToSent(curVal, oldVal) {
      if (this.isRobot || this.scene !== "team") {
        return;
      }
      if (this.msgToSent[this.msgToSent.length - 1] === "@") {
        let position = util.getPosition(this.$refs["editTextArea"]);
        this.isAt = true;
        this.left = position * 14;
      } else if (this.isRobotListShown === true) {
        this.isAt = false;
      }
    }
  },
  data() {
    return {
      isEmojiShown: false,
      isRobotListShown: false,
      msgToSent: "",
      icon1: `${config.resourceUrl}/im/chat-editor-1.png`,
      icon2: `${config.resourceUrl}/im/chat-editor-2.png`,
      icon3: `${config.resourceUrl}/im/chat-editor-3.png`,
      left: 0,
      isAt: false
    };
  },
  computed: {
    sessionId() {
      return this.$store.state.currSessionId;
    },
    teamInfo() {
      if (this.scene === "team") {
        var teamId = this.sessionId.replace("team-", "");
        let teamInfo = this.$store.state.teamlist.find(team => {
          return team.teamId === teamId;
        });
        return teamInfo;
      }
      return undefined;
    },
    members() {
      if (this.teamInfo) {
        var members = this.$store.state.teamMembers[this.teamInfo.teamId];
        var userInfos = this.$store.state.userInfos;
        var needSearchAccounts = [];
        if (members) {
          members = members.map(item => {
            var member = Object.assign({}, item); //重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
            if (member.account === this.$store.state.userUID) {
              member.alias = "我";
              member.avatar = this.$store.state.myInfo.avatar;
            } else {
              member.avatar = userInfos[member.account].avatar;
              member.alias =
                member.nickInTeam || userInfos[member.account].nick;
            }
            return member;
          });
          return members;
        }
        return [];
      }
    }
  },
  methods: {
    getAtList() {
      let atList = [];
      this.members.forEach(item => {
        if (this.msgToSent.includes("@" + item.alias)) {
          atList.push(item.id);
        }
      });
      return atList;
    },
    sendTextMsg() {
      if (this.invalid) {
        this.$toast(this.invalidHint);
        return;
      }
      if (/^\s*$/.test(this.msgToSent)) {
        alert("请不要发送空消息");
        return;
      } else if (this.msgToSent.length > 800) {
        alert("请不要超过800个字");
        return;
      }
      this.msgToSent = this.msgToSent.trim();
      // let atList = this.getAtList();
      this.$store.dispatch("sendMsg", {
        type: "text",
        scene: this.scene,
        to: this.to,
        text: this.msgToSent,
        // custom: JSON.stringify(atList)
        custom: "[]"
      });
      // 如果是机器人
      //   if (this.isRobot) {
      //     this.$store.dispatch("sendRobotMsg", {
      //       type: "text",
      //       scene: this.scene,
      //       to: this.to,
      //       robotAccid: this.to,
      //       // 机器人后台消息
      //       content: this.msgToSent,
      //       // 显示的文本消息
      //       body: this.msgToSent
      //     });
      //   } else {
      //     let robotAccid = "";
      //     let robotText = "";

      //     let atUsers = this.msgToSent.match(/@[^\s@$]+/g);
      //     if (atUsers) {
      //       for (let i = 0; i < atUsers.length; i++) {
      //         let item = atUsers[i].replace("@", "");
      //         if (this.robotInfosByNick[item]) {
      //           robotAccid = this.robotInfosByNick[item].account;
      //           robotText = (this.msgToSent + "").replace(atUsers[i], "").trim();
      //           break;
      //         }
      //       }
      //     }
      //     if (robotAccid) {
      //       if (robotText) {
      //         this.$store.dispatch("sendRobotMsg", {
      //           type: "text",
      //           scene: this.scene,
      //           to: this.to,
      //           robotAccid,
      //           // 机器人后台消息
      //           content: robotText,
      //           // 显示的文本消息
      //           body: this.msgToSent
      //         });
      //       } else {
      //         this.$store.dispatch("sendRobotMsg", {
      //           type: "welcome",
      //           scene: this.scene,
      //           to: this.to,
      //           robotAccid,
      //           // 显示的文本消息
      //           body: this.msgToSent
      //         });
      //       }
      //     } else {
      //       this.$store.dispatch("sendMsg", {
      //         type: "text",
      //         scene: this.scene,
      //         to: this.to,
      //         text: this.msgToSent,
      //         custom: {"name":'a'}
      //       });
      //     }
      //   }
      this.msgToSent = "";
    },
    sendFileMsg() {
      if (this.invalid) {
        this.$toast(this.invalidHint);
        return;
      }
      let ipt = this.$refs.fileToSent;
      if (ipt.value) {
        this.$store.dispatch("sendFileMsg", {
          scene: this.scene,
          to: this.to,
          fileInput: ipt
        });
      }
    },
    startTeamVoice() {
      // 可能需要一些判断 当前群组 TODO
      // 通知 mask 展示群组列表 展现前需要一个开关关闭其他的弹层 在mask子组件里进行控制
      // this.$store.commit('updateMaskState', true)
      this.$store.commit("updateSelectMemberDiaState", true);
    },
    // netcallVideoLink () { // 点击开始语音
    //   if (this.invalid) {
    //     this.$toast(this.invalidHint)
    //     return
    //   }
    //   let that = this
    //   console.log('音频通话开始', netcall)
    //   // 先挂断通话?
    //   // netcall.hangup()
    //   // 创建房间
    //   netcall.createChannel({
    //     channelName: new Date().getTime().toString(), //必填 TODO 退出时候记得销毁 实际使用的时候 这个按照老师id进行创建房间，TODO做重复校验
    //     // channelName: 'Sunday a80-a81秘密通话2', //必填 TODO 退出时候记得销毁
    //     custom: 'a80-a81秘密通话~~~', //可选
    //     webrtcEnable: true // 是否支持WebRTC方式接入，可选，默认为不开启
    //   }).then(function(obj) {
    //     // 预定房间成功后的上层逻辑操作
    //     // eg: 初始化房间UI显示
    //     // eg: 加入房间
    //     console.log('初始化成功',obj) // obj 返回发送的数据
    //     console.log('正在加入房间')
    //     netcall.joinChannel({
    //       // 这里需要注意从这里https://yunxin.163.com/im-demo下载的SDK仅仅是参考，官方文档更正确一些。比如type 而不是 mode在5.9.0的webrtc中
    //         channelName: obj.channelName, //必填，请确保此房间已被创建
    //         // mode: 0, // 模式，0音视频，1纯音频，2纯视频，3静默
    //         type: 1, // 模式，0音视频，1纯音频，2纯视频，3静默
    //         role: 0 // 角色，0-主播 1-观众
    //       })
    //       .then(function(obj) {
    //         // obj结构 => {account,cid,uid}
    //         console.error('本人加入房间成功', obj)
    //         // 加入房间成功后的上层逻辑操作
    //           // eg: 开启摄像头
    //           // eg: 开启麦克风
    //           // eg: 开启本地流
    //           // eg: 设置音量采集、播放
    //           // eg: 设置视频画面尺寸等等，具体请参照p2p呼叫模式
    //           // 开始呼叫?
    //             // 发起通话请求
    //           console.error('主人开始发起通话请求')
    //             netcall.call({
    //               // type: netcall.NETCALL_TYPE_VIDEO,
    //               type: 1,
    //               account: 'a81', // 账号 TODO 多点的时候封装后分批处理
    //               webrtcEnable: true,
    //               pushConfig: {},
    //               sessionConfig:{
    //                 recordVideo: false,
    //                 recordAudio: false
    //               }
    //             }).then(function(){
    //               console.log('主人发起请求call成功')
    //               that.$store.commit('updateCallState', true)
    //             })
    //           // const netcall = this.netcall;
    //           // 开启麦克风
    //           // netcall
    //           //   .startDevice({
    //           //     type: netcall.DEVICE_TYPE_AUDIO_IN
    //           //   })
    //           //   .then(function() {
    //           //     // 通知对方自己开启了麦克风
    //           //     console.log('通知对方自己开启了麦克风')
    //           //     netcall.control({
    //           //       command: netcall.NETCALL_CONTROL_COMMAND_NOTIFY_AUDIO_ON
    //           //     });
    //           //   })
    //           //   .catch(function(err) {
    //           //     console.log('启动麦克风失败');
    //           //     console.log(err);
    //           //   });
    //       })
    //       .catch(function(err){
    //         console.log('加入房间失败', err)
    //       })
    //   }).catch(function(err){
    //     console.log('初始化失败', err)
    //   })

    // },
    chooseRobot(robot) {
      if (robot && robot.account) {
        let len = this.msgToSent.length;
        if (len === 0 || this.msgToSent[len - 1] !== "@") {
          this.msgToSent += "@" + robot.nick + " ";
        }
        {
          this.msgToSent += robot.nick + " ";
        }
      }
    },
    hideRobotList() {
      this.isRobotListShown = false;
    },
    onInputFocus(e) {
      setTimeout(() => {
        // todo fixme 解决iOS输入框被遮挡问题，但会存在空白缝隙
        e.target.scrollIntoView();
        pageUtil.scrollChatListDown();
      }, 200);
    },
    at(item) {
      this.isAt = false;
      this.msgToSent += item.alias;
      this.$refs["editTextArea"].focus();
    }
  }
};
</script>

<style scoped lang='less'>
.m-chat-editor {
  background: #e5f4ff;
  padding: 5px;
  // width:100%;
  height: 100%;
  box-sizing: border-box;
  .u-editor-input {
    float: left;
    width: 70%;
    height: 100%;
    position: relative;
    textarea {
      width: 100%;
      // height:100%;
      border-radius: 5px;
      resize: none;
    }
    .ait-list {
      position: absolute;
      top: 0;
      height: 130px;
      overflow: auto;
      width: 150px;
      border: 1px solid #ccc;
      background: #fff;
      li {
        height: 30px;
        line-height: 30px;
      }
      li:hover {
        background: #0091e4;
        color: #fff;
      }
    }
  }
  .u-editor-icons {
    float: left;
    width: 30%;
    height: 100%;
    box-sizing: border-box;
    padding-left: 10px;
    .u-editor-icon {
      position: relative;
      display: inline-block;
      input {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    .u-editor-send {
      display: inline-block;
      padding: 10px;
      background: #0091e4;
      color: #fff;
      border-radius: 5px;
    }
  }

}
</style>
