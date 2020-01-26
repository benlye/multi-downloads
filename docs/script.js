function bodyLoad() {
    myFunction();
    var url = window.location.toString();
    var parts = url.split("?")
    if (parts.length > 1) {
        // alert(parts[1]);
        $('#multiModuleSelect').val(parts[1]).trigger('change');
    }
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
}

function moduleSelect() {
    selectedModule = document.getElementById("multiModuleSelect").value.toLowerCase();
    switch(selectedModule) {
        case "bg-avr":
        case "diy-avr":
            document.getElementById("moduleType").value = "-avr-";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "bg-stm32":
        case "diy-stm32":
        case "hp4in1":
        case "irangex":
        case "jp4in1":
        case "vantac-mpm":
            document.getElementById("moduleType").value = "-stm-";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "jp-t16ext":
            document.getElementById("moduleType").value = "-stm-";
            document.getElementById("radioType").value = "-opentx-";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "jp-t16int":
            document.getElementById("moduleType").value = "-stm-";
            document.getElementById("radioType").value = "-opentx-";
            document.getElementById("telemetryInversion").value = "-noinv-";
            break;
        case "orangerx":
            document.getElementById("moduleType").value = "-orangerx-";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "";
            break;
        default:
            document.getElementById("moduleType").value = "";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "";
            break;
    }

    myFunction();
}

function formReset() {
    setTimeout(function () {
        myFunction();
        $('#multiModuleSelect').val(null).trigger('change');
    }, 100); 
}

function openReleaseNotes() {
    firmwareVersion = document.getElementById("firmwareVersion").value.toLowerCase();
    url = 'https://github.com/pascallanger/DIY-Multiprotocol-TX-Module/releases/tag/' + firmwareVersion;
    window.open(url,'_new');
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
  
$(document).ready(function(){
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


});

$('.popover-dismiss').popover({
trigger: 'focus'
})
