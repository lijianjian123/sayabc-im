<template>
  <div class='team-info-content'>
    <div class='team-info-header'>{{isCheckMember?'组内成员':'老师信息'}}</div>
    <div v-if='sessionId'>
      <team-members v-show='isCheckMember' />
      <teacher-info v-show='!isCheckMember' />
    </div>
  </div>
</template>
<script>
import TeacherInfo from "./TeacherInfo.vue";
import TeamMembers from "./TeamMembers.vue";
export default {
  components: {
    TeacherInfo,
    TeamMembers
  },
  computed: {
    isCheckMember() {
      return this.$store.state.isCheckMember;
    },
    sessionId() {
      return this.$store.state.currSessionId;
    }
  }
};
</script>
<style lang='less' scoped>
.team-info-content {
  width: 100%;
  height: 100%;
  .team-info-header {
    height: 40px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
    line-height: 40px;
    padding-left: 10px;
  }
}
</style>


