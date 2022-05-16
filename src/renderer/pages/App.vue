<template>
  <header>
    <router-link class="menu" to="/">首页</router-link>
    <router-link class="menu" to="/sender">文件发送客户端</router-link>
    <router-link class="menu" to="/receiver">文件接收客户端</router-link>
    <router-link class="menu" to="/call">通话请求端</router-link>
    <router-link class="menu" to="/answer">通话接收端</router-link>
  </header>
  <router-view />
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import { router } from '../router';

export default {
  name: 'App',
  setup() {
    // const electron = require('electron');
    const goto = (page: string) => {
      router.push(`/${page}`);
    };

    onMounted(() => {
      console.log(Date.now() - performance.timing.fetchStart);
    });

    return { goto };
  },
};
</script>

<style lang="scss" scoped>
header {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 6.4rem;
  background: #2a3a4a;

  .menu {
    font-size: 1.8rem;
    cursor: pointer;
    display: inline-block;
    padding: 0px 16px;
    color: #fff;
    text-decoration: none;

    &:focus {
      color: #4082f3;
    }

    &:hover {
      color: #4082f3;
    }
  }

  .active-link {
    color: #4082f3;
    font-weight: bold;
  }
}
</style>
