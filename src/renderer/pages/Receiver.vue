<template>
  <div @click="register">Receiver</div>
</template>

<script lang="ts">
import Peer, { DataConnection } from 'peerjs';
import { ref } from 'vue';
const path = require('path');
const fs = require('fs');
const os = require('os');

export default {
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
};
</script>
