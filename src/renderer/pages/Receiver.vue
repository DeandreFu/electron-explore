<template>
  <div class="receiver">
    <p class="error">{{ errMsg }}</p>
    <div class="container">
      <input class="input" v-model="code" placeholder="请输入邀请码" />
      <button class="btn" @click="handleCreateChannel">创建通道</button>
    </div>
    <!-- <button @click="handleReceiveData">开始接收</button> -->
  </div>
</template>

<script lang="ts">
import { WriteStream } from 'original-fs';
import Peer, { DataConnection } from 'peerjs';
import { ref, defineComponent } from 'vue';
const path = require('path');
const fs = require('fs');
const os = require('os');

import { genClientId } from '../utils';
import { ChannelMessage } from './interface';

let peer: Peer;
let conn: DataConnection;
let wStream: WriteStream | null;

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

      this.handleConnect();
    },
    handleConnect() {
      try {
        const clientId = genClientId();

        peer = new Peer(clientId, {
          host: '192.168.31.103',
          port: 9000,
          path: '/peer/webrtc',
          debug: 2,
        });

        conn = peer.connect(this.code);

        conn.on('open', () => {
          const msg = {
            msgName: 'readyToReceive',
            sendTime: Date.now(),
          };
          conn.send(JSON.stringify(msg));
        });
        // peer.on('connection', (conn: DataConnection) => {
        //   const msg = {
        //     msgName: 'connectSuccessful',
        //     sendTime: Date.now(),
        //   };
        //   conn.send(JSON.stringify(msg));
        // });
        conn.on('data', (data) => this.handleReceiveData(data));
      } catch (error) {
        console.log(error);
      }
    },

    async handleReceiveData(data: string) {
      const fileSavePath = ref(path.join(os.homedir(), 'Desktop'));

      const parseData: ChannelMessage = JSON.parse(data);

      if (parseData.msgName === 'beginSendFile') {
        fileSavePath.value = path.join(fileSavePath.value, Date.now().toString() + `_${parseData.fileName}`);

        wStream = await this.openWriteStream(fileSavePath.value);

        const msg = {
          msgName: 'readyToReceiveFile',
          sendTime: Date.now(),
        };

        conn.send(JSON.stringify(msg));
      } else if (parseData.msgName === 'fileSendFinish') {
        wStream?.end();
        wStream = null;
        // wStream.close();
      } else if (parseData.msgName === 'sendChunk') {
        const buffer = Buffer.from(parseData.chunk as string, 'hex');

        if (wStream) {
          wStream?.write(buffer);
        }

        const msg = {
          msgName: 'chunkReady',
          sendTime: Date.now(),
        };

        conn.send(JSON.stringify(msg));
      }
    },

    async openWriteStream(filePath: string): Promise<any> {
      return new Promise((resolve, reject) => {
        console.log('openWriteStream file', filePath);
        const writeFileStream = fs.createWriteStream(filePath);

        writeFileStream.on('open', () => {
          console.log('Receiver opening...');
          resolve(writeFileStream);
        });

        writeFileStream.on('error', (err: any) => {
          console.error(err);
          reject('create write stream error...');
        });

        writeFileStream.on('finish', () => {
          console.log('write finished', true);
          // writeFileStream = null;
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
