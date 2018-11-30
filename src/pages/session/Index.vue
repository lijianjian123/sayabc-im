<template>
  <div class='sayabc-session'>
    <div class="session-list">
      <!-- <search />-->
      <session-list /> 
    </div>
    <div class='chat'>
      <!-- <chat-header/> -->
      <!-- 要显示聊天界面要有sessionId  通过store传递 -->
      <chat />
    </div>
    <div class='team-members'>
      <!-- 显示群成员信息 -->
      <team-members />
    </div>
  </div>
</template>

<script>
import SessionList from "./sessionList/Index.vue";
import Chat from "./chat/Index.vue";
import TeamMembers from "./TeamMembers";

export default {
  components: {
    SessionList,
    Chat,
    TeamMembers
  },
  computed: {
    sessionId() {
      return this.$store.state.currSessionId;
    }
  }
};
</script>

<style lang='less' scoped>
.sayabc-session{
    width:100%;
    height:100%;
    background:#e5e5e5;
    overflow: hidden;
    .session-list, .chat, .team-members {
        float: left;
        height:100%;
        box-sizing: border-box
    }
    .session-list {
        width:25%;
        min-width: 200px;
        border-right:1px solid #ccc;
    }
    .chat {
        width:55%;
    }
    .team-members {
        width:20%;
        min-width:200px;
        border-left:1px solid #ccc;
    }
}
</style>