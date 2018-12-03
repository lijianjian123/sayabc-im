<template>
  <div class='team-info-content'>
    <div class='team-info-header'>
        <span>{{isCheckMember?'组内成员':'老师信息'}}</span>
        <button @click='toggleMembers("addTeamMembers")'>加人</button>
        <button @click='toggleMembers("removeTeamMembers")'>删人</button>
    </div>
    <div v-if='sessionId'>
      <team-members v-show='isCheckMember' />
      <teacher-info v-show='!isCheckMember' />
    </div>
  </div>
</template>
<script>
import TeacherInfo from "./TeacherInfo.vue";
import TeamMembers from "./TeamMembers.vue";
import util from "@/utils";
export default {
  data() {
    return {
        teamMemberList: {
            add: ['libbyfei','18811111111'],
            remove: ['18811111111']
        }
    }
  },
  components: {
    TeacherInfo,
    TeamMembers
  },
  computed: {
    isCheckMember() {
      return this.$store.state.isCheckMember;
    },
    scene() {
      return this.sessionId ? util.parseSession(this.sessionId).scene : "";
    },
    sessionId() {
      return this.$store.state.currSessionId;
    },
    teamInfo() {
      if (this.scene === "team") {
        var teamId = this.sessionId.replace("team-", "");
        let teamInfo = this.$store.state.teamlist.find(team => {
          return team.teamId === teamId;
        });
        return teamInfo;
      }
      return undefined;
    },
  },
  methods: {
    reviseTeamMembers() {
       if(this.teamMemberList.add.length) {
          this.toggleMembers("addTeamMembers");
       }
       if(this.teamMemberList.remove.length) {
          this.toggleMembers("removeTeamMembers");
       }
    },
    toggleMembers(funName) {
      var accounts = this.teamMemberList.remove;
      this.$store.dispatch('delegateTeamFunction', {
        functionName: funName, 
        options: {
          teamId: this.teamInfo.teamId,
          accounts: accounts,
          done: (error, obj)=>{
           if (error) {
              console.log(error,'移除报错')
              return;
            }
            console.log('移除成功',obj)
          }
        }
      })
    },
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


