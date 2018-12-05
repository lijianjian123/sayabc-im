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
        <p>{{session.unread !== 0 && session.isAtMe ? '有人@我' : session.lastMsgShow}}</p>
        <p>{{session.unread}}</p>
      </li>
    </ul>
  </div>
</template>
<script>
import Search from "./Search.vue";
import util from "@/utils";
let hasUnreadSession = [];
export default {
  components: { Search },
  computed: {
    myInfo() {
      return this.$store.state.myInfo
    },
    msgs() {
      return this.$store.state.msgs
    },
    myPhoneId() {
      return `${this.$store.state.userUID}`;
    },
    userInfos() {
      return this.$store.state.userInfos;
    },
    sessionlist() {
      hasUnreadSession = [];
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
        if(item.unread !== 0) {
          let {id,unread} = item;
          let msgList = this.msgs[item.id];
          console.log(msgList,'msgList +++++++++')
          console.log(msgList.length-unread,'length +++++++++')
          let unreadMsg = msgList.slice(msgList.length-unread)
          console.log(unreadMsg,'unreadMsg +++++++++')
          unreadMsg.forEach((msg) => {
            if(msg.custom) {
              console.log(JSON.parse(msg.custom),this.myInfo.account,JSON.parse(msg.custom).includes(this.myInfo.account),
              'custom +++++++++')
            }
            if(msg.custom && JSON.parse(msg.custom).includes(this.myInfo.account)) { 
              item.isAtMe = true;
            }
          })
        }
        return item;
      });
      return sessionlist;
    },
    teamMsgReadsDetail() {
      console.log(this.$store.state.teamMsgReadsDetail,'this.$store.state.teamMsgReadsDetail')
      return this.$store.state.teamMsgReadsDetail
    }
  },
  methods: {
    enterChat(session) {
      if (session && session.id)
        this.$store.dispatch("setCurrSession", session.id);
        this.$store.commit("isCheckMember", false);
    },
    getSessionMsg(item) {
      let {sessionId,unread} = item;
      this.$store.commit('updateCurrSessionMsgs', {
          type: 'init',
          sessionId
        })
        console.log(this.$store.state.currSessionMsgs,'msg ++++++++++111111')
        let msgList = this.$store.state.currSessionMsgs;
        let unreadMsg = this.msgList.slice(msgList.length-unread)
        unreadMsg.forEach((item) => {
           if(item.custom && JSON.parse(item.custom).includes(this.myInfo.account)) { 
                item.isAtMe = true;
           }
        })
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


