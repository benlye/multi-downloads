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
}

function moduleSelect() {
    selectedModule = document.getElementById("multiModuleSelect").value.toLowerCase();
    switch(selectedModule) {
        case "banggood-avr":
        case "diy-avr":
            document.getElementById("moduleType").value = "-avr-";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "banggood-stm32":
        case "diy-stm32":
        case "hobbyporter-stm32":
        case "irangex-irx":
        case "jumper-jp4in1":
        case "vantac-mpm":
            document.getElementById("moduleType").value = "-stm-";
            document.getElementById("radioType").value = "";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "jumper-t16ext":
            document.getElementById("moduleType").value = "-stm-";
            document.getElementById("radioType").value = "-opentx-";
            document.getElementById("telemetryInversion").value = "-inv-";
            break;
        case "jumper-t16int":
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