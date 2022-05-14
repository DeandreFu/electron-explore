'use strict';

const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();

const PORT = 9000;
let clientCount = 0;

app.get('/', (req, res, next) => res.send('Hello WebRTC!'));

const server = app.listen(PORT, () => {
  console.log(`The service is running on http://0.0.0.0:${PORT}`);
});

const peerServer = ExpressPeerServer(server, {
  path: '/webrtc',
});

app.use('/peer', peerServer);

peerServer.on('connection', (client) => {
  clientCount++;

  console.log(`Welcome the ${client} to connect and there are ${clientCount} clients now.`);
});

peerServer.on('disconnect', (client) => {
  clientCount--;

  console.log(`the ${client} had disconnected and there are ${clientCount} clients now.`);
});
