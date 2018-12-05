<template>
  <div class='sayabc-session'>
    <!-- 登录伪造页面  begin-->
    <div class="login" v-if="!temAccountName">
      <input type="text" placeholder="请输入账号" v-model="account">
      <button @click="handleLogin">登录</button>
    </div>
    <!-- 登录伪造页面 end-->
    <div class="session-list">
      <session-list /> 
    </div>
    <div class='chat'>
      <!-- 要显示聊天界面要有sessionId  通过store传递 -->
      <chat />
    </div>
    <div class='team-info'>
      <!-- 显示群成员信息 -->
      <team-info />
    </div>
    <!-- 一些全局蒙层模块 begin -->
    <!-- 需要将各个部分拆分成组件 全屏需要更新 showMask 字段 -->
    <div class="sayabc-mask" v-if="showMask">
      <!-- TODO这部分将会放在 SelectMemers.vue -->
      <!-- <select-members v-if="showSelectMember"/> -->
    </div>
    <!-- 一些全局蒙层模块 end -->
  </div>
</template>

<script>
import SessionList from "./sessionList/Index.vue";
import Chat from "./chat/Index.vue";
import TeamInfo from "./teamInfo/Index.vue";
// import SelectMembers from './chat/SelectMemers'

import cookie from "@/utils/cookie";
import md5 from "@/utils/md5";


export default {
  data () {
    return {
      account: ''
    }
  },
  components: {
    SessionList,
    Chat,
    TeamInfo,
    // SelectMembers
  },
  computed: {
    sessionId() {
      return this.$store.state.currSessionId;
    },
    temAccountName () {
      return this.$store.state.temAccountName
    },
    showMask() {
      return this.$store.state.showMask;
    },
    // showSelectMember () {
    //   return this.$store.state.showSelectMember
    // }
  },
  methods: {
    handleLogin () {
      console.log('denglu', this.account)
      if(!this.account) return

      let sdktoken = md5("123456");
      cookie.setCookie("uid", this.account.toLowerCase());
      cookie.setCookie("sdktoken", sdktoken);

      this.$store.commit('updateAccount', this.account)
      this.$store.dispatch('connect')
    }
  }
};
</script>

<style lang='less' scoped>
.fl {
  float: left;
}
.fr {
  float: right;
}
.sayabc-session{
    width:100%;
    height:100%;
    background:#e5e5e5;
    overflow: hidden;
    .login {
      position: absolute;
      top: 0;
      width: 100%;
      height: 80px;
      line-height: 80px;
      z-index: 999;
      border: 1px solid yellow;
      text-align: center;
      background: rgba(0, 0, 0, 1)
    }
    .session-list, .chat, .team-info {
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
    .team-info {
        width:20%;
        min-width:200px;
        border-left:1px solid #ccc;
    }
    .sayabc-mask {
      width: 100%;
      height: 100%;
      position: relative;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, .4);
      // .mask-item { // 通用mask子元素
      //   width: 700px;
      //   height: 500px;
      //   background: #fff;
      //   border: 1px solid gray;
      //   border-radius: 6px;
      //   position: absolute;
      //   left: 50%;
      //   top: 50%;
      //   transform: translate(-50%, -50%);
      //   padding: 10px;
      //   .item-header {
      //     height: 30px;
      //     line-height: 30px;
      //     padding: 10px;
      //     border-bottom: 1px solid red;
      //   }
      //   .invite-list-main {
      //     border-bottom: 1px solid red;
      //     overflow: hidden;
      //     span {
      //       display: inline-block;
      //       padding: 4px 6px;
      //       border: 1px solid red;
      //       margin-right: 20px;
      //       margin-top: 10px;
      //     }
      //     .members-list {
      //       width: 70%;
      //       height: 400px;
      //       border-right: 1px solid red;
      //       box-sizing: border-box;
      //     }
      //   }
      //   .item-btns {
      //     text-align: center;
      //     height: 30px;
      //     line-height: 30px;
      //     padding-top: 10px;
      //     span {
      //       display: inline-block;
      //       margin-right: 20px;
      //       border: 1px solid gray;
      //       border-radius: 6px;
      //       padding: 4px 18px;
      //       cursor: pointer;
      //     }
      //   }
      // }
    }
}
</style>