const PORT = 8842

const dgram = require('node:dgram');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const hrcounter = require("./hrcounter");

let server

const PROTOCOL_VER = "001"

const CONFIG_FOLDER = path.join(process.env.APPDATA, "HeartbeatLanClient")
const CONFIG_JSON_PATH = path.join(CONFIG_FOLDER, "config.json")

const SERVER_MSG = "HeartBeatSenderHere" + PROTOCOL_VER
const CLIENT_MSG = "HeartBeatRecHere" + PROTOCOL_VER

const VALID_LANG = ['zh_CN', 'en_US']

let config

if(fs.existsSync(CONFIG_JSON_PATH)){
    config = JSON.parse(fs.readFileSync(CONFIG_JSON_PATH).toString("utf-8"))
}else{
    config = {}
}

if(config.lang == undefined){
    config.lang = "en_US"
    if(process.env.LANG && process.env.LANG.indexOf("zh-CN") >= 0)
        config.lang = "zh-CN"
}

saveConfig()

function saveConfig(){
    if(!fs.existsSync(CONFIG_FOLDER))
        fs.mkdirSync(CONFIG_FOLDER)
    fs.writeFileSync(CONFIG_JSON_PATH, Buffer.from(JSON.stringify(config),"utf-8"))
}

let pairing = false
const servers = new Map()
const devices = new Map() 

function startUDPServer(){
    pairing = true
    server = dgram.createSocket('udp4');
    server.on('error', (err) => {
        console.error(`server error:\n${err.stack}`);
        server.close();
    });
    
    server.on('message', (msg, rinfo) => {
        if(msg.subarray(0,SERVER_MSG.length).toString() == SERVER_MSG){
            let addrs = rinfo.address + ":" + rinfo.port
            if(servers.has(addrs)){
                // do nothing
            }else{
                servers.set(addrs, {
                    addr: rinfo.address,
                    port: rinfo.port,
                    ignore: false,
                    socket: undefined,
                    lastKeepAliveMs: 0,
                    lastResponseTime: new Date().getTime()
                })
                stopUDPServer()
            }
        }
    });
    
    server.on('listening', () => {
        // const address = server.address();
        // console.log(`server listening ${address.address}:${address.port}`);
    });
    server.bind(9965)
}

function stopUDPServer(){
    server.close()
    server = undefined
    pairing = false
}

function onDeviceMessage(addrstr, devName, bleMacAddr, heartrate){
    if(servers.has(addrstr)){
        let s = servers.get(addrstr)
        if(s.ignore)
            return
        s.lastResponseTime = new Date().getTime()
    }
    
    if(!devices.has(bleMacAddr)){
        devices.set(bleMacAddr, {
            from: addrstr,
            name: devName,
            mac: bleMacAddr, 
            heartrate: heartrate,
            time: new Date().getTime()
        })
    }else{
        let d = devices.get(bleMacAddr)
        d.from = addrstr
        d.name = devName
        d.mac = bleMacAddr
        d.heartrate = heartrate
        d.time = new Date().getTime()
    }
    // console.log(devices.get(bleMacAddr))
}

function sendKeepAlives(){
    for(let addrstr of servers.keys()){
        let server = servers.get(addrstr)
        if(server.ignore)
            continue
        if(new Date().getTime() - server.lastKeepAliveMs >= 20 * 1000){
            if(server.socket == undefined){
                server.socket = dgram.createSocket("udp4")
                server.socket.on('message', (msg, rinfo)=>{
                    let name_end = msg.indexOf(0)
                    if(name_end == -1) return
                    let mac_end = msg.indexOf(0, name_end + 1)
                    if(mac_end == -1) return
                    if(msg.length < mac_end + 1 + 4) return
                    let name = msg.toString("utf8",0, name_end)
                    let mac = msg.toString("utf8",name_end + 1, mac_end)
                    let heart = msg.readInt32BE(mac_end+1)
                    onDeviceMessage(addrstr, name, mac, heart)
                })
                server.socket.bind(0)
            }
            server.lastKeepAliveMs = new Date().getTime()
            server.socket.send(CLIENT_MSG, 0, CLIENT_MSG.length, server.port, server.addr)
        }
    }
}

startUDPServer()

let keepLiveSender = setInterval(sendKeepAlives, 1000)

function reportStatus(){
    return JSON.stringify({
        server: Array.from(servers.values()),
        device: Array.from(devices.values()),
        config: config,
        configFolder: CONFIG_FOLDER,
        pairing: pairing,
    })
}
function indexDynamicJs(){
    return "window.init_cfg = " + JSON.stringify({
        hrcounter:hrcounter.RES,
        protocol_ver:PROTOCOL_VER
    })
}

function downloadHrcounterZip(req,res){
    if(!req.url.startsWith("/LAN-")){
        return false
    }
    let name = req.url.substring('/LAN-'.length)
    let zip_path = path.join(__dirname, "HRCounterAssets", name)
    if(!fs.existsSync(zip_path)){
        return false
    }
    hrcounter.inject_zip(zip_path, PORT, (buffer)=>{
        res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="LAN-' + name +'"'
        })
        res.end(buffer)
    }, ()=>{
        res.writeHead(404)
        res.end("not found")
    })
    return true
}

function reportHeart(){
    let dev = {heartrate:undefined}
    let time = 0
    for(let d of devices.values()){
        if(config.selectedDevMac && d.mac != config.selectedDevMac)
            continue
        if(time < d.time){
            time = d.time
            dev = d
        }
    }
    return JSON.stringify({bpm:dev.heartrate, dev:dev})
}

function removeIgnoredDevice(){
    for(let d of devices.keys()){
        let server = devices.get(d).from
        if(servers.get(server).ignore){
            devices.delete(d)
        }
    }
}

function handleOperate(msg){
    if(msg.op == "selectBLE" && typeof(msg.mac) == "string"){
        config.selectedDevMac = msg.mac
        saveConfig()
        return {result:"success"}
    }
    if(msg.op == "ignore" && typeof(msg.server) == "string"){
        let s = servers.get(msg.server)
        if(s){
            s.ignore = true
            removeIgnoredDevice()
            return {result:"success"}
        }
        return {result:"error"}
    }
    if(msg.op == "noignore" && typeof(msg.server) == "string"){
        let s = servers.get(msg.server)
        if(s){
            s.ignore = false
            return {result:"success"}
        }
        return {result:"error"}
    }
    if(msg.op == "setlang" && typeof(msg.lang) == "string" && VALID_LANG.indexOf(msg.lang) >= 0){
        config.lang = msg.lang
        return {result:"success"}
    }
    if(msg.op == "startpair"){
        if(!pairing)
            startUDPServer()
    }
    if(msg.op == "stoppair"){
        if(pairing)
            stopUDPServer()
    }
    if(msg.op == "close"){
        process.exit(0)
    }
    return {result: "error"}
}

const URL_HANDLERS = {
    __proto__: null,
    '/heart':(req,res)=>{
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(reportHeart())
        return true
    },
    '/status':(req,res)=>{
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(reportStatus())
        return true
    },
    '/index.dynamic.js':(req,res)=>{
        res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'})
        res.end(Buffer.from(indexDynamicJs(), "utf-8"))
        return true
    },
    '/op':(req,res)=>{
        let r = handleOperate(JSON.parse(decodeURIComponent(req.url.substring("/op?".length))))
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(JSON.stringify(r))
        return true
    }
}
//add static resources
fs.readdirSync(path.join(__dirname,'assets')).forEach((file)=>{
    let local_file = path.join(__dirname,'assets',file)
    if(file.endsWith('.js')){
        URL_HANDLERS['/' + file] = function(req, res){
            res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'})
            res.end(fs.readFileSync(local_file))
            return true
        }
    }
    if(file.endsWith('.html')){
        URL_HANDLERS['/' + file] = function(req, res){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
            res.end(fs.readFileSync(local_file))
            return true
        }
    }
    if(file.endsWith('.css')){
        URL_HANDLERS['/' + file] = function(req, res){
            res.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'})
            res.end(fs.readFileSync(local_file))
            return true
        }
    }
    if(file.endsWith('.jsx')){
        URL_HANDLERS['/' + file.substring(0,file.length-1)] = function(req,res){
            let code = fs.readFileSync(local_file).toString("utf-8")
            let remove_idx = code.indexOf("/* ==== any code before this line will be removed, don't edit this line. ==== */")
            if(remove_idx != -1){
                code = code.substring(remove_idx)
            }
            let txt = require("@babel/core").transformSync(code, {
                presets: [require("@babel/preset-react")],
            }).code;
            res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'})
            res.end(Buffer.from(txt, "utf-8"))
            return true
        }
    }
})

hrcounter.RES.forEach((v)=>{
    URL_HANDLERS['/LAN-' + v] = downloadHrcounterZip
})

URL_HANDLERS['/'] = URL_HANDLERS['/index.html']
URL_HANDLERS['/react.js'] = URL_HANDLERS['/react.development.js']
URL_HANDLERS['/react-dom.js'] = URL_HANDLERS['/react-dom.development.js']

const ui_server = http.createServer((req,res)=>{
    let url = req.url
    if(!url){
        res.writeHead(404)
        res.end("not found")
        return
    }
    url = url.split('?')[0]

    let handler = URL_HANDLERS[url]

    if(!handler){
        res.writeHead(404)
        res.end("not found")
        return
    }

    if(typeof(handler) == "function" && handler(req,res)){
        return
    }else{
        res.writeHead(404)
        res.end("not found")
        return
    }
})

ui_server.on('listening',()=>{
    console.log('Please open http://127.0.0.1:' + ui_server.address().port)
})

ui_server.listen(PORT, '127.0.0.1')

console.log("server bootstrap over")