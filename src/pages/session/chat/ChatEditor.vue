<template>
  <div class="m-chat-editor">
    <div class="u-editor-input">
      <!-- <textarea @input='editMsg' ref='editTextArea'  v-model="msgToSent" @focus='onInputFocus'>
          
      </textarea> -->
      <div ref='editTextArea' class='msg-textarea' contenteditable="true" @click='onInputFocus' @input="editMsg">
         <!-- {{msgToSent}} -->
      </div>
      <ul  v-show='isAt' :style="{left:left+'px',bottom:bottom+'px'}" class='ait-list'>
          <li @click='at(item)' v-for='(item,index) in members' :class='{active:index === activeIndex}'>
              <span class='avatar'><img :src="item.avatar" alt=""></span>
              <span class='alias'>{{item.alias}}</span>
          </li>
      </ul>
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
        //console.log(msgToSent,'msgToSent22222')
      if (this.isRobot || this.scene !== 'team') {
        return;
      }
      console.log(this.msgToSent,'this.msgToSent1111')
      if (this.msgToSent[this.msgToSent.length - 1] === '@') {
          this.isAt = true;
          //let msgToSent = this.msgToSent.substring(0,this.msgToSent.length-1)+`<span id="at-${this.msgToSent.length-1}">@</span>`
          let child = document.createElement('SPAN');
          child.id = `at-${this.msgToSent.length-1}`
          this.$refs['editTextArea'].appendChild(child);
          let oSpan = document.getElementById(`at-${this.msgToSent.length-1}`);
          this.left = oSpan.offsetLeft+20;
          this.bottom = oSpan.offsetTop+10;
          console.log(oSpan.offsetTop,'top is :======')
      } else {
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
      bottom: 0,
      isAt: false,
      activeIndex: 0
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
          let newMembers = [];  
          members.forEach(item => {
            var member = Object.assign({}, item); //重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
            member.valid = true; //被管理员移除后，标记为false
            if (member.account !== this.$store.state.userUID) {
                if (userInfos[member.account] === undefined) {
                    needSearchAccounts.push(member.account);
                    member.avatar = member.avatar || this.avatar;
                    member.alias = member.nickInTeam || member.account;
                } else {
                    member.avatar = userInfos[member.account].avatar;
                    member.alias =
                        member.nickInTeam || userInfos[member.account].nick;
                }
                newMembers.push(member);
            }
          });
          //如果群中的成员没有在现有的用户列表中，需要重新拉取用户信息
          if (needSearchAccounts.length > 0 && !this.hasSearched) {
            this.hasSearched = true;
            while (needSearchAccounts.length > 0) {
              this.searchUsers(needSearchAccounts.splice(0, 150));
            }
          }
          return newMembers;
        }
        return [];
      }
    }
  },
  methods: {
    getAtList() {
       let atList = []; 
       this.members.forEach(item => {
           if(this.msgToSent.includes('@' + item.alias)) {
              atList.push(item.account)
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
      console.log(this.to,'session id to')
      let sendData = {
           type: "text",
           scene: this.scene,
           to: this.to,
           text: this.msgToSent
      }
      if(this.scene === 'team') {
        let atList = this.getAtList();
        sendData.custom = JSON.stringify(atList)
      }    
      this.$store.dispatch("sendMsg", sendData);
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
        // e.target.scrollIntoView();
        pageUtil.scrollChatListDown();
      }, 200);
    },
    at(item) {
       this.isAt = false; 
       this.msgToSent += item.alias;
       this.$refs['editTextArea'].focus();
    },
    searchUsers(Accounts) {
      this.$store.dispatch("searchUsers", {
        accounts: Accounts,
        done: users => {
          this.updateTeamMember(users);
        }
      });
    },
    updateTeamMember(users) {
      users.forEach(user => {
        var member = this.members.find(member => {
          return member.account === user.account;
        });
        if (member) {
          member.avatar = user.avatar;
          member.alias = member.nickInTeam || user.nick;
        }
      });
    },
    editMsg(e) {
      console.log(e.target.value,'e is :=====')
      this.msgToSent = e.target.textContent
    }
  },
  mounted() {
      window.addEventListener('keydown', (e) => {
         if(!this.isAt) 
            return false;
         if(e.keyCode === 38) {
           this.activeIndex = this.activeIndex >=1 ? this.activeIndex - 1 : this.members.length-1;
         }
         if(e.keyCode === 40) {  
            
          this.activeIndex = this.activeIndex < this.members.length-1 ? this.activeIndex + 1 : 0;
          console.log(this.activeIndex,'this.activeIndex')
         }
      })
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
      position: relative;
      .msg-textarea{
          position: relative;
          width:100%;
          height:100%;
          overflow: auto;
          border-radius: 5px;
          background:#fff;
          outline: none;
          padding:5px;
          box-sizing: border-box;
      }
      .ait-list {
          position: absolute;
          top:0;
          max-height:150px;
          overflow: auto;
          width:150px;
          border:1px solid #ccc;
          background: #fff;
          z-index: 100;
          li{
              height:30px;
              line-height:30px;
              padding-left:10px;
              .avatar img{
                  width:20px;
                  height:20px;
                  border-radius: 50%;
              }
              .alias {
                  vertical-align: bottom;
              }
          }
          li.active{
              background:#5cacde;
              color:#fff;
          }
      }
  }
  .u-editor-icons {
      float:left;
      width:20%;
      min-width: 120px;
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