<template>
  <section class="container">
    <header class="header">
      <p class="errMsg">{{ errMsg }}</p>
      <input type="text" class="input" v-model="code" placeholder="请输入会议码" />
      <button class="btn" @click="handleJoinMeeting">加入会议</button>
    </header>
    <div class="wrapper">
      <main class="main">
        <video class="video" ref="video"></video>
        <div class="media-operate">
          <button class="media-btn">结束</button>
        </div>
      </main>
      <aside class="sidebar">
        <div class="news">
          <ul class="news-wrapper">
            <li
              v-for="(item, index) in news"
              :key="index"
              :class="{
                'news-item': true,
                'news-me': item.own,
              }"
            >
              {{ item.content }}
            </li>
          </ul>
        </div>
        <div class="sender">
          <input type="text" class="send-ipt" v-model="message" @keyup.enter="sendMsg" />
          <button class="send-btn" @click="sendMsg">发送</button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Peer, { DataConnection, MediaConnection } from 'peerjs';

import { genClientId } from '../utils';
import { NewsItem } from './VideoCall.vue';

let peer: Peer;
let conn: DataConnection;
let initiatedPeer = false;
let peerId: string;
let remotePeerId: string;

export default defineComponent({
  name: 'VideoAnswer',
  data() {
    return {
      code: '',
      errMsg: '',
      message: '',
      news: [],
    } as {
      code: string;
      errMsg: string;
      message: string;
      news: NewsItem[];
    };
  },
  methods: {
    sendMsg() {
      if (!conn || !this.message) return;
      const msg = {
        type: 'message',
        content: this.message,
        sendTime: Date.now(),
        peerId: peerId,
      };

      conn.send({
        ...msg,
        own: false,
      });
      this.news.push({
        ...msg,
        own: true,
      });
      this.message = '';
    },
    handleJoinMeeting() {
      if (!this.code) {
        this.errMsg = 'Invalid code and please check again!';
        return;
      }

      if (this.errMsg) {
        this.errMsg = '';
      }

      if (!peer) {
        this.initPeer();
      } else {
        peer.destroy();
        this.initPeer();
      }

      conn = peer.connect(this.code);

      conn.on('open', () => {
        console.log('the connection is opened...');

        conn.send({
          type: 'signal',
          content: 'connectSuccess',
          peerId: peerId,
        });

        conn.on('data', (data) => {
          console.log('Answer -> ', data);

          if (data.type === 'signal' && data.content === 'connectSuccess') {
            if (data.peerId) {
              remotePeerId = data.peerId;
            }
          }

          if (data.type === 'message' && data.content) {
            this.news.push({
              content: data.content,
              sendTime: data.sendTime,
              own: data.own,
            });
          }
        });
      });

      conn.on('close', () => {
        console.log('the connection had closed');
      });

      conn.on('error', (err) => {
        console.error(err);
      });
    },
    initPeer() {
      const clientId = genClientId();
      peer = new Peer(clientId, {
        host: '192.168.31.103',
        port: 9000,
        path: '/peer/webrtc',
        debug: 3,
      });

      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
        peerId = id;
      });

      peer.on('collection', (curConn: DataConnection) => {
        curConn.on('data', (data) => {
          console.log('Call -> ', data);
        });
      });

      peer.on('call', async (call: MediaConnection) => {
        console.log(call);
        console.log('accept the calling');
        const mStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: 1920,
            height: 1080,
          },
        });
        if (mStream) {
          console.log('answer...');
          call.answer(mStream);
        }

        call.on('media', (stream: MediaStream) => {
          const videoEle = this.$refs.video as HTMLVideoElement;
          videoEle.srcObject = stream;
          videoEle.onloadedmetadata = () => {
            videoEle.play();
          };
        });
      });

      peer.on('close', () => {
        console.log('the connection had closed!');
      });

      peer.on('disconnected', () => {
        console.log('the connection had disconnected!');
      });

      peer.on('error', (err) => {
        console.error(err);
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px dashed #ddd;
    height: 5rem;
    font-size: 1.4rem;

    .errMsg {
      color: #f66;
      margin-right: 12px;
    }

    .btn {
      margin: 0 12px;
    }

    .input {
      width: 20rem;
    }
  }

  .wrapper {
    flex: 1;
    display: flex;
    .main {
      flex: 1;
      position: relative;

      .video {
        width: 100%;
        height: 100%;
        background: #333;
      }

      .media-operate {
        position: absolute;
        bottom: 3.2rem;
        left: 50%;
        margin-left: -50%;
        width: 100%;
      }

      .media-btn {
        background-color: rgb(211, 14, 54);
        color: #fff;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 1px solid #f9f9f9;
        margin: 0 8px;
        cursor: pointer;
        overflow: hidden;
      }
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      width: 260px;
      padding: 14px;

      .news {
        flex: 1;

        &-wrapper {
          padding: 0;
        }

        &-item {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          list-style: none;
          padding: 4px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
          background-color: #f9f9f9;
        }

        &-me {
          justify-content: flex-end;
          background-color: aquamarine;
        }
      }
      .sender {
        display: flex;
        align-items: center;
        height: 48px;

        .send-ipt {
          flex: 1;
        }

        .send-btn {
          margin-left: 12px;
        }
      }
    }
  }
}
</style>
