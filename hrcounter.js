const fs = require("fs")
const JSZip = require("jszip")
const path = require("path")

const RES_DIR = 'HRCounterAssets'

function inject_zip(zip_path, port, onfullfilled, onrejected){
    let data = fs.readFileSync(zip_path)
    JSZip().loadAsync(data).then((v)=>{
        v
        .folder('UserData')
        .file('HRCounter.json', Buffer.from('{"DataSource":"WebRequest","FeedLink":"http://127.0.0.1:' + port + '/heart"}',"utf-8"))
        v.generateAsync({
            type:"nodebuffer"
        }).then(onfullfilled, onrejected)

    }, onrejected)
}

const RES = fs.readdirSync(path.join(__dirname, RES_DIR))

module.exports = {
    inject_zip,
    RES
}