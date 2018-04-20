var http = require('https');
var fs = require('fs');

var request = http.get("https://usb-ids.gowdy.us/usb.ids", function(res) {
    if (res.statusCode !== 200) {
        console.error("Failed to download updated usb.ids file");
        res.resume();
        return;
    }

    let usbIdsFile="";

    res.on("data", (chunk) => { usbIdsFile += chunk });

    res.on("end", (_) => {
        console.log(usbIdsFile.length)
        let USBIDS={};
        let current;
        let Reg = /^(\t?)(\w{4}) {2}(.*)$/;
        usbIdsFile.split("\n").map((line) => {
            let match;
            if (line[0] === "#") {
                return;
            }
            else if ((match = Reg.exec(line)) !== null) {
                if(match[1]==="") {
                    current = USBIDS[match[2]]={"name":match[3]};
                }
                else {
                    current[match[2]]={"name":match[3]};
                }
            }
        });
        fs.writeFile("usb.ids.json", JSON.stringify(USBIDS,null,2), 'utf8', console.log);
    });
});
