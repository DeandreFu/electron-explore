<template>
  <section class="container">
    <header class="header">
      <p class="code">{{ code }}</p>
      <button class="btn" @click="genInviteCode">创建会议码</button>
      <button class="btn">离开会议</button>
    </header>
    <div class="wrapper">
      <main class="main">
        <video class="video" ref="video"></video>
        <div class="media-operate">
          <button class="media-btn" @click="handleVideoCall">视频通话</button>
          <button class="media-btn" @click="handleAudioCall">语音通话</button>
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

let peer: Peer;
let conn: DataConnection;
let remotePeerId: string;

export interface NewsItem {
  content: string;
  sendTime: number;
  own?: boolean;
}

export default defineComponent({
  name: 'VideoCall',
  data() {
    return {
      code: '',
      message: '',
      news: [],
    } as {
      code: string;
      message: string;
      news: NewsItem[];
    };
  },
  beforeUnmount() {
    if (peer) {
      peer.destroy();
    }
  },
  methods: {
    async handleVideoCall() {
      try {
        // if (!peer) return;
        // const availableDevices = await navigator.mediaDevices.enumerateDevices();
        // console.log(availableDevices);
        const mStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: 1920,
            height: 1080,
          },
        });
        if (remotePeerId && mStream) {
          console.log('calling ' + remotePeerId);
          peer.call(remotePeerId, mStream);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleAudioCall() {
      //
    },
    sendMsg() {
      console.log('sendMsg');
      if (!conn || !this.message) return;

      const msg = {
        type: 'message',
        content: this.message,
        sendTime: Date.now(),
        peerId: this.code,
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
    genInviteCode() {
      this.code = genClientId();

      if (peer) {
        peer.destroy();
      }

      this.initPeer();
    },
    initPeer() {
      peer = new Peer(this.code, {
        host: '192.168.31.103',
        port: 9000,
        path: '/peer/webrtc',
        debug: 2,
      });

      peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
      });

      peer.on('connection', (curConn: DataConnection) => {
        conn = curConn;
        curConn.on('data', (data) => {
          console.log('Call -> ', data);
          if (data.type === 'signal' && data.content === 'connectSuccess') {
            console.log('Remote user connect successful.');

            if (data.peerId) {
              remotePeerId = data.peerId;
              curConn.send({
                type: 'signal',
                content: 'connectSuccess',
                peerId: this.code,
              });
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

      peer.on('call', (call: MediaConnection) => {
        // call.answer()
        console.log('Call client is listening call event');
        call.on('media', (media: MediaStream) => {
          const videoEle = this.$refs.video as HTMLVideoElement;
          videoEle.srcObject = media;
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
    align-items: center;
    border-bottom: 1px dashed #ddd;
    height: 5rem;

    .btn {
      margin: 0 12px;
    }

    .code {
      flex: 1;
      font-size: 24px;
    }
  }

  .wrapper {
    flex: 1;
    display: flex;
    .main {
      flex: 1;
      position: relative;
      font-size: 0;

      .video {
        width: 100%;
        height: 100%;
        background: #333;
      }

      .media-operate {
        position: absolute;
        bottom: 3.2rem;
        width: 100%;
        left: 50%;
        margin-left: -50%;
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
