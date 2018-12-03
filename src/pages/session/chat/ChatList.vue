<template>
  <div>
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
    userInfos: {
      type: Object,
      default() {
        return {};
      }
    }
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
    }
  },
  mounted() {
    setTimeout(() => {
      console.log(this.msglist, "msglist is :======");
    });
  }
};
</script>
<style lang='less' scoped>
</style>


