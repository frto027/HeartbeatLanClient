const ReactDOM = require('react-dom/client')

/* ==== any code before this line will be removed, don't edit this line. ==== */

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);

let selected_dev = undefined
let L = LANG_RES['en_US']

function getDeltaTime(timems){
    let delta_ms = new Date().getTime() - timems
    let delta_str = "" + (delta_ms / 1000)
    let p = delta_str.indexOf(".")
    if(p >= 0){
        delta_str = delta_str.substring(0,p + 3)
    }
    return delta_str + L.SEC_AGO
}

//////////////////////////////////////////////////////////////////////////

function renderServer(server){
    return (<button key={server.addr + ":" + server.port}
        className="list-group-item list-group-item-action d-flex"
        onClick={()=>operate({op:server.ignore ? "noignore":"ignore", server:server.addr + ":" + server.port})}>
        
        <div className="ms-2 me-auto">
            {server.addr}:{server.port}
            &nbsp;{server.ignore ?
                    <span className="badge text-bg-secondary">{L.SERVER_ITEM_IGNORED}</span>
                    :<span className="badge text-bg-primary">{L.SERVER_ITEM_USED}</span>
                }
            </div>
        {/* <span>{L.SERVER_ITEM_KEEPALIVE_TIME}: {getDeltaTime(server.lastKeepAliveMs)}</span> */}
    </button>)
}

function renderDevice(device){
    return (<div 
        style={{width:"fit-content", display:"inline-block", margin:"4px"}}
        key={device.from + device.mac} className="card">
        <div className="card-header">
            {
            selected_dev == device.mac 
                ? <span className="btn btn-success btn-sm">{L.DEV_SELECTED}</span>
                :<button className="btn btn-outline-secondary btn-sm"
                    onClick={()=>operate({op:"selectBLE", mac:device.mac})}>
                    {L.DEV_ITEM_SELECT}
                </button>
            }&nbsp;{device.name}
        </div>
        <div className="card-body">
            <h5>{device.heartrate} bpm</h5>
            {/* <p>{L.DEV_ITEM_FROM} </p> */}
            {/* <p>{L.DEV_ITEM_MAC} </p> */}
            {L.DEV_ITEM_TIME} {getDeltaTime(device.time)}
        </div>
        <div className="card-footer text-body-secondary">
        {device.mac},{device.from}
        </div>
    </div>)
}

function renderRoot(data){
    selected_dev = data.config.selectedDevMac
    L = LANG_RES[data.config.lang]

    const servers = []
    const devices = []
    for(let server of data.server){
        servers.push(renderServer(server))
    }
    for(let device of data.device){
        devices.push(renderDevice(device))
    }

    if(servers.length == 0){
        servers.push(<div className="alert alert-info" key="noserver" role="alert">{L.NO_SERVER}</div>)
    }
    if(devices.length == 0){
        devices.push(<div className="alert alert-info" key="nodev" role="alert">{L.NO_DEVICE}</div>)
    }
    return <div className="container">
        <h2 style={{marginTop:"32px"}}>{L.SERVER_LIST_TITLE}</h2>
        <div><div className="list-group">{servers}</div></div>
        <h2 style={{marginTop:"32px"}}>{L.DEV_LIST_TITLE}</h2>
        {/* <div>{L.DEV_CUR_SEL} {selected_dev}</div> */}
        <div>{devices}</div>
        
        <h2 style={{marginTop:"32px"}}>{L.CONFIG}</h2>
        <table className="table">
            <thead>
                <tr>
                    <th>{L.CFG_TITLE_ITEM}</th>
                    <th>{L.CFG_TITLE_VALUE}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{L.CUR_LANG}</td>
                    <td>
                        {L.LANG}
                        {data.config.lang == 'en_US' ? undefined : <button className="btn btn-link btn-sm" onClick={()=>operate({op:"setlang",lang:"en_US"})}>English</button>}
                        {data.config.lang == 'zh_CN' ? undefined : <button className="btn btn-link btn-sm" onClick={()=>operate({op:"setlang",lang:"zh_CN"})}>简体中文</button>}
                        </td>
                </tr>
                <tr>
                    <td>{L.CUR_CFG_FOLDER}</td>
                    <td><pre>{data.configFolder}</pre></td>
                </tr>
                <tr>
                    <td>{L.PAIRING}</td>
                    <td>
                        {data.pairing ? L.PAIRING_YES : L.PAIRING_NO }
                        {
                        data.pairing ?
                            <button className="btn btn-link btn-sm" onClick={()=>operate({op:"stoppair"})}>{L.PAIRING_DISABLE_BTN}</button>:
                            <button className="btn btn-link btn-sm" onClick={()=>operate({op:"startpair"})}>{L.PAIRING_ENABLE_BTN}</button>
                        }
                    </td>
                </tr>
            </tbody>
        </table>


        <button className='btn btn-danger btn-sm' onClick={()=>{operate({op:'close'});alert(L.CLOSE_HINT)}}>{L.CLOSE_SERVER}</button>
        &nbsp;&nbsp;
        <a href={'hrcounter.html?' + data.config.lang} target="_blank">BeatSaber</a>
        <hr />
        <p>{L.PROTOCOL_VER_PRE}{window.init_cfg.protocol_ver}{L.PROTOCOL_VER_POST}</p>
        <a href='https://github.com/frto027/HeartbeatLanClient/blob/master/LICENSE' target="_blank">{L.LICENSE}</a> MIT LICENSE <a href='https://github.com/frto027/HeartbeatLanClient'>@frto027</a> 2023
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