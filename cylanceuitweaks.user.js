// ==UserScript==
// @name         Cylance Web UI Tweaks
// @namespace    http://javex.tech/
// @version      0.2.4
// @description  Collection of tweaks for the Cylance Web UI
// @author       Shaun Hammill <shaun.hammill@mpiresearch.com>
// @match        https://protect.cylance.com/Device/DisplayDeviceDetails
// @match        https://protect.cylance.com/Threats
// @updateURL    https://github.com/Plloi/Pllois.Cylance.Tweaks/raw/master/cylanceuitweaks.user.js
// @grant        GM_getResourceText
// @resource     USBIDS  usb.ids.json
// @run-at       document-idle

// ==/UserScript==
(function() {
    "use strict";

    //Update Virus total links to point to current site
    function updateVTLinks() {
        $("a").filter((a,b) => b.href = b.href.replace("www.virustotal.com/en/","www.virustotal.com/gui/").replace("/analysis/", "/details"));
    }

    $("#grid_DeviceThreat_Active,#grid_DeviceThreat_Removed,#ActiveThreats_Grid").each(function(){
        $(this)
            .data("kendoGrid")
            .bind("dataBound",updateVTLinks)
        ;
    });

    let USBIDS = JSON.parse(GM_getResourceText("USBIDS"));

    //Alter Grid Data
    let grid = $("#grid_ExternalDevices,#ExternalDevices_Grid").data("kendoGrid");

    grid.bind("dataBound", (_) => {
        function setNewInnerHTML(that, devId, devString){
            ($(that).find("td:contains('"+devId+"')")).text(`${devString} - ${devId}`);
        }

        grid.tbody.find("tr").each(function(e){
            let model = grid.dataItem(this);
            // If we have Manufacturer identifier in lookup add data to table
            if (USBIDS.hasOwnProperty(model.ExternalDeviceVendorId.toLowerCase())) {
                setNewInnerHTML(this, model.ExternalDeviceVendorId, USBIDS[model.ExternalDeviceVendorId.toLowerCase()].name);
                // If we have device identifier in lookup add data to table
                if (USBIDS[model.ExternalDeviceVendorId.toLowerCase()].hasOwnProperty(model.ExternalDeviceId.toLowerCase())) {
                    setNewInnerHTML(this, model.ExternalDeviceId, USBIDS[model.ExternalDeviceVendorId.toLowerCase()][model.ExternalDeviceId.toLowerCase()].name);
                }
            }
            /* TODO:
            * Handle DeviceName
              * Make PC name filter by pc
              * Add link to open device in new window.
              * Add Logic to handle filter Stacking
              * Vendor and Product ID's should play happily in the filters list with each other
              * Determine Logic for other fields.
            */

            ["ExternalDeviceId","ExternalDeviceVendorId", "ExternalDeviceSerialNumber"].map((column) => {
                $(this).find("td:contains('"+model[column]+"')")
                    .click((_) => grid.dataSource.filter([{
                        operator: "equals",
                        value: model[column],
                        field: column
                    }]))
                    .css({cursor:"pointer",color:"rgb(8, 101, 152)"})
                    // TODO: Fix hover selection bug
                    // .hover(
                    //     _=>$(this).css({"text-decoration-line":"underline"}),
                    //     _=>$(this).css({"text-decoration-line":"none"}),
                    // )
                ;
            });
        });
    });
}());
