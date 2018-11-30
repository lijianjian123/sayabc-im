<template>
  <div>
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
export default {
  components: {
    ChatItem
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
  mounted() {
    setTimeout(() => {
      console.log(this.msglist, "msglist is :======");
    });
  }
};
</script>
<style lang='less' scoped>
</style>


