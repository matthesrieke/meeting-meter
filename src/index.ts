import * as  badgets from './badget-reader';

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as uuid from 'uuid';
import * as CircularJSON from 'circular-json';

const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

let connections = {};

wss.on('connection', (ws: WebSocket) => {
    ws.id = uuid.v4();
    connections[ws.id] = ws;

    ws.on('close', id => {
        delete connections[ws.id];
    });

});

badgets.readBadgets((deviceId) => {
    const obj = {
        time: new Date().toISOString(),
        device: deviceId,
        group: 'WM'
    };

    const payload = JSON.stringify(obj);

    for (const wsId in connections) {
        if (connections.hasOwnProperty(wsId)) {
            const ws = connections[wsId];
            try {
                ws.send(payload);
            } catch (error) {
                console.warn(error);
            }
            
        }
    }
   
})

server.listen(process.env.PORT || 8999, () => {
    console.log('Server started on port ${server.address().port} :)');
});
