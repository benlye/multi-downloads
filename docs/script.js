function bodyLoad() {
    myFunction();
    var url = window.location.toString();
    var parts = url.split("?")
    if (parts.length > 1) {
        var module = parts[1].split("&")[0];
        $('#multiModuleSelect').val(module).trigger('change');
    }
    var preReleaseWarningShown = false;
}

function myFunction() {
    var input, filter, table, tr, td, i, txtValue;
    moduleType = document.getElementById("moduleType").value.toUpperCase();
    radioType = document.getElementById("radioType").value.toUpperCase();
    channelOrder = document.getElementById("channelOrder").value.toUpperCase();
    telemetryInversion = document.getElementById("telemetryInversion").value.toUpperCase();
    firmwareVersion = document.getElementById("firmwareVersion").value.toUpperCase();

    if (document.getElementById('includeDebugYes').checked) {
        includeDebug = true;
    } else {
        includeDebug = false;
    }

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

    table = document.getElementById("fileTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(moduleType) > -1 && txtValue.toUpperCase().indexOf(radioType) > -1 && txtValue.toUpperCase().indexOf(channelOrder) > -1 && txtValue.toUpperCase().indexOf(telemetryInversion) > -1 && txtValue.toUpperCase().indexOf(firmwareVersion) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }

            // Filter debug builds
            if ((txtValue.toLowerCase().indexOf("debug") > -1 && includeDebug == false)) {
                tr[i].style.display = "none";
            }

            // Show the Multi.txt file
            if ((txtValue.toLowerCase().indexOf("multi.txt") > -1 && txtValue.toUpperCase().indexOf(firmwareVersion) > -1 && includeMultiTxt == true)) {
                tr[i].style.display = "";
            } else if (txtValue.toLowerCase().indexOf("multi.txt") > -1) {
                tr[i].style.display = "none";
            }

            // Show the Lua script zip file
            if ((txtValue.toLowerCase().indexOf("multiluascripts.zip") > -1 && txtValue.toUpperCase().indexOf(firmwareVersion) > -1 && includeLuaZip == true)) {
                tr[i].style.display = "";
            } else if (txtValue.toLowerCase().indexOf("multiluascripts.zip") > -1) {
                tr[i].style.display = "none";
            }
        }
    }

    moduleModel = document.getElementById("multiModuleSelect").value.toLowerCase();
    if (moduleModel != '') {
        // document.getElementById("moduleLinkUrl").href = "https://downloads.multi-module.org/?" + moduleModel;
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
        releaseInfoLink = document.getElementById("release_" + release);
        releaseInfoLink.style.display = "none";
    }

    releaseInfoLink = document.getElementById("release_" + firmwareVersion);
    releaseInfoLink.style.display = "";
}

function togglePreRelease(){

    if (document.getElementById('includePreReleaseYes').checked) {
        includePreRelease = true;
    } else {
        includePreRelease = false;
    }

    $("option.optPreRelease").each(function (i) {
        this.disabled = !includePreRelease;
    });

    $('#firmwareVersion').children('option:enabled').eq(0).prop('selected',true);
    $('#firmwareVersion').trigger('change');

    if (includePreRelease &! this.preReleaseWarningShown) {
        $('#exampleModalCenter').modal();
        this.preReleaseWarningShown = true;
    }

}

function moduleSelect() {
    selectedModule = document.getElementById("multiModuleSelect").value.toLowerCase();
    switch (selectedModule) {
        case "bg-avr":
        case "diy-avr":
            $('#moduleType').val('-avr-').trigger('change');
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "bg-stm32":
        case "diy-stm32":
        case "hp4in1":
        case "irangex":
        case "jp4in1":
        case "uruav-tmx5":
        case "vantac-mpm":
            $('#moduleType').val('-stm-').trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#telemetryInversion').val('-inv-').trigger('change');
            break;
        case "jp-t16ext":
            $('#moduleType').val('-stm-').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#telemetryInversion').val('-inv-').trigger('change');
            break;
        case "jp-t12pro":
        case "jp-t16int":
        case "rmtx16s":
            $('#moduleType').val('-stm-').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        case "orangerx":
            $('#moduleType').val('-orangerx-').trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#telemetryInversion').val(null).trigger('change');
            break;
        case "jp-t18int":
            $('#moduleType').val('-t18int-').trigger('change');
            $('#radioType').val('-opentx-').trigger('change');
            $('#telemetryInversion').val('-noinv-').trigger('change');
            break;
        default:
            $('#moduleType').val(null).trigger('change');
            $('#radioType').val(null).trigger('change');
            $('#telemetryInversion').val(null).trigger('change');
            break;
    }

    myFunction();
}

function formReset() {
    setTimeout(function() {
        myFunction();
        
        $('#multiModuleSelect').val(null).trigger('change');
        $('#moduleType').val(null).trigger('change');
        $('#radioType').val(null).trigger('change');
        $('#channelOrder').val(null).trigger('change');
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

$(document).ready(function() {
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

    $(".js-example-basic-hide-search-no-clear").select2({
        minimumResultsForSearch: Infinity
    });

});

$('.popover-dismiss').popover({
    trigger: 'focus'
})