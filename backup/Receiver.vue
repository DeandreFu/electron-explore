<template>
  <div class="receiver">
    <p class="error">{{ errMsg }}</p>
    <div class="container">
      <input class="input" v-model="code" placeholder="请输入邀请码" />
      <button class="btn" @click="handleCreateChannel">创建通道</button>
    </div>
    <button @click="handleReceiveData">开始接收</button>
  </div>
</template>

<script lang="ts">
import Peer, { DataConnection } from 'peerjs';
import { ref, defineComponent } from 'vue';
const path = require('path');
const fs = require('fs');
const os = require('os');

let peer: Peer;

export default defineComponent({
  setup() {
    const fileSavePath = ref(path.join(os.homedir(), 'Desktop'));
    let wStream: any;

    const openWriteStream = async (): Promise<any> => {
      return new Promise((resolve, reject) => {
        console.log('openWriteStream file', fileSavePath.value);
        const wStream = fs.createWriteStream(fileSavePath.value);

        wStream.on('open', () => {
          console.log('Receiver opening...');
          resolve(wStream);
        });

        wStream.on('error', (err: any) => {
          console.error(err);
          reject('create write stream error...');
        });

        wStream.on('finish', () => {
          console.log('write finished', true);
        });
      });
    };

    const register = () => {
      const peer = new Peer('fileReceiver', {
        host: '192.168.31.103',
        port: 9000,
        path: '/peer/webrtc',
        debug: 3,
      });

      peer.on('connection', (conn: DataConnection) => {
        conn.on('data', async (data) => {
          data = JSON.parse(data);

          console.log('---- receiver connection ----');
          console.log(data);
          console.log('---- receiver connection ----');

          if (data.msgName === 'beginSendFile') {
            fileSavePath.value = path.join(fileSavePath.value, Date.now().toString() + data.fileName);

            wStream = await openWriteStream();

            const msg = {
              msgName: 'readyToReceiveFile',
              sendTime: Date.now(),
            };

            conn.send(JSON.stringify(msg));
          } else if (data.msgName === 'fileSendFinish') {
            wStream.end();
          } else if (data.msgName === 'sendChunk') {
            const buffer = Buffer.from(data.chunk, 'hex');

            wStream.write(buffer);

            const msg = {
              msgName: 'chunkReady',
              sendTime: Date.now(),
            };

            conn.send(JSON.stringify(msg));
          }
        });
      });
    };

    return { register };
  },
  data() {
    return {
      code: '',
      errMsg: '',
    };
  },
  methods: {
    handleCreateChannel() {
      if (!this.code) {
        this.errMsg = '请输入正确的邀请码';
        return;
      }

      this.handleConnect(this.code);
    },
    handleConnect(channelId: string) {
      try {
        peer = new Peer(channelId, {
          host: '192.168.31.103',
          port: 9000,
          path: '/peer/webrtc',
          debug: 3,
        });

        peer.on('connection', (conn: DataConnection) => {
          const msg = {
            msgName: 'connectSuccessful',
            sendTime: Date.now(),
          };
          conn.send(JSON.stringify(msg));
        });
      } catch (error) {
        console.log(error);
      }
    },

    handleReceiveData() {
      const fileSavePath = ref(path.join(os.homedir(), 'Desktop'));
      let wStream: any;

      const openWriteStream = async (): Promise<any> => {
        return new Promise((resolve, reject) => {
          console.log('openWriteStream file', fileSavePath.value);
          const wStream = fs.createWriteStream(fileSavePath.value);

          wStream.on('open', () => {
            console.log('Receiver opening...');
            resolve(wStream);
          });

          wStream.on('error', (err: any) => {
            console.error(err);
            reject('create write stream error...');
          });

          wStream.on('finish', () => {
            console.log('write finished', true);
          });
        });
      };

      peer.on('connection', (conn: DataConnection) => {
        conn.on('data', async (data) => {
          data = JSON.parse(data);

          if (data.msgName === 'beginSendFile') {
            fileSavePath.value = path.join(fileSavePath.value, Date.now().toString() + `_${data.fileName}`);

            wStream = await openWriteStream();

            const msg = {
              msgName: 'readyToReceiveFile',
              sendTime: Date.now(),
            };

            conn.send(JSON.stringify(msg));
          } else if (data.msgName === 'fileSendFinish') {
            wStream.end();
          } else if (data.msgName === 'sendChunk') {
            const buffer = Buffer.from(data.chunk, 'hex');

            wStream.write(buffer);

            const msg = {
              msgName: 'chunkReady',
              sendTime: Date.now(),
            };

            conn.send(JSON.stringify(msg));
          }
        });
      });
    },
  },
});
</script>

<style scoped lang="scss">
.receiver {
  width: 300px;
  height: 300px;
  padding: 14px;
  border: 1px dashed #ddd;

  .error {
    font-size: 12px;
    color: #f66;
  }

  .container {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .input {
      flex: 1;
      outline: none;

      &:force {
        border: #4082f3;
      }
    }
    .btn {
      margin-left: 14px;
    }
  }
}
</style>
