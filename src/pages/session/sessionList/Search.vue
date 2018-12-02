<template>
  <div class='search'>
    <div class='input-box'>
      <input
        v-model="searchTeacherId"
        class='search-input'
        type="text"
        placeholder="搜索老师姓名或ID"
      >
      <button
        class='search-btn'
        @click="search"
      >搜索</button>
    </div>
    <div class='search-list'>
      <!-- <ul>
        <li
          v-for="item in searchList"
          @click='enterChat(item)'
        >
          {{item.to}}
        </li>
      </ul> -->
    </div>
  </div>
</template>
<script>
// import { to } from "@/util.js";
// import { searchTeacher } from "@/api/index";

export default {
  data() {
    return {
      searchTeacherId: "",
      searchList: [
        {
          id: "p2p-666",
          to: "666"
        },
        {
          id: "p2p-124",
          to: "124"
        },
        {
          id: "p2p-000",
          to: "永远幸福哦"
        },
        {
          id: "team-4151727",
          to: "呵呵"
        }
      ]
    };
  },
  methods: {
    async search() {
      console.log(this.searchTeacherId, "searchTeacherId");
      //请求搜索
      //let [err, res] = await to(searchTeacher({teacherId:this.searchTeacherId}))
    },
    enterChat(session) {
      if (session && session.id)
        this.$store.dispatch("setCurrSession", session.id);
    }
  }
};
</script>
<style scoped lang="less">
.search {
  box-sizing: border-box;
  height: 40px;
  border-bottom: 1px solid #ccc;
  .input-box {
    padding-top: 5px;
    padding-left: 20px;
    .search-input {
      height: 30px;
      width: 120px;
      outline: none;
      outline-style: none;
      border-radius: 5px;
      outline-color: transparent;
      box-shadow: none;
    }
    .search-btn {
      width: 60px;
      height: 30px;
      background: #fff;
      border-radius: 5px;
      outline: none;
      margin-left: 10px;
    }
  }
  .search-list {
    position: relative;
    z-index: 100;
    padding: 0 20px;
    ul {
      background: #ccc;
      border-radius: 0 0 5px 5px;
      width: 120px;
      cursor: pointer;
    }
  }
}
</style>


