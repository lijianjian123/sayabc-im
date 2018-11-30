<template>
  <div class="m-chat-editor">
    <div class="u-editor-input">
      <textarea  v-model="msgToSent" @focus='onInputFocus'></textarea>
    </div>
    <div class="u-editor-icons">
      <span v-if="!isRobot" class="u-editor-icon" @change="sendFileMsg">
        <i class="u-icon-img"><img :src="icon2"></i>
        <input type="file" ref="fileToSent">
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
      if (this.isRobot) {
        return;
      }
      let indexAt = this.msgToSent.indexOf("@");
      if (indexAt >= 0 && indexAt === this.msgToSent.length - 1) {
        if (this.robotslist && this.robotslist.length > 0) {
          this.isRobotListShown = true;
        }
      } else if (this.isRobotListShown === true) {
        this.isRobotListShown = false;
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
      icon3: `${config.resourceUrl}/im/chat-editor-3.png`
    };
  },
  methods: {
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
      // 如果是机器人
      if (this.isRobot) {
        this.$store.dispatch("sendRobotMsg", {
          type: "text",
          scene: this.scene,
          to: this.to,
          robotAccid: this.to,
          // 机器人后台消息
          content: this.msgToSent,
          // 显示的文本消息
          body: this.msgToSent
        });
      } else {
        let robotAccid = "";
        let robotText = "";

        let atUsers = this.msgToSent.match(/@[^\s@$]+/g);
        if (atUsers) {
          for (let i = 0; i < atUsers.length; i++) {
            let item = atUsers[i].replace("@", "");
            if (this.robotInfosByNick[item]) {
              robotAccid = this.robotInfosByNick[item].account;
              robotText = (this.msgToSent + "").replace(atUsers[i], "").trim();
              break;
            }
          }
        }
        if (robotAccid) {
          if (robotText) {
            this.$store.dispatch("sendRobotMsg", {
              type: "text",
              scene: this.scene,
              to: this.to,
              robotAccid,
              // 机器人后台消息
              content: robotText,
              // 显示的文本消息
              body: this.msgToSent
            });
          } else {
            this.$store.dispatch("sendRobotMsg", {
              type: "welcome",
              scene: this.scene,
              to: this.to,
              robotAccid,
              // 显示的文本消息
              body: this.msgToSent
            });
          }
        } else {
          this.$store.dispatch("sendMsg", {
            type: "text",
            scene: this.scene,
            to: this.to,
            text: this.msgToSent
          });
        }
      }
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
    netcallVideoLink() {
      // 点击开始视频
      if (this.invalid) {
        this.$toast(this.invalidHint);
        return;
      }
      console.warn("开始视频通话 begin");
      console.warn("视频通话", window.WebRTC);
    },
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
    }
  }
};
</script>

<style scoped lang='less'>
.m-chat-editor {
  background: #e5f4ff;
  padding: 5px;
  width:100%;
  height:100%;
  box-sizing: border-box;
  .u-editor-input {
      float:left;
      width:80%;
      height:100%;
      textarea{
          width:100%;
          height:100%;
          border-radius: 5px;
          resize: none;
      }
  }
  .u-editor-icons {
      float:left;
      width:20%;
      min-width: 110px;
      height:100%;
      padding-top:20px;
      box-sizing: border-box;
      padding-left:10px;
      .u-editor-icon {
          position: relative;
          display: inline-block;
          width:50px;
          height:50px;
          input{
             opacity: 0;
             position: absolute;
             top:0;
             left:0;
             width:100%;
             height:100%;
          }
      }
      .u-editor-send {
          display: inline-block;
          padding:10px;
          background:#0091e4;
          color:#fff;
          border-radius: 5px;
      }
  }
}
</style>