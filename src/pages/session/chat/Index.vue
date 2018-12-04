<template>
  <div class="chat-item">
    <!-- header -->
    <div class="header">
      <div class="session-name">{{sessionName}}</div>
      <div class="session-handle">
        <button class="follow-up-btn">跟进</button>
        <span class="check-member" @click="checkInfo">{{isCheckMember?'关闭查看':'查看成员'}}</span>
      </div>
    </div>
    <!-- chatbox -->
    <div class="chat-box" v-if="sessionId">
      <div class="chat-list" id="chat-list">
        <chat-list
          :msglist="msglist"
          :myInfo="myInfo"
          :isRobot="isRobot"
          :userInfos="userInfos"
          :sessionId="sessionId"
        />
      </div>
      <div class="chat-edit">
        <!-- 父组件有很多可以props传递给子组件不要一遍一遍的写 TODO 比如scene teamInfo等!!! -->
        <chat-editor
          :scene="scene"
          :to="to"
          :invalid="teamInvalid || muteInTeam"
          :invalidHint="sendInvalidHint"
        />
      </div>
    </div>
    <!-- 邀请成员弹窗 -->
    <div class="inviteTeamVoice" v-if="scene==='team' && showSelectMember">
      <select-members
        :members="members"
        :invalid="teamInvalid || muteInTeam"
        :invalidHint="sendInvalidHint"
        :myInfo="myInfo"
      />
    </div>
  </div>
</template>
<script>
import util from "@/utils";
import ChatList from "./ChatList";
import ChatEditor from "./ChatEditor";
import SelectMembers from './SelectMemers'

export default {
  components: {
    ChatList,
    ChatEditor,
    SelectMembers
  },
  computed: {
    showSelectMember () {
      return this.$store.state.showSelectMember
    },
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
    to() {
      return util.parseSession(this.sessionId).to;
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
    },
    msglist() {
      let msgs = this.$store.state.currSessionMsgs;
      return msgs;
    },
    isRobot() {
      let sessionId = this.sessionId;
      let user = null;
      if (/^p2p-/.test(sessionId)) {
        user = sessionId.replace(/^p2p-/, "");
        if (this.robotInfos[user]) {
          return true;
        }
      }
      return false;
    },
    teamInvalid() {
      if (this.scene === "team") {
        return !(this.teamInfo && this.teamInfo.validToCurrentUser);
      }
      return false;
    },
    muteInTeam() {
      if (this.scene !== "team") return false;
      var teamMembers = this.$store.state.teamMembers;
      var Members = teamMembers && teamMembers[this.teamInfo.teamId];
      var selfInTeam =
        Members &&
        Members.find(item => {
          return item.account === this.$store.state.userUID;
        });
      return (selfInTeam && selfInTeam.mute) || false;
    },
    sendInvalidHint() {
      if (this.scene === "team" && this.teamInvalid) {
        return `您已不在该${
          this.teamInfo && this.teamInfo.type === "normal" ? "讨论组" : "群"
        }，不能发送消息`;
      } else if (this.muteInTeam) {
        return "您已被禁言";
      }
      return "无权限发送消息";
    },
    myInfo() {
      return this.$store.state.myInfo;
    }
  },
  methods: {
    checkInfo() {
      this.$store.commit("isCheckMember", !this.isCheckMember);
    }
  }
};
</script>
<style lang='less' scoped>
.chat-item {
  width: 100%;
  height: 100%;
  // position: relative;
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
    // position: absolute;
    // top: 40px;
    // left: 0;
    // right: 0;
    // bottom: 0;
    height: 88%;
    overflow-y: auto;
    .chat-edit {
      position: absolute;
      width: 100%;
      height: 50px;
      bottom: 0;
      left: 25%; // 群组列表的宽度
      width: 55%; // 当前列表的宽度
      box-sizing: border-box;
      border-top: 1px solid #ccc;
    }
    .chat-list {
      // position: absolute;
      // top: 0;
      // bottom: 100px;
      // left: 25%; // 群组列表的宽度
      // right: 0;
      // width: 55%; // 当前列表的宽度
      // overflow-x: hidden;
      // overflow-y: auto;
    }
  }
  .inviteTeamVoice {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, .4);
  }
}
</style>
