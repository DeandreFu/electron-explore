<template>
  <div>
    <div class="menu" @click="goto('sender')">文件发送客户端</div>
    <div class="menu" @click="goto('receiver')">文件接收客户端</div>
  </div>
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

<style lang="scss">
.menu {
  color: blue;
  cursor: pointer;
  display: inline-block;
  padding: 0px 12px;
}
</style>
