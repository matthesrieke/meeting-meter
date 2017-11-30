import { BadgeMapper } from './badge-mapper';
import * as badgeReader from './badge-reader';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as uuid from 'uuid';
import * as CircularJSON from 'circular-json';
import { Badge } from './model/badge';
import { Meeting } from './meeting';

const BASE_URL = '';
const app = express();
// parse application/json
app.use(bodyParser.json());

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

const mapper = new BadgeMapper('/var/data/badge-mapping.json');
let meeting: Meeting;
const unmappedBadges = {};
const unrelatedBadges = {};

let connections = {};

wss.on('connection', (ws: WebSocket) => {
    ws.id = uuid.v4();
    connections[ws.id] = ws;

    ws.on('close', id => {
        delete connections[ws.id];
    });

});

const sendPayload = (payload: any): void => {
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

const handleBadgeRead = (deviceId: string): void  => {
    const badge = new Badge();
    badge.id = deviceId;
    badge.lastScan = new Date();

    console.log('Scanned badge: ' + JSON.stringify(badge));

    if (mapper.enrichBadge(badge)) {
        // add to meeting, if one is started
        if (meeting) {
            meeting.addBadge(badge);

            // remove from previous unrelated list
            if (unrelatedBadges[badge.id]) {
                delete unrelatedBadges[badge.id];
            }
        }
        else {
            // no meeting, save it for later
            unrelatedBadges[badge.id] = badge;
        }
    }
    else {
        // not found in mappings
        unmappedBadges[badge.id] = badge;
    }

    const payload = JSON.stringify(badge);
    sendPayload(payload);
};

/**
 * start listening to the badge reader device
 */
badgeReader.readBadges(handleBadgeRead);
// require('./dummy-badge-reader').readBadges(handleBadgeRead);

const createBadgeView = (b: Badge): any => {
    const tmp: Badge = JSON.parse(JSON.stringify(b));
    delete tmp.hourlyRate;
    return tmp;
};

const createMeetingView = (): any => {
    const result: any = {
        badges: meeting.getMeetingBadges().map(b => createBadgeView(b)),
        start: meeting.getStartDate().toISOString(),
        totalCosts: meeting.calculateTotalCosts()
    };

    if (meeting.getEndDate()) {
        result.endDate = meeting.getEndDate()
    }

    return result;
};

app.get(BASE_URL + '/unmappedBadges', (req, res) => {
    res.json(Object.keys(unmappedBadges).map(bid => createBadgeView(unmappedBadges[bid])));
});

app.get(BASE_URL + '/unrelatedBadges', (req, res) => {
    res.json(Object.keys(unrelatedBadges).map(bid => createBadgeView(unrelatedBadges[bid])));
});

app.get(BASE_URL + '/categories', (req, res) => {
    res.json(mapper.getCategories());
});

app.post(BASE_URL + '/relatedBadge', (req, res) => {
    if (!req.body || !req.body['badge']) {
        res.status(400);
        return res.send({
            error: 'no badge provided'
        });
    }

    const badgeId = req.body['badge'];

    if (!unrelatedBadges[badgeId]) {
        res.status(400);
        return res.send({
            error: 'badge id currently not unrelated'
        });
    }

    if (!meeting || !meeting.getStartDate() || meeting.getEndDate()) {
        res.status(400);
        return res.send({
            error: 'no ongoing meeting'
        });
    }

    const b = unrelatedBadges[badgeId];
    meeting.addBadge(b);
    delete unrelatedBadges[badgeId];

    res.status(204);
    res.send();
});

app.post(BASE_URL + '/mapBadge', (req, res) => {
    if (!req.body || !req.body['badge'] || !req.body['category']) {
        res.status(400);
        return res.send({
            error: 'no badge or category provided'
        });
    }

    const badgeId = req.body['badge'];
    const category = req.body['category'];

    if (!unmappedBadges[badgeId]) {
        res.status(400);
        return res.send({
            error: 'badge id unkown'
        });
    }

    const b = unmappedBadges[badgeId];
    mapper.mapBadge(b, category);

    delete unmappedBadges[badgeId];
    unrelatedBadges[badgeId] = b;
    mapper.persist().then(() => {
        console.log('Mapping updated and stored');
    });

    res.status(204);
    res.send();
});

app.post(BASE_URL + '/startMeeting', (req, res) => {
    meeting = new Meeting();
    meeting.startMeeting();
    res.status(204);
    res.send();
});

app.post(BASE_URL + '/endMeeting', (req, res) => {
    if (meeting) {
        meeting.endMeeting();
    }
    res.status(204);
    res.send();
});

app.get(BASE_URL + '/currentMeeting', (req, res) => {
    if (meeting) {
        const result = createMeetingView();

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
