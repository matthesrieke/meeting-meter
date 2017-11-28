# Build

`gulp build`

## Requirements

`npm install -g gulp`

# Dev Server

`gulp serve`

# systemd Unit file example

Running as root for testing. The user requires read access to `/dev/input/<thedevice>`

```
[Unit]
Description=meeting-meter
Documentation=https://github.com/matthesrieke/meeting-meter
After=network.target

[Service]
Environment=NODE_PORT=8999
Type=simple
User=root
ExecStart=/usr/bin/node /home/pi/meeting-meter/dist/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target

```

Save to e.g. `/lib/systemd/system/meeting_meter.service`

Install with:

```
sudo systemctl daemon-reload
sudo systemctl enable meeting_meter.service
sudo systemctl start meeting_meter.service
```

# Categories

## SH

14€

## WM

35€

## GL

60€

