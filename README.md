# HeartbeatLanClient

Receive heartrate via UDP LAN, and do more things.

TODO List:

- release this app
- stop pair process, and manually enable it.
- make port number configurable
- a beautiful heart ui for OBS
- maybe support other games

# Fast setup for BeatSaber(PCVR)

> Do NOT do it. Playable but not done yet.....

TLDR all steps are...

1. Open the heartrate BLE device
2. Open Android APP
3. Open the Desktop APP
4. Open the game

Do the following thing for the first setup.

1. Pair your BLE Heartrate devices with your Andorid phone.
2. Ensure the android device and your computer connect to same network.
3. Install and open the Android app, select the heart devices you want broadcast.
4. In your computer, install and open this app.
5. (Optional)Open [the web browser](http://127.0.0.1:8842) to see all datas form BLE devices.
6. Install HRCounter mod for your beatsaber game, and use the config file.
7. play the game.

The config file:
```json
{"DataSource":"WebRequest","FeedLink":"http://127.0.0.1:8842/heart"}
```

everything works fine. It will work fine. I trust it!

# Fast setup for BeatSaber(Quest)

Not supported yet.

# What it does

```
                                                 ┌──────┐
┌─────────┐   Bluetooth(BLE)                     │......│
│POLAR H10├────────────────┐                     └───▲──┘
└─────────┘                │                         │
                           │                         │
┌───────────┐              │   ┌─────────────┐       │
│Smart watch├──────────────┼──►│Android Phone├───────┤UDP Package
└───────────┘              │   └─────────────┘       │via WLAN
                           │                         │
┌────────────────────────┐ │                         │
│BLR Heartrate Devices...├─┘         YOU ARE HERE    │
└────────────────────────┘                    │      │
                                         ┌────▼──────▼──┐       beautiful web ui?
                    ┌────────────────────┤webpage client├────────────────┐
                    │http://127.0.0.1:xxx└────┬─────────┘                │
                    │                         │HRCounter's api           │
              ┌─────▼────────┐    ┌───────────▼───────────┐    ┌─────────▼────────┐
              │Web browser   │    │BeatSaber HRCounter mod│    │Beautiful UI to   │
              │to view deails│    └───────────────────────┘    │display inside OBS│
              └──────────────┘                                 │(TODO)            │
                                                               └──────────────────┘

```

- TODO [Android phone](#) apk download here
- TODO [HRCounter](https://github.com/qe201020335/HRCounter) I will provide the mod config for fast setup later.

The broadcast only used for server-pair. It is all private UDP connection if you turn off it after paried.

# License

MIT License