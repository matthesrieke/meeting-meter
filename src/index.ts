import { BadgeMapper } from './badge-mapper';
import * as badgeReader from './badge-reader';

import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as uuid from 'uuid';
import * as CircularJSON from 'circular-json';
import { Badge } from './model/badge';
import { Meeting } from './meeting';

const BASE_URL = '';
const app = express();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const mapper = new BadgeMapper();
let meeting: Meeting;

let connections = {};

wss.on('connection', (ws: WebSocket) => {
    ws.id = uuid.v4();
    connections[ws.id] = ws;

    ws.on('close', id => {
        delete connections[ws.id];
    });

});

const sendPayload = function (payload: any): void {
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
}

badgeReader.readBadges((deviceId) => {
    const badge = new Badge();
    badge.id = deviceId;
    badge.lastScan = new Date();

    console.log('Scanned badge: ' + JSON.stringify(badge));
    if (meeting) {
        meeting.onBadgeScanned(badge);
    }
    
    const payload = JSON.stringify(badge);
    sendPayload(payload);
});

// require('./dummy-badge-reader').readBadges((deviceId) => {
//     const badge = new Badge();
//     badge.id = deviceId;
//     badge.lastScan = new Date();

//     console.log('Scanned badge: ' + JSON.stringify(badge));

//     if (meeting) {
//         meeting.onBadgeScanned(badge);
//     }

//     const payload = JSON.stringify(badge);
//     sendPayload(payload);
// });

app.get(BASE_URL + '/unmappedBadges', function (req, res) {
    if (meeting) {
        res.json(meeting.getUnmappedBadges());
    }
    else {
        res.json([]);
    }
});

app.post(BASE_URL + '/startMeeting', function (req, res) {
    meeting = new Meeting(mapper);
    meeting.startMeeting();
    res.status(204);
    res.send();
});

app.post(BASE_URL + '/endMeeting', function (req, res) {
    if (meeting) {
        meeting.endMeeting();
    }
    res.status(204);
    res.send();
});

app.get(BASE_URL + '/currentMeeting', function (req, res) {
    if (meeting) {
        const result: any = {
            badges: meeting.getMeetingBadges(),
            start: meeting.getStartDate().toISOString(),
            totalCosts: meeting.calculateTotalCosts()
        };

        if (meeting.getEndDate()) {
            result.endDate = meeting.getEndDate()
        }

        res.json(result);
    }
    else {
        res.status(404);
        res.send({ error: 'no meeting started' });
    }
});

const port = process.env.NODE_PORT || 8999;
server.listen(port, () => {
    console.log('Server started on port: ' + port);
});
