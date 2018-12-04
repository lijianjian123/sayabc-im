<template>
  <div class="members_container">
    <div class="mask-item invite-members">
      <div class="item-header">
        <span class="fl">选择邀请成员</span>
        <span class="fr" @click="handleCancleInvite">X</span>
      </div>
      <div class="item-main invite-list-main">
        <div class="fl members-list">
          <span
            class="all-item-show"
            v-for="(item, index) in currentMembers"
            :key="index"
            @click="handleSelectMember(item)"
          >{{item.account}}</span>
        </div>
        <div class="fl invite-list">
          <span
            class="select-item-show"
            v-for="(item, index) in hasSelectMembers"
            :key="index"
          >{{item.account}}</span>
        </div>
      </div>
      <div class="item-btns">
        <span @click="handleCancleInvite">取消</span>
        <span @click="handleMembersInvite">邀请</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentMembers: [],
      hasSelectMembers: []
    };
  },
  computed: {
    sessionId() {
      return this.$store.state.currSessionId;
    },
    teamMembers() {
      return this.$store.state.teamMembers;
    }
  },
  mounted() {
    this.currentMembers = [this.teamMembers]
    console.log('sessionId', this.sessionId)
  },
  methods: {
    handleCancleInvite() {
      // 关闭邀请成员语音弹窗
      // 清除上一次弹窗列表和选择成员列表
      this.currentMembers = [];
      this.hasSelectMembers = [];
      this.$store.commit('updateMaskState', false)
      this.$store.commit('updateSelectMemberDiaState', false)
    },
    handleSelectMember(item) {
      // 对 hasSelectMembers 数组进行添加和删除处理 TODO 有问题
      this.hasSelectMembers.includes(item)
        ? this.hasSelectMembers.splice(item, 1)
        : this.hasSelectMembers.push(item);
      console.log("选择成员列表", this.hasSelectMembers);
    },
    handleMembersInvite() {
      // 对选择的人员发起语音通话
      if (this.hasSelectMembers.length < 1) return;
      this.netcallVideoLink()
    },
    netcallVideoLink () { // 点击开始语音
    // TODO 权限的控制
      // if (this.invalid) {
      //   this.$toast(this.invalidHint)
      //   return
      // }
      let that = this
      console.log('音频通话开始', netcall)
      // 创建房间
      netcall.createChannel({
        channelName: new Date().getTime().toString(), //必填 TODO 退出时候记得销毁 实际使用的时候 这个按照老师id进行创建房间，TODO做重复校验
        custom: 'a80-a81秘密通话~~~', //可选
        webrtcEnable: true // 是否支持WebRTC方式接入，可选，默认为不开启
      }).then(function(obj) {
        // 预定房间成功后的上层逻辑操作
        // eg: 初始化房间UI显示
        // eg: 加入房间
        console.log('初始化成功',obj) // obj 返回发送的数据
        console.log('正在加入房间')
        netcall.joinChannel({
          // 这里需要注意从这里https://yunxin.163.com/im-demo下载的SDK仅仅是参考，官方文档更正确一些。比如type 而不是 mode在5.9.0的webrtc中
            channelName: obj.channelName, //必填，请确保此房间已被创建
            // mode: 0, // 模式，0音视频，1纯音频，2纯视频，3静默
            type: 1, // 模式，0音视频，1纯音频，2纯视频，3静默
            role: 0 // 角色，0-主播 1-观众
          })
          .then(function(obj) {
            // obj结构 => {account,cid,uid}
            console.error('本人加入房间成功', obj)
            // 加入房间成功后的上层逻辑操作
              // eg: 开启摄像头
              // eg: 开启麦克风
              // eg: 开启本地流
              // eg: 设置音量采集、播放
              // eg: 设置视频画面尺寸等等，具体请参照p2p呼叫模式
              // 开始呼叫?
                // 发起通话请求
              console.error('主人开始发起通话请求')
                netcall.call({
                  type: 1,
                  account: 'a81', // 账号 TODO 多点的时候封装后分批处理
                  webrtcEnable: true,
                  pushConfig: {},
                  sessionConfig:{
                    recordVideo: false,
                    recordAudio: false
                  }
                }).then(function(){
                  console.log('主人发起请求call成功')
                  that.$store.commit('updateCallState', true)
                })
          })
          .catch(function(err){
            console.log('加入房间失败', err)
          })
      }).catch(function(err){
        console.log('初始化失败', err)
      });
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
.mask-item {
  // 通用mask子元素
  width: 700px;
  height: 500px;
  background: #fff;
  border: 1px solid gray;
  border-radius: 6px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 10px;
  .item-header {
    height: 30px;
    line-height: 30px;
    padding: 10px;
    border-bottom: 1px solid red;
  }
  .invite-list-main {
    border-bottom: 1px solid red;
    overflow: hidden;
    span {
      display: inline-block;
      padding: 4px 6px;
      border: 1px solid red;
      margin-right: 20px;
      margin-top: 10px;
    }
    .members-list {
      width: 70%;
      height: 400px;
      border-right: 1px solid red;
      box-sizing: border-box;
    }
  }
  .item-btns {
    text-align: center;
    height: 30px;
    line-height: 30px;
    padding-top: 10px;
    span {
      display: inline-block;
      margin-right: 20px;
      border: 1px solid gray;
      border-radius: 6px;
      padding: 4px 18px;
      cursor: pointer;
    }
  }
}
</style>

