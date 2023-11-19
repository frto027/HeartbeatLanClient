const PORT = 8842

const dgram = require('node:dgram');
const http = require('node:http');
const fs = require('node:fs')
let server

const SERVER_MSG = "HeartBeatSenderHere"
const CLIENT_MSG = "HeartBeatRecHere"

const servers = new Map()
const devices = new Map() 

let selectedDevMac = undefined
function startUDPServer(){
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
                    lastKeepAliveMs: 0
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
}

function onDeviceMessage(addrstr, devName, bleMacAddr, heartrate){
    if(servers.has(addrstr) && servers.get(addrstr).ignore)
        return
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
        if(d.from != addrstr)
            console.warn("inconsist server detected.")
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
        selectedDevMac: selectedDevMac
    })
}

function reportHeart(){
    let dev = {heartrate:undefined}
    let time = 0
    for(let d of devices.values()){
        if(selectedDevMac && d.mac != selectedDevMac)
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
        selectedDevMac = msg.mac
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
    return {result: "error"}
}

function handleReactThings(req,res){
    if(req.url == '/index.js'){
        let code = fs.readFileSync(__dirname + "/index.jsx").toString("utf-8")
        let remove_idx = code.indexOf("/* ==== any code before this line will be removed, don't edit this line. ==== */")
        if(remove_idx != -1){
            code = code.substring(remove_idx)
        }
        let txt = require("@babel/core").transformSync(code, {
            presets: ["@babel/preset-react"],
        }).code;
        res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'})
        res.end(Buffer.from(txt, "utf-8"))
        return true
    }else if(req.url == '/react.js'){
        res.writeHead(200, {'Content-Type': 'application/javascript'})
        res.end(fs.readFileSync(__dirname + "/react.development.js"))
        return true
    }else if(req.url == '/react-dom.js'){
        res.writeHead(200, {'Content-Type': 'application/javascript'})
        res.end(fs.readFileSync(__dirname + "/react-dom.development.js"))
        return true
    }
    return false
}

const ui_server = http.createServer((req,res)=>{
    if(req.url == '/'){
        res.writeHead(200, {'Content-Type': 'text/html'})
        res.end(fs.readFileSync(__dirname + "/index.html"))
    }else if(req.url == '/heart'){
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(reportHeart())
    }else if(req.url == '/status'){
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(reportStatus())
    }else if(handleReactThings(req,res)){
        
    }else if(req.url.startsWith("/op?")){
        let r = handleOperate(JSON.parse(decodeURIComponent(req.url.substring("/op?".length))))
        res.writeHead(200, {'Content-Type': 'text/json'})
        res.end(JSON.stringify(r))
    }else{
        res.writeHead(404)
        res.end("not found")
    }
})

ui_server.on('listening',()=>{
    console.log('Please open http://127.0.0.1:' + ui_server.address().port)
})

ui_server.listen(PORT, '127.0.0.1')

console.log("server bootstrap over")