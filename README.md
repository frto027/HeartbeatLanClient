# HeartbeatLanClient

Receive heartrate via UDP LAN, and do more things.

支持中文。从局域网的中获取心率信息，然后做些什么。。。

TODO List:

- ~~make port number configurable~~ make a [issue](https://github.com/frto027/HeartbeatLanClient/issues) if anybody need this feature
- a beautiful heart ui for OBS
- maybe support other games

# 节奏光剑（PCVR）配置说明

> 欢迎使用由Frto027制作的纯局域网心率显示方案！软件实时转发心率数据，不引入额外延迟。

1. 打开蓝牙心率设备，与安卓手机配对。
2. 安卓手机安装[APK](https://github.com/frto027/HeartbeatLanServer/releases/latest)并打开([一键下载](https://github.com/frto027/HeartbeatLanServer/releases/download/v1.1/heartbeatlan-1.1.apk))，勾选想要使用的蓝牙设备，和PC连入同一个局域网内。请确保局域网内支持UDP广播。
3. [下载](https://github.com/frto027/HeartbeatLanClient)（[一键下载](https://github.com/frto027/HeartbeatLanClient/releases/download/v1.0/heartbeat-lan-client-1.0.zip)）并打开这个软件，进入[这里](http://127.0.0.1:8842)观察软件设置。该页面提供配置好的[HRCounter模组](https://github.com/qe201020335/HRCounter)，请下载后手动覆盖至节奏光剑的安装文件夹中。
4. 打开游戏即可游玩。

别忘了设置手机APP的省电策略为无限制（或类似选项）。不必担心后台驻留，点击“关闭程序”按钮后，程序会进行完全的自我抹除。

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

Release soon!

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

- [Android phone](https://github.com/frto027/HeartbeatLanServer/releases/latest) apk download here
- [HRCounter](https://github.com/qe201020335/HRCounter) A fast config generator is included in this software.

The broadcast only used for server-pair. It is all private UDP connection if you turn off it after paried.

# License

MIT License