<template>
  <div class='team-members'>
    <ul class='team-members-list'>
      <li v-for='member in members'>
        <span class='member-avatar'>
          <img :src="member.avatar" alt="群成员头像">
        </span>
        <span class='member-alias'>
          {{member.alias}}
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import util from "@/utils";
export default {
  methods: {
    searchUsers(Accounts) {
      this.$store.dispatch("searchUsers", {
        accounts: Accounts,
        done: users => {
          this.updateTeamMember(users);
        }
      });
    },
    updateTeamMember(users) {
      users.forEach(user => {
        var member = this.members.find(member => {
          return member.account === user.account;
        });
        if (member) {
          member.avatar = user.avatar;
          member.alias = member.nickInTeam || user.nick;
        }
      });
    },
    getMembers(teamInfo) {
      if (!teamInfo) {
        return false;
      }
      var teamMembers = this.$store.state.teamMembers[teamInfo.teamId];
      if (teamMembers === undefined) {
        this.$store.dispatch("getTeamMembers", teamInfo.teamId);
      }
    }
  },
  computed: {
    sessionId() {
      console.log("lalalalala change");
      return this.$store.state.currSessionId;
    },
    scene() {
      return this.sessionId ? util.parseSession(this.sessionId).scene : "";
    },
    teamInfo() {
      if (this.scene === "team") {
        var teamId = this.sessionId.replace("team-", "");
        let teamInfo = this.$store.state.teamlist.find(team => {
          return team.teamId === teamId;
        });
        //获取群成员
        this.getMembers(teamInfo);
        return teamInfo;
      }
      return undefined;
    },
    members() {
      if (this.teamInfo) {
        var members = this.$store.state.teamMembers[this.teamInfo.teamId];
        var userInfos = this.$store.state.userInfos;
        var needSearchAccounts = [];
        if (members) {
          members = members.map(item => {
            var member = Object.assign({}, item); //重新创建一个对象，用于存储展示数据，避免对vuex数据源的修改
            member.valid = true; //被管理员移除后，标记为false
            if (member.account === this.$store.state.userUID) {
              member.alias = "我";
              member.avatar = this.$store.state.myInfo.avatar;
              this.isOwner = member.type === "owner";
              this.hasManagePermission = member.type !== "normal";
            } else if (userInfos[member.account] === undefined) {
              needSearchAccounts.push(member.account);
              member.avatar = member.avatar || this.avatar;
              member.alias = member.nickInTeam || member.account;
            } else {
              member.avatar = userInfos[member.account].avatar;
              member.alias =
                member.nickInTeam || userInfos[member.account].nick;
            }
            return member;
          });
          //如果群中的成员没有在现有的用户列表中，需要重新拉取用户信息
          if (needSearchAccounts.length > 0 && !this.hasSearched) {
            this.hasSearched = true;
            while (needSearchAccounts.length > 0) {
              this.searchUsers(needSearchAccounts.splice(0, 150));
            }
          }
          return members;
        }
        return [];
      }
    }
  }
};
</script>
<style lang='less' scoped>
   .team-members {
       height:100%;
       overflow: auto;
       .team-members-list {
         padding:10px;
         li{
             height:50px;
             line-height:50px;
             .member-avatar img{
                width:40px;
                height:40px;
                border-radius: 50%;
             }
             .member-alias{
                 margin-left:10px;
                 vertical-align: middle
             }
         }
       }
   }
</style>


