<template>
  <div class='session'>
    <Search />
    <ul class='session-list'>
      <li
        v-for='session in sessionlist'
        class='session-item'
        @click="enterChat(session)"
      >
        <p >
          <span>{{session.name}}</span>
          <span>{{session.updateTimeShow}}</span>
        </p>
        <p>{{session.lastMsgShow}}</p>
      </li>
    </ul>
  </div>
</template>
<script>
import Search from "./Search.vue";
import util from "@/utils";
export default {
  components: { Search },
  computed: {
    myPhoneId() {
      return `${this.$store.state.userUID}`;
    },
    userInfos() {
      return this.$store.state.userInfos;
    },
    sessionlist() {
      let sessionlist = this.$store.state.sessionlist.filter(item => {
        item.name = "";
        if (item.scene === "p2p") {
          let userInfo = null;
          if (item.to !== this.myPhoneId) {
            userInfo = this.userInfos[item.to];
          } else {
            return false;
          }
          if (userInfo) {
            item.name = util.getFriendAlias(userInfo);
          }
        } else if (item.scene === "team") {
          let teamInfo = null;
          teamInfo = this.$store.state.teamlist.find(team => {
            return team.teamId === item.to;
          });
          if (teamInfo) {
            item.name = teamInfo.owner;
          } else {
            item.name = `群${item.to}`;
          }
        }
        let lastMsg = item.lastMsg || {};
        if (lastMsg.type === "text") {
          item.lastMsgShow = lastMsg.text || "";
        } else if (lastMsg.type === "custom") {
          item.lastMsgShow = util.parseCustomMsg(lastMsg);
        } else if (
          lastMsg.scene === "team" &&
          lastMsg.type === "notification"
        ) {
          item.lastMsgShow = util.generateTeamSysmMsg(lastMsg);
        } else if (util.mapMsgType(lastMsg)) {
          item.lastMsgShow = `[${util.mapMsgType(lastMsg)}]`;
        } else {
          item.lastMsgShow = "";
        }
        if (item.updateTime) {
          item.updateTimeShow = util.formatDate(item.updateTime, true);
        }
        return item;
      });
      console.log(sessionlist, "sessionlist is :");
      return sessionlist;
    }
  },
  methods: {
    enterChat(session) {
      if (session && session.id)
        this.$store.dispatch("setCurrSession", session.id);
        this.$store.commit("isCheckMember", false);
    }
  }
};
</script>
<style lang='less' scoped>
.session {
  // position:relative;
  height:100%;
  .session-list {
    // width: 25%;
    // position: absolute;
    // top:40px;
    // bottom:0;
    // left:0;
    // right:0;
    overflow: auto;
    .session-item {
      height: 40px;
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>


