<template>
  <div>
    <!-- 两个container需要判断是否在当前的会话窗口中 -->
    <div id="container">
      <show-call-page
        v-if="chatVoiceShowCall && !isHandUp"
      />
    </div>
    <div id="remoteContainer">
      <show-be-call-page
        v-if="chatVoiceShowBeCall && !isHandUp"
      />
    </div>
    <ul>
      <chat-item
        v-for="msg in msglist"
        :rawMsg="msg"
        :isRobot="isRobot"
        :myInfo="myInfo"
        :key="msg.idClient"
        :userInfos='userInfos'
      ></chat-item>
    </ul>
  </div>
</template>
<script>
import ChatItem from "./ChatItem";
import ShowCallPage from './ShowCallPage'
import ShowBeCallPage from './ShowBeCallPage'

export default {
  components: {
    ChatItem,
    ShowCallPage,
    ShowBeCallPage
  },
  props: {
    msglist: {
      type: Array,
      default() {
        return [];
      }
    },
    isRobot: {
      type: Boolean,
      default() {
        return false;
      }
    },
    myInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    teamInfo: {
      type: Object,
      default() {
        return {};
      }
    },
    userInfos: {
      type: Object,
      default() {
        return {};
      }
    },
    sessionId: String
  },
  computed: {
    chatVoiceShowCall () {
      return this.$store.state.chatVoiceShowCall
    },
    chatVoiceShowBeCall  () {
      return this.$store.state.chatVoiceShowBeCall
    },
    isHandUp () {
      return this.$store.state.isHandUp
    },
    sessionlist () {
      return this.$store.state.sessionlist
    }
  },
  mounted() {
    setTimeout(() => {
      console.log(this.msglist, "msglist is :======");
    });
    // console.log('teamInfo',this.teamInfo)
    // TODO 获取当前会话和发起通话teamID是否一致，不一致则不显示call和becall页面
  }
};
</script>
<style lang='less' scoped>
#container, #remoteContainer {
  position: absolute;
  top: 0;
  z-index: 2;
  width: 55%;
}
</style>


