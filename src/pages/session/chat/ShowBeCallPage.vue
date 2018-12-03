<template>
  <div class="netcall-becalling-box becall">
    <div v-if="beforeAccept && (!becallHasRecept && !becallHasReject)">
      <p>hi, {{myInfo.nick}} 有人叫你啊，接听不听？</p>
      <div class="btns">
        <span class="btn btn_yes" @click="handleYes">接听</span>
        <span class="btn btn_no" @click="handleNo">不想听</span>
      </div>
    </div>
    <div v-if="becallHasRecept">
      <p>开始通话吧</p>
      <p @click="handleLeaveChannel">被请求通话方挂断</p>
    </div>
    <div v-if="becallHasReject">
      您已拒绝通话（开发这里 可能会有多个人）
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      beforeAccept: true,
    }
  },
  computed: mapState({
    becallHasRecept: state => state.becallHasRecept,
    becallHasReject: state => state.becallHasReject,
    myInfo: state => state.myInfo
  }),
  methods: {
    handleYes () {

      // netcall.joinChannel()
      //   .then(()=>{
      //     netcall.response({
      //       accepted: true
      //     }).then(()=>{
      //       this.beforeAccept = false
      //     }).catch((err)=>{
      //       console.log('becall接受失败', err)
      //     })
      //   })
      //   .catch((err)=>{
      //     console.log('进入群语音失败了..', err)
      //   })
      netcall.joinChannel()
      // 告诉对方要接听了
      netcall.response({
        accepted: true,
        // beCalledInfo: obj
      }).then(()=>{
        // 接受后显示
        this.beforeAccept = false
        // 被叫接受语音通话 通信不在一个频道里.. 从initwebrtc里通知
        // this.$store.commit('updateBeCallHasRecept', true)
        // 选择接听后更改UI样式
      })
    },
    handleNo () {
      // 拒绝对方音频
      netcall.response({
        accepted: false,
        // beCalledInfo: obj
      }).then(()=>{
        // 拒绝后显示 在mu里
        this.beforeAccept = false
        // 被叫拒绝语音通话 在initwebrtc已重置
        // this.$store.commit('updateBeCallHasReject', true)
        // 选择拒绝接听后更改UI样式
      })
    },
    handleLeaveChannel () {
      // 结束语音聊天
      console.log('请求通话方挂断电话了')
      netcall.leaveChannel()
    }
  }
}
</script>


<style type="text/css">
.netcall-becalling-box {
  background-color: rgba(0, 0, 0, 0.8)
}
.becall {
  top: 0;
  width: 300px;
  height: 500px;
  background-color: yellow;
  border: 2px solid blue;
  text-align: center;
}
.btns {
  display: flex;
}
.btn {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid red;
  border-radius: 6px;
}
</style>