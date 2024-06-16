# Deleted Project

Depratched due to a better design with OSC Protocol.

[The Quest mod](https://github.com/frto027/HeartBeatLanClientBSQuest) has supported native BLE devices, and can also receive data by OSC Protocol.

The PC Mod [HRCounter](https://github.com/qe201020335/HRCounter) will officialy support receive data by OSC Protocol.

[The apk](https://github.com/frto027/HeartbeatLanServer) has supported send data by OSC Protocol.

This project is no longer needed.

# 已移除的项目

由于OSC协议提供了更好的方案，此项目已被过时。

[Quest模组](https://github.com/frto027/HeartBeatLanClientBSQuest) 已经支持直接访问蓝牙设备，且可以通过OSC协议接收心率数据。

PC模组[HRCounter](https://github.com/qe201020335/HRCounter)即将官方支持从OSC协议接收心率数据。

[安卓APK](https://github.com/frto027/HeartbeatLanServer)已经支持通过OSC协议发送心率数据。

这个工程不再需要。

# Readme.md(folded)

<details>
    
# HeartbeatLanReceiver

[中文](README.cn.md)

Receive heartrate via UDP LAN, and do more things.

# Fast setup for BeatSaber(PCVR)

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
6. Install HRCounter mod for your beatsaber game, and use the config file. A pre configured mod is included in the software.
7. play the game.

The config file:
```json
{"DataSource":"WebRequest","FeedLink":"http://127.0.0.1:8842/heart"}
```

everything works fine. It will work fine. I trust it!

# Fast setup for BeatSaber(Quest)

[Please use this mod](https://github.com/frto027/HeartBeatLanClientBSQuest)!

# What it does

```mermaid
graph TD;
    POLAR_H10[Polar H10]
    SMART_WATCH[Shart watch, broadcast heartrate]
    BLE_DEV[other BLE heartrate devs]
    PHONE[sender, phone, android apk]
    BEATSABER[receiver, beatsaber quest mod]
    PCAPP[receiver,a webpage server <b>YOU ARE HERE</b>]
    BEATSABER_PC[Beatsaber PC game with HRCounter mod]
    BROWSER[browser to view config and datas]

    POLAR_H10--bluetooth-->PHONE;
    SMART_WATCH--bluetooth-->PHONE;
    BLE_DEV--bluetooth-->PHONE;
    PHONE--LAN-->BEATSABER;
    PHONE--LAN-->PCAPP;
    PHONE--LAN-->...;

    PCAPP--127.0.0.1:xxxx-->BROWSER;
    PCAPP--HRCounter protocol-->BEATSABER_PC;
    PCAPP--a web ui TODO-->OBS

```
- [Android phone](https://github.com/frto027/HeartbeatLanServer/releases/latest) apk download here
- [HRCounter](https://github.com/qe201020335/HRCounter) A fast config generator is included in this software.

The broadcast only used for server-pair. It is all private UDP connection if you turn off it after paried.

TODO List:

- ~~make port number configurable~~ make a [issue](https://github.com/frto027/HeartbeatLanClient/issues) if anybody need this feature
- a beautiful heart ui for OBS
- maybe support other games
</details>

# License

MIT License
