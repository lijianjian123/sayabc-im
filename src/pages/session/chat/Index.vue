<template>
  <div class='chat'>
    <div class='header'>
      <span>{{sessionName}}</span>
      <div>
        <span>跟进</span>
        <button>关闭查看</button>
      </div>
    </div>
    <div
      class='chat-box'
      v-if='sessionId'
    >
      会话
    </div>
  </div>
</template>
<script>
import util from "@/utils";
export default {
  computed: {
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
    teamInfo() {
      if (this.scene === "team") {
        var teamId = this.sessionId.replace("team-", "");
        return this.$store.state.teamlist.find(team => {
          return team.teamId === teamId;
        });
      }
      return undefined;
    }
  }
};
</script>
<style lang='less' scoped>
//   .chat {
//       .header{
//           height:40px;
//           border-bottom: 1px solid #ccc;
//       }
//   }
</style>


