<template>
  <div class="members_container">
    <div class="mask-item invite-members">
      <div class="item-header">
        <span class="fl">选择邀请成员</span>
        <span class="fr" @click="handleCloseInviteDialog">X</span>
      </div>
      <div class="item-main invite-list-main">
        <div class="fl members-list">
          <!-- 邀请成员排除自己 -->
          <span
            class="all-item-show"
            v-for="(item, index) in currentMembers"
            :key="index"
            @click="handleSelectMember(item)"
            v-if="item.account !== myInfo.account"
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
        <span @click="handleCloseInviteDialog">取消</span>
        <span @click="handleMembersInvite">邀请</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["members", "myInfo", "invalid", "invalidHint"],
  data() {
    return {
      currentMembers: [],
      hasSelectMembers: [],
      confirmSelectMembers: [], // hasSelectMembers不能使用的原因 TODO
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
    this.currentMembers = this.members;
    // console.log("members", this.myInfo);
  },
  methods: {
    handleCloseInviteDialog() {
      // 关闭邀请成员语音弹窗
      // 清除上一次弹窗列表和选择成员列表
      this.currentMembers = [];
      this.hasSelectMembers = [];
      // this.$store.commit('updateMaskState', false)
      this.$store.commit("updateSelectMemberDiaState", false);
    },
    handleSelectMember(item) {
      // 对 hasSelectMembers 数组进行添加和删除处理
      let temIndex = this.hasSelectMembers.indexOf(item);
      temIndex > -1
        ? this.hasSelectMembers.splice(temIndex, 1)
        : this.hasSelectMembers.push(item);
      this.confirmSelectMembers = this.hasSelectMembers
      console.log("选择成员列表", this.hasSelectMembers);
    },
    handleMembersInvite() {
      // 对选择的人员发起语音通话
      if (this.hasSelectMembers.length < 1) {
        console.log("请选择要语音的人员!");
        return;
      }
      // 关闭选择弹窗、理论应该在创建房间、加入房间后，发起通话后弹出 showcallpage
      this.handleCloseInviteDialog()
      this.netcallVideoLink();
    },
    // 通话相关函数封装 begin
    handleCreateChannel() {
      // 创建房间
      return netcall.createChannel({
        channelName: new Date().getTime().toString(), //必填 TODO 退出时候记得销毁 实际使用的时候 这个按照群组id进行创建房间 sessionId+account
        custom: "小组内秘密通话~~~", //可选
        webrtcEnable: true // 是否支持WebRTC方式接入，可选，默认为不开启
      });
    },
    handleJoinChannel(obj) {
      // 加入房间
      return netcall.joinChannel({
        // 这里需要注意从这里https://yunxin.163.com/im-demo下载的SDK仅仅是参考，官方文档更正确一些。比如type 而不是 mode在5.9.0的webrtc中
        channelName: obj.channelName, //必填，请确保此房间已被创建
        type: 1, // 模式，0音视频，1纯音频，2纯视频，3静默
        role: 0 // 角色，0-主播 1-观众
      });
    },
    handleCallOnePeople(curAccount) {
      // 发起单个通话请求
      return netcall
        .call({
          type: 1,
          account: curAccount, // 账号 TODO 多点的时候封装后分批处理
          webrtcEnable: true,
          pushConfig: {},
          sessionConfig: {
            recordVideo: false,
            recordAudio: false
          }
        })
        .then(() => {
          console.log("主人发起请求call成功");
          this.$store.commit("updateCallState", true);
        });
    },
     handleCallMulPeople() {
      // 批量发起通话请求
      // await Promise.all(this.hasSelectMembers.map(v=>this.handleCallOnePeople(v.account).then(()=>{console.log('成功')}))).catch(err=>console.log('批量call发生异常',err))
      let HSM = this.confirmSelectMembers
      for(let i=0;i<HSM.length;i++) {
        console.log('ddd',HSM[i])
         this.handleCallOnePeople(HSM[i].account).then((console.log('成功'))).catch((err)=>{console.log('异常')})
      }
    },

    // 通话相关函数封装 end

    netcallVideoLink() {
      // 点击开始语音
      if (this.invalid) {
        // this.$toast(this.invalidHint);
        console.log(this.invalidHint);
        return;
      }
      console.log("音频通话开始");

      this.handleCreateChannel().then(obj => {
          // 预定房间成功后的上层逻辑操作
          // eg: 初始化房间UI显示
          // eg: 加入房间
          console.log("正在加入房间")
        this.handleJoinChannel(obj).then(() => {
          console.log("本人加入房间成功", obj);
          // 这里弹出 ShowCallPage页面
              this.$store.commit('updateCallState', true)
              // 加入房间成功后的上层逻辑操作
              // eg: 开启麦克风
              // eg: 开启本地流
              // eg: 设置音量采集、播放
          // 加一层call控制器
            console.log('开始call',this.confirmSelectMembers,  this.confirmSelectMembers.length)
          this.confirmSelectMembers.length < 2
            ? this.handleCallOnePeople(this.confirmSelectMembers[0].account)
            : this.handleCallMulPeople()
        })
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

