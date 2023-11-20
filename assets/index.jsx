const ReactDOM = require('react-dom/client')

/* ==== any code before this line will be removed, don't edit this line. ==== */

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);

let selected_dev = undefined

function getDeltaTime(timems){
    let delta_ms = new Date().getTime() - timems
    let delta_str = "" + (delta_ms / 1000)
    let p = delta_str.indexOf(".")
    if(p >= 0){
        delta_str = delta_str.substring(0,p + 3)
    }
    return delta_str + " sec ago"
}

function renderServer(server){
    return (<div key={server.addr + ":" + server.port} style={{
        border:"1px solid black", width:"fit-content", padding:"8px",margin:"8px", display:"inline-block"
        }}>
        <div>addr: {server.addr}</div>
        <div>port: {server.port}</div>
        {server.ignore ? <div>"ignored"</div> : undefined}
        <div>keep_alive_time: {getDeltaTime(server.lastKeepAliveMs)}</div>
        {
            server.ignore ?
            <button onClick={()=>operate({op:"noignore", server:server.addr + ":" + server.port})}>dont ignore</button>:
            <button onClick={()=>operate({op:"ignore", server:server.addr + ":" + server.port})}>ignore</button>
        }
    </div>)
}

function renderDevice(device){
    return (<div key={device.from + device.mac}  style={{
        border:"1px solid " + (selected_dev == device.mac ? "green" : "black"), width:"fit-content", padding:"8px", margin:"8px", display:"inline-block"
        }}>
        <div>name: {device.name}</div>
        <div>heartrate: {device.heartrate}</div>
        <div>time: {getDeltaTime(device.time)}</div>
        <div>from: {device.from}</div>
        <div>mac: {device.mac}</div>
        <button onClick={()=>operate({op:"selectBLE", mac:device.mac})}>select</button>
    </div>)
}

function renderRoot(data){
    selected_dev = data.selectedDevMac

    const servers = []
    const devices = []
    for(let server of data.server){
        servers.push(renderServer(server))
    }
    for(let device of data.device){
        devices.push(renderDevice(device))
    }

    return <div>
        <h3>servers(your phone)</h3>
        <div>{servers}</div>
        <h3>devices(your heartbeat devices)</h3>
        <div>{devices}</div>
        <div>current selected device: {selected_dev}</div>
        <h3>HRRate link for beatsaber</h3>
        <pre>{'{"DataSource":"WebRequest","FeedLink":"' + window.location.href +  'heart"}'}</pre>
    </div>
}

function renderData(data){
    root.render(renderRoot(data))
}

function downloadData(){
    let x = new XMLHttpRequest()
    x.open("get","/status")
    x.onload = function(ev){
        renderData(JSON.parse(x.response))
        setTimeout(downloadData, 100)
    }
    x.onerror = function(ev){
        setTimeout(downloadData, 2000)
    }
    x.send()
}

function operate(msg){
    msg._time = new Date().getTime()
    let x = new XMLHttpRequest()
    x.open("get","/op?" + encodeURIComponent(JSON.stringify(msg)))
    x.send()
}

downloadData()