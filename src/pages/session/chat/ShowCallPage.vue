<template>
  <div class="call">
    <div v-if="waittingAccept && (!becallHasRecept && !becallHasReject)">
      <p>正在等待对方接听...</p>
    </div>
    <div v-if="becallHasRecept">
      <p>对方已接受您的语音通话请求</p>
      <p @click="handleLeaveChannel">请求方挂断</p>
      <div>
        <h2>参与通话有</h2>
        <p v-for="(people) in onCallUserInfos" :key="people">
          {{people.nick}}
        </p>
      </div>
    </div>
    <div v-if="becallHasReject">
      <p>对方已拒接您的语音通话请求</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import state from '../../../store/state';
export default {
  data () {
    return {
      waittingAccept: true
    }
  },
  computed: mapState({
    becallHasRecept: state => state.becallHasRecept,
    becallHasReject: state => state.becallHasReject,
    myInfo: state => state.myInfo,
    onCallUserInfos: state => state.onCallUserInfos
  }),
  methods: {
    handleLeaveChannel () {
      console.log('请求通话方挂断电话了')
      netcall.leaveChannel()
    }
  },
  mounted() {

  },
}
</script>


<style scoped>
.call {
  top: 0;
  width: 500px;
  height: 300px;
  background-color: gray;
  border: 2px solid yellow;
  text-align: center;
}
</style>
