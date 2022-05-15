<template>
  <div class="sender">
    <div>
      <button @click="genInviteCode">生成邀请码</button>
      <p>{{ inviteCode }}</p>
    </div>
    <button :disabled="!canSend" @click="handleTransition">开始传输</button>
  </div>
</template>

<script lang="ts">
import Peer, { DataConnection } from 'peerjs';
import { defineComponent } from 'vue';
import { genClientId } from '../utils';
import { ChannelMessage } from './interface';
const path = require('path');
const fs = require('fs');
const os = require('os');

let peer: Peer;
let conn: DataConnection;
let readStream: any;
let sendFinished = false;

const fileFullPath = path.join(os.homedir(), 'Downloads/sunset.jpg');

export default defineComponent({
  name: 'SenderPage',
  data() {
    return {
      inviteCode: '',
      canSend: false,
    };
  },
  methods: {
    genInviteCode() {
      const code = genClientId();
      this.inviteCode = code;
      this.initPeer();
    },
    initPeer() {
      // const clientId = genClientId();
      try {
        peer = new Peer(this.inviteCode, {
          host: '192.168.31.103',
          port: 9000,
          path: '/peer/webrtc',
          debug: 2,
        });

        peer.on('connection', (curConn: DataConnection) => {
          curConn.on('data', async (data) => {
            const parseData: ChannelMessage = JSON.parse(data);

            if (parseData.msgName === 'readyToReceive') {
              this.canSend = true;
              conn = curConn;
            }
          });
        });
      } catch (error) {
        console.error(error);
      }
    },

    handleTransition() {
      if (!this.inviteCode.length) return;

      const msg = {
        msgName: 'beginSendFile',
        fileName: path.basename(fileFullPath),
        sendTime: Date.now(),
      };

      conn.send(JSON.stringify(msg));

      conn.on('data', (data) => this.sendData(data));
    },

    sendData(data: string) {
      const parseData: ChannelMessage = JSON.parse(data);

      if (parseData.msgName === 'chunkReady') {
        if (sendFinished) {
          const msg = {
            msgName: 'fileSendFinish',
            sendTime: Date.now(),
          };

          conn.send(JSON.stringify(msg));
          /**
           * NOTE: setting the flag false
           */
          // readStream = null;
          sendFinished = false;
        } else {
          readStream.resume();
        }
      } else if (parseData.msgName === 'readyToReceiveFile') {
        readStream = fs.createReadStream(fileFullPath, {
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
    },
  },
});
</script>

<style scoped lang="scss">
.sender {
  width: 300px;
  height: 300px;
  border: 1px dashed #ddd;
}
</style>
