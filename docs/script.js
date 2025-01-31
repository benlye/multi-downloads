var preReleaseWarningShown = false;
var avrWarningShown = false;
var ppmWarningShown = false;

function bodyLoad() {
    var url = window.location.toString();
    var parts = url.split("?")
    if (parts.length > 1) {
        var module = parts[1].split("&")[0];
        $('#multiModuleSelect').val(module).trigger('change');
    }
}

function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    moduleType = document.getElementById("moduleType").value;
    channelOrder = document.getElementById("channelOrder").value.toUpperCase();
    firmwareVersion = document.getElementById("firmwareVersion").value.toUpperCase();

    selectedRelease = releases.find(obj => {
        return obj.id === firmwareVersion
    });

    var releaseDate = new Date(selectedRelease.created_at);
    releaseInfo = `<table width=250px><tr><td><b>Version:</b></td><td>${firmwareVersion}</td></tr><tr><td><b>Release Date:</b></td><td>${selectedRelease.created_at}</td></tr><tr><td><b>Downloads:</b></td><td>${selectedRelease.download_count}</td></tr><tr><td><b>Release Notes:</b></td><td><a href=https://github.com/pascallanger/DIY-Multiprotocol-TX-Module/releases/tag/${selectedRelease.tag_name} target=_new>Link</a></td></tr></table>`
    $("#release_info").attr('data-content', releaseInfo);

    var useNewFilters = true;
    var useTypeFilter = true;

    if (releaseDate < (new Date(2020, 9, 10))) {
        document.getElementById('oldRadioTypeSelection').style = "";
        document.getElementById('newRadioTypeSelection').style = "display:none;";
        document.getElementById('telemetrySelection').style = "";
        useNewFilters = false;
    } else {
        document.getElementById('oldRadioTypeSelection').style = "display:none;";
        document.getElementById('newRadioTypeSelection').style = "display:none;";
        document.getElementById('telemetrySelection').style = "display:none;";
        useNewFilters = true;
    }

    if (useNewFilters) {
        radioType = document.getElementById("radioTypeNew").value.toUpperCase();
        telemetryInversion = "";

        if (radioType == "" || radioType == "-SERIAL-") {
            includeMultiTxt = true;
            includeLuaZip = true;
        } else {
            includeMultiTxt = false;
            includeLuaZip = false;
        }
    } else {
        radioType = document.getElementById("radioType").value.toUpperCase();
        telemetryInversion = document.getElementById("telemetryInversion").value.toUpperCase();

        if (radioType == "-OPENTX-" || radioType == "-PPM-") {
            includeMultiTxt = false;
        } else {
            includeMultiTxt = true;
        }
    
        if (radioType == "" || radioType == "-OPENTX-") {
            includeLuaZip = true;
        } else {
            includeLuaZip = false;
        }
    }

    if (document.getElementById('includeDebugYes').checked) {
        includeDebug = true;
    } else {
        includeDebug = false;
    }

    var moduleFilterString;

    switch(moduleType) {
        case 'stm32f1-4in1':
            moduleFilterString = 'multi-stm-serial|multi-stm-ppm|multi-stm-erskytx|multi-stm-opentx|multi-stm-xn297|mm-stm-serial|mm-stm-ppm|mm-stm-erskytx|mm-stm-opentx|mm-stm-xn297';
            if (useNewFilters) {
                document.getElementById('newRadioTypeSelection').style = "";
            }
            useTypeFilter = true;
            break;
        case 'stm32f1-5in1':
            moduleFilterString = 'multi-stm-5in1|mm-stm-5in1';
            if (useNewFilters) {
                document.getElementById('newRadioTypeSelection').style = "";
            }
            useTypeFilter = true;
            break;
        case 'stm32f1-cc2500':
            moduleFilterString = 'multi-stm-cc2500-\\D|mm-stm-cc2500-\\D';
            if (useNewFilters) {
                radioType = '';
                includeLuaZip = true;
                includeMultiTxt = false;
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = true;
            break;
        case 'stm32f1-cc2500-64':
            moduleFilterString = 'multi-stm-cc2500-64|mm-stm-cc2500-64';
            if (useNewFilters) {
                radioType = '';
                includeLuaZip = true;
                includeMultiTxt = false;
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = true;
            break;
        case 'atmega-4in1':
            moduleFilterString = 'multi-avr|mm-avr';
            if (useNewFilters) {
                radioType = '';
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = false;
            break;
        case 'orangerx':
            moduleFilterString = 'multi-orangerx|mm-orangerx';
            if (useNewFilters) {
                radioType = '';
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = false;
            break;
        case 't18int':
            moduleFilterString = 'multi-t18int|mm-t18int';
            if (useNewFilters) {
                radioType = '';
                includeLuaZip = true;
                includeMultiTxt = false;
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = true;
            break;
        case 'tlite5in1':
            moduleFilterString = 'multi-tlite5in1|mm-tlite5in1';
            if (useNewFilters) {
                radioType = '';
                includeLuaZip = true;
                includeMultiTxt = false;
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = true;
            break;
        default:
            moduleFilterString = '';
            if (useNewFilters) {
                document.getElementById('newRadioTypeSelection').style = "display:none;";
            }
            useTypeFilter = true;
            break; 
    }

    if (moduleType == 'atmega-4in1') {
        showAvrWarningModal();
    }

    if (radioType == '-PPM-') {
        showPpmWarningModal();
        useTypeFilter = false;
    }
    
    if(useTypeFilter && releaseDate > (new Date(2024, 1, 22))) {
        document.getElementById('firmwareTypeSelection').style = "";
        firmwareType = document.getElementById("firmwareType").value.toUpperCase();

        if (firmwareType == "FCC") {
            firmwareType = "^((?!AIR|SFC|LBT).)*$";
        }
    } else {
        firmwareType = "";
        document.getElementById('firmwareTypeSelection').style = "display:none;";
    }

    table = document.getElementById("fileTable");
    tr = table.getElementsByTagName("tr");
    
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.match(moduleFilterString) && txtValue.toUpperCase().indexOf(radioType) > -1 && txtValue.toUpperCase().match(firmwareType) && txtValue.toUpperCase().indexOf(channelOrder) > -1 && txtValue.toUpperCase().indexOf(telemetryInversion) > -1 && txtValue.match(`${firmwareVersion}\.bin$`)) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }

            // Filter debug builds
            if (txtValue.toLowerCase().indexOf("debug") > -1) {
                if (txtValue.match(moduleFilterString) && txtValue.toLowerCase().indexOf("debug") > -1 && includeDebug == true && txtValue.match(`${firmwareVersion}\.bin$`)) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }

            // Show the Multi.txt file
            if ((txtValue.trim().toLowerCase() == `multi.txt (v${firmwareVersion})` && includeMultiTxt == true)) {
                tr[i].style.display = "";
            } else if (txtValue.toLowerCase().indexOf("multi.txt") > -1) {
                tr[i].style.display = "none";
            }

            // Show the Lua script zip file
            if ((txtValue.trim().toLowerCase() == `multiluascripts.zip (v${firmwareVersion})` && includeLuaZip == true)) {
                tr[i].style.display = "";
            } else if (txtValue.toLowerCase().indexOf("multiluascripts.zip") > -1) {
                tr[i].style.display = "none";
            }
        }
    }

    moduleModel = document.getElementById("multiModuleSelect").value.toLowerCase();
    if (moduleModel != '') {
        document.getElementById("moduleLinkUrlDisplay").innerHTML = "https://downloads.multi-module.org/?" + moduleModel;
        document.getElementById("modulelink").hidden = false;
    } else {
        document.getElementById("moduleLinkUrlDisplay").innerHTML = null;
        document.getElementById("modulelink").hidden = true;
    }

    var x = document.getElementById("firmwareVersion");
    var i;
    for (i = 0; i < x.length; i++) {
        release = x.options[i].value;
    }
}

function togglePreRelease(){
    if (document.getElementById('includePreReleaseYes').checked) {
        includePreRelease = true;
        $("#firmwareVersion").find("option:contains('Pre-release')").removeAttr('disabled');
        if (! this.preReleaseWarningShown) {
            $('#prereleaseModalCenter').modal();
            this.preReleaseWarningShown = true;
        }
    } else {
        includePreRelease = false;
        $("#firmwareVersion").find("option:contains('Pre-release')").attr('disabled', '');
    }

    $('#firmwareVersion').children('option:enabled').eq(0).prop('selected',true);
    $('#firmwareVersion').trigger('change');
}

function showFirmwareFileChangeModal(){
    $('#releaseChangesModalCenter').modal();
}

function showPpmWarningModal(){
    if (! this.ppmWarningShown) {
        $('#ppmWarningModalCenter').modal();
        this.ppmWarningShown = true;
    }
}

function showAvrWarningModal(){
    if (! this.avrWarningShown) {
        $('#avrWarningModalCenter').modal();
        this.avrWarningShown = true;
    }
}

function downloadStarted(filename){
    if (filename.includes("-ppm-")) {
        showPpmWarningModal();
    }

    if (filename.includes("-avr-")) {
        showAvrWarningModal();
    }
}

function moduleSelect() {
    selectedModule = document.getElementById("multiModuleSelect").value.toLowerCase();
    switch (selectedModule) {
        case "bg-avr":
        case "diy-avr":
            $('#moduleType').val('atmega-4in1').trigger('change');
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "bg-stm32":
        case "diy-stm32":
        case "hp4in1":
        case "irangex":
        case "jp4in1":
            $('#moduleType').val('stm32f1-4in1').trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val('-inv-').trigger('change');
            break;
        case "jp-t16ext":
            $('#moduleType').val('stm32f1-4in1').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val('-serial-').trigger('change');
            $('#telemetryInversion').val('-inv-').trigger('change');
            break;
        case "rmmt12":
            $('#firmwareType').val('SFC').trigger('change');
        case "jp-t12ext":
        case "jp-t12pro":
        case "jp-t16int":
        case "jp-tlt4in1":
        case "rm4in1":
        case "rmtx16s":
        case "rmzorro":
        case "rmboxer":
        case "rktx18s":
        case "tbsmpm":
            $('#moduleType').val('stm32f1-4in1').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val('-serial-').trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        case "jp-tlt2500":
        case "rmt8":
        case "rktx18slite":
            $('#moduleType').val('stm32f1-cc2500').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        case "rmt8-64":
        case "rmtx12-64":
        case "rmboxer-cc-64":
        case "rmpocket-cc-64":
        case "rmtx16sse":
        case "rmzorro-cc-64":
        case "jp-tlt2500-64":
            $('#moduleType').val('stm32f1-cc2500-64').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        case "orangerx":
            $('#moduleType').val('orangerx').trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#telemetryInversion').val(null).trigger('change');
            break;
        case "jp-t18int":
            $('#moduleType').val('t18int').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        case "jp-tlt5in1":
            $('#moduleType').val('tlite5in1').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change'); 
            break;
        case "diy-5in1":
            $('#moduleType').val('stm32f1-5in1').trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val(null).trigger('change'); 
            break;
        default:
            $('#moduleType').val(null).trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#radioTypeNew').val(null).trigger('change');
            $('#telemetryInversion').val(null).trigger('change');
            $('#firmwareType').val(null).trigger('change');
            break;
    }
    typeSelect();
    myFunction();
}

function typeSelect() {
    var activeTypeFilters;
    moduleType = document.getElementById("moduleType").value.toLowerCase();
    switch(moduleType) {
        case 'stm32f1-4in1':
        case 'stm32f1-5in1':
        case 't18int':
        case 'tlite5in1':
            activeTypeFilters = ["", "AIR", "SFC", "LBT"];
            break;
        case 'stm32f1-cc2500':
        case 'stm32f1-cc2500-64':
            activeTypeFilters = ["", "LBT", "FCC"];
            break;
        case 'atmega-4in1':
        case 'orangerx':
            activeTypeFilters = [""];
            break;
        default:
            activeTypeFilters = ["", "AIR", "SFC", "LBT", "FCC"];
            break; 
    }

    document.querySelectorAll("#firmwareType option").forEach(opt => {
        if (activeTypeFilters.includes(opt.value)) {
            opt.disabled = false;
        } else {
            opt.disabled = true;
        }
    });

    if (activeTypeFilters.includes($('#firmwareType').val()) == false) {
        $('#firmwareType').val(null).trigger('change');
    }

    myFunction();
}

function formReset() {
    setTimeout(function() {
        myFunction();
        
        $('#multiModuleSelect').val(null).trigger('change');
        $('#moduleType').val(null).trigger('change');
        $('#radioType').val(null).trigger('change');
        $('#radioTypeNew').val(null).trigger('change');
        $('#channelOrder').val(null).trigger('change');
        $('#firmwareType').val(null).trigger('change');
        $('#telemetryInversion').val(null).trigger('change');
        $("#firmwareVersion").prop("selectedIndex", 0).val();
        $('#firmwareVersion').trigger('change');
        togglePreRelease();
    }, 100);
}

function openReleaseNotes() {
    firmwareVersion = document.getElementById("firmwareVersion").value.toLowerCase();
    url = 'https://github.com/pascallanger/DIY-Multiprotocol-TX-Module/releases/tag/' + firmwareVersion;
    window.open(url, '_new');
}

function copyToClipboard(elementId) {

    // Create an auxiliary hidden input
    var aux = document.createElement("input");

    // Get the text from the element passed into the input
    aux.setAttribute("value", document.getElementById(elementId).innerHTML);

    // Append the aux input to the body
    document.body.appendChild(aux);

    // Highlight the content
    aux.select();

    // Execute the copy command
    document.execCommand("copy");

    // Remove the input from the body
    document.body.removeChild(aux);
}

function getAssetInfo(fileName){
    tipClass = null;
    tipHeader = null;
    tipText = null;

    if (fileName.includes("Multi.txt")) {
        tipClass = "fp-info-circle"
        tipHeader = 'Multi.txt';
        tipText = '<p><b>For erSkyTx and er9x radios</b></p><p>Tells the radio what protocols are available in the firmware. Copy the file to the top-level of the SD card.</p>';
    }
    if (fileName.includes("MultiLuaScripts.zip")) {
        tipClass = "fp-info-circle"
        tipHeader = 'MultiLuaScripts.zip';
        tipText = '<p><b>For OpenTX and EdgeTX radios</b></p><p>MULTI-Module LUA scripts. Unzip the file and copy the contents to the SD card.</p>';
    }

    if (tipClass && tipHeader && tipText) {
        return '<i class="' + tipClass + '" tabindex="0" data-trigger="focus" data-container="#fileTable" data-toggle="popover" data-placement="right" title="' + tipHeader + '" data-content="' + tipText + '"></i>';
    } else {
        return;
    }
}

function createAssetTable(data) {
    $.each(data,function(index, item){
        var linkCellHtml = '<a href="' + item.url + '" onclick="downloadStarted(\'' + item.display_name + '\');">' + item.display_name + '</a>';
        if (item.display_name.includes("Multi.txt") || item.display_name.includes("MultiLuaScripts.zip")) {
            var infoHtml = getAssetInfo(item.display_name)
        }

        if (infoHtml) {
            linkCellHtml += '&nbsp;&nbsp;' + infoHtml
        }

        $('<tr>').append(
            $('<td>').html(linkCellHtml),
            $('<td>').text((item.size/1024).toFixed(0) + "KB"),
            $('<td>').text(item.download_count),
            ).appendTo('#fileTable');
    });
}

$(document).ready(function() {
    const footerYear = new Date().getFullYear();
    const footerText = `<b>Powered by GitHub Pages | Copyright &copy; ${footerYear}</b>`;
    footer = document.getElementById("footer-holder");
    footer.innerHTML = footerText;

    var dataUrl = "./data.json";

    $.ajax({
        url: dataUrl,
        dataType: 'json',
        async: false,
        success: function(data) {
            assets = data.assets;
            createAssetTable(assets);
    
            releases = data.releases;
    
            $(".js-example-basic-hide-search-no-clear").select2({
                minimumResultsForSearch: Infinity,
                data: releases
            });
    
            lastUpdated = data.lastUpdate;
            document.getElementById("lastupdate").innerHTML = `<p>Updated every four hours. Last update: ${lastUpdated}</p>`;
            togglePreRelease()
            myFunction();
        }
      });


    $('#moduleType').on('select2:select', function (e) {
        typeSelect();
    });

    $("[data-toggle=popover]").popover({
        html: true,
        content: function() {
            return $('#popover-content').html();
        }
    });

    $(".js-example-basic-single").select2({
        placeholder: "Select a module",
        allowClear: true
    });

    $(".js-example-basic-hide-search").select2({
        placeholder: "Show all",
        allowClear: true,
        minimumResultsForSearch: Infinity
    });
});

$('.popover-dismiss').popover({
    trigger: 'focus'
})
