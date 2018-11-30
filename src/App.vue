<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import cookie from "./utils/cookie";
import md5 from "./utils/md5";

function login() {
  //自动登陆
  // 本demo做一次假登录
  // 真实场景应在此向服务器发起ajax请求
  let sdktoken = md5("123456");
  // 服务端帐号均为小写
  cookie.setCookie("uid", "123".toLowerCase());
  cookie.setCookie("sdktoken", sdktoken);
}

export default {
  name: "App",
  async mounted() {
    //自动登陆
    await login();
    //链接sdk
    this.$store.dispatch('connect')
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
</style>
