<template>
  <div class='chat-item'>
    <div class='header'>
      <div class='session-name'>{{sessionName}}</div>
      <div class='session-handle'>
        <button class='follow-up-btn'>跟进</button>
        <span class='check-member' @click='checkInfo'>{{isCheckMember?'关闭查看':'查看成员'}}</span>
      </div>
    </div>
    <div
      class='chat-box'
      v-if='sessionId'
    >
      <div class='chat-list' id='chat-list'>
        <chat-list :msglist='msglist' :myInfo='myInfo' :isRobot='isRobot' :userInfos='userInfos'/>
      </div>
      <div class='chat-edit'>
        <chat-editor
        :scene="scene"
        :to="to"
        :invalid="teamInvalid || muteInTeam"
        :invalidHint="sendInvalidHint" />
      </div>
    </div>
  </div>
</template>
<script>
import util from "@/utils";
import ChatList from "./ChatList";
import ChatEditor from './ChatEditor'
export default {
  components: {
    ChatList,
    ChatEditor
  },
  computed: {
    isCheckMember() {
      return this.$store.state.isCheckMember;
    },
    sessionId() {
      return this.$store.state.currSessionId;
    },
    userInfos() {
      return this.$store.state.userInfos;
    },
    robotInfos() {
      return this.$store.state.robotInfos;
    },
    sessionName() {
      let sessionId = this.sessionId;
      let user = null;
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, "");
        if (user === this.$store.state.userUID) {
          return "我的手机";
        } else if (this.isRobot) {
          return this.robotInfos[user].nick;
        } else {
          let userInfo = this.userInfos[user] || {};
          return util.getFriendAlias(userInfo);
        }
      } else if (/^team-/.test(sessionId)) {
        return this.teamInfo.owner || "";
      }
    },
    scene() {
      return util.parseSession(this.sessionId).scene;
    },
    to () {
      return util.parseSession(this.sessionId).to
    },
    teamInfo() {
      if (this.scene === "team") {
        var teamId = this.sessionId.replace("team-", "");
        return this.$store.state.teamlist.find(team => {
          return team.teamId === teamId;
        });
      }
      return undefined;
    },
    msglist() {
      let msgs = this.$store.state.currSessionMsgs;
      return msgs;
    },
    isRobot () {
      let sessionId = this.sessionId
      let user = null
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, '')
        if (this.robotInfos[user]) {
          return true
        }
      }
      return false
    },
    teamInvalid() {
      if (this.scene==='team') {
        return !(this.teamInfo && this.teamInfo.validToCurrentUser)
      }
      return false
    },
    muteInTeam(){
      if(this.scene!=='team') return false
      var teamMembers = this.$store.state.teamMembers
      var Members = teamMembers && teamMembers[this.teamInfo.teamId]
      var selfInTeam = Members && Members.find(item=>{
        return item.account === this.$store.state.userUID
      })
      return selfInTeam && selfInTeam.mute || false
    },
    sendInvalidHint() {
      if (this.scene==='team' && this.teamInvalid) {
        return `您已不在该${this.teamInfo && this.teamInfo.type==='normal'? '讨论组':'群'}，不能发送消息`
      } else if (this.muteInTeam) {
        return '您已被禁言'
      }
      return '无权限发送消息'
    },
    myInfo () {
      return this.$store.state.myInfo
    },
  },
  methods: {
    checkInfo() {
      this.$store.commit("isCheckMember",!this.isCheckMember);
    }
  }
};
</script>
<style lang='less' scoped>
.chat-item {
  width: 100%;
  height: 100%;
  position: relative;
  .header {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    overflow: hidden;
    .session-name {
      float: left;
      height: 40px;
      line-height: 40px;
      padding-left: 10px;
    }
    .session-handle {
      float: right;
      line-height: 40px;
      padding-right: 10px;
      .follow-up-btn {
        width: 60px;
        height: 30px;
        background: #fff;
        border-radius: 5px;
        outline: none;
        margin-left: 10px;
      }
    }
  }
  .chat-box {
    position: absolute;
    top:40px;
    left:0;
    right:0;
    bottom:0;
    .chat-edit{
      position: absolute;
      width:100%;
      height:160px;
      bottom:0;
      box-sizing: border-box;
      border-top:1px solid #ccc;
    }
    .chat-list{
      position: absolute;
      top:0;
      bottom:100px;
      left:0;
      right:0;
      overflow-x:hidden;
      overflow-y: auto
    }
  }
}
</style>


