const fs = require("fs")

console.log(require("./hrcounter").RES)

require("./hrcounter").inject_zip('HRCounterAssets/HRCounter-2.1.3-bs1.25.1-f915d79.zip', 8000, (buffer)=>{
    fs.writeFileSync("build/test.zip", buffer)
}, ()=>{
    console.log("failed")
})