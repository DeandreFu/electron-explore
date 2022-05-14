<template>
  <div class="sender">
    <button @click="sendFile">Starting Send</button>
  </div>
</template>

<script lang="ts">
import Peer, { DataConnection } from 'peerjs';
import { ref } from 'vue';
const path = require('path');
const fs = require('fs');
const os = require('os');

export default {
  setup() {
    const fileFullPath = ref(path.join(os.homedir(), 'Downloads/sunset.jpg'));

    let peer;
    let conn: DataConnection;
    let readStream: any;
    let sendFinished = false;

    const sendFile = () => {
      peer = new Peer('fileSender', {
        host: '192.168.31.103',
        port: 9000,
        path: '/peer/webrtc',
        debug: 3,
      });

      conn = peer.connect('fileReceiver');

      conn.on('open', () => {
        console.log('Sender opening...');
        const msg = {
          msgName: 'beginSendFile',
          fileName: path.basename(fileFullPath.value),
          sendTime: Date.now(),
        };

        conn.send(JSON.stringify(msg));
      });

      conn.on('data', (data) => sendData(data));
    };

    const sendData = (data: string) => {
      console.log('Sender to start send data...');
      const parseData: {
        msgName: string;
        [index: string]: any;
      } = JSON.parse(data);

      if (parseData.msgName === 'chunkReady') {
        if (sendFinished) {
          const msg = {
            msgName: 'fileSendFinish',
            sendTime: Date.now(),
          };

          conn.send(JSON.stringify(msg));
        } else {
          readStream.resume();
        }
      } else if (parseData.msgName === 'readyToReceiveFile') {
        readStream = fs.createReadStream(fileFullPath.value, {
          highWaterMark: 10240,
          flags: 'r',
          autoClose: true,
          start: 0,
        });

        readStream.on('data', function (chunk: any) {
          const msg = {
            msgName: 'sendChunk',
            chunk: chunk.toString('hex'),
            sendTime: Date.now(),
          };

          readStream.pause();

          conn.send(JSON.stringify(msg));
        });

        readStream.on('end', function () {
          console.log('sender send ended.');
          sendFinished = true;
        });
      }
    };

    return {
      sendFile,
    };
  },
};
</script>

<style scoped lang="scss">
.sender {
  height: 300px;
  border: 1px solid gray;
}
</style>
