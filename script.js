/* Socket.io setup */
try {
    var socket = io();
} catch (error) {
    console.log("Socket.io unable to connect!");
    //console.log(error);
}
window.addEventListener("load", function () { //when page loads

});

var heartbeatReceived = false;
if (socket.connected) {
    socket.on('heartbeat', function (data) { //get button status from client
        heartbeatReceived = true;
    });
}
setInterval(heartbeatCheck, 1000);
function heartbeatCheck() {
    var connectionStatusElement = document.getElementById("connectionStatus");
    if (heartbeatReceived == true) {
        heartbeatReceived = false;
        connectionStatusElement.innerHTML = "Connected!";
        connectionStatusElement.classList.remove("alarm");
    } else {
        connectionStatusElement.innerHTML = "Not Connected!";
        if (connectionStatusElement.classList.contains("alarm") == false) {
            connectionStatusElement.classList.add("alarm");
        }
    }
}

if (socket.connected) {
    socket.on('updateDevicesFromServer', function (data) { //get button status from client
        updateDevicesFromServer(data);
    });
}
function updateDevicesFromServer(updatedDevices) {
    devices = updatedDevices;
    updateDevicesGraphics();
}

function sendDevicesToServer() {
    var devicesString = "";
    for (var i = 0; i < devices.length; i++) {
        devicesString += i + ";" + devices[i].deviceName + ";" + devices[i].currentStatus + ";" + devices[i].enabledToggle + ";" + devices[i].silencedToggle + ";" + devices[i].statusTextActive + ";" + devices[i].statusTextInactive + ";" + devices[i].timeDelay + ";" + devices[i].gpioPin + "\n";
    }
    if (socket.connected) {
        socket.emit('devicesUpdate', devicesString);
    }
}


/* Night Mode */
var nightModeToggleState = document.getElementById("nightModeToggle").checked;
function toggleNightMode() {
    nightModeToggleState = !nightModeToggleState;
    if (nightModeToggleState == true) {
        setTheme("theme-dark");
    } else {
        setTheme("theme-light");
    }
    if (document.getElementById("nightModeToggle").checked != nightModeToggleState) {
        document.getElementById("nightModeToggle").checked = nightModeToggleState;
    }
}


// function to set a given theme/color-scheme
function setTheme(themeName) {
    document.documentElement.className = themeName;
    document.getElementById("body").className = themeName;
}

/* Open first tab by default */
openTab(
    document.getElementsByClassName("tabbutton")[0],
    document.getElementsByClassName("tabContent")[0].id
);

/* Code to change the tab */
function openTab(button, tabId) {
    // Declare all variables
    var i, tabContents, tabbuttons;

    // Get all elements with class="tabcontent" and hide them
    tabContents = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    // Get all elements with class="tabbutton" and remove the class "active"
    tabbuttons = document.getElementsByClassName("tabbutton");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].className = tabbuttons[i].className.replace(" active", "");
    }

    // Show the current tab
    document.getElementById(tabId).style.display = "block";
    // Add an "active" class to the button that opened the tab
    button.className += " active";
}

/* Code to open device log */
function openDeviceDropdown(deviceDropdownId) {
    var deviceDropdown = document.getElementById(deviceDropdownId);
    if (deviceDropdown.classList.contains("active")) {
        deviceDropdown.style.display = "none";
        deviceDropdown.classList.remove("active");
    } else {
        deviceDropdown.style.display = "block";
        deviceDropdown.classList.add("active");
    }
}

/* Code to create a new DeviceButton on in the desired container */
function createDeviceButton(container, deviceId) {
    var containerElement = document.getElementById("container-" + container);
    var templateElement = document.getElementById("templateButton-" + container).innerHTML;
    var index = containerElement.children.length;
    templateElement = templateElement.replaceAll('[deviceId]', deviceId);
    containerElement.insertAdjacentHTML("beforeend", templateElement);
    var clonedElement = containerElement.children[index];
    return clonedElement;
}

/* Set up devices variables */
var devices = [];

function addDevice() {
    var deviceInfo = { deviceName: "Device", currentStatus: "inactive", enabledToggle: 0, silencedToggle: 0, statusTextActive: "OPEN", statusTextInactive: "CLOSED", timeDelay: 30, gpioPin: -1 };
    devices.push(deviceInfo);
    sendDevicesToServer();
    updateDevicesGraphics();
}

function removeDevice(deviceId) {
    var deviceIndex = convertDeviceIdToIndex(deviceId);
    if (deviceIndex > -1 && deviceIndex < devices.length) {
        // Remove device from devices array
        devices.splice(deviceIndex, 1);
    }
    sendDevicesToServer();
    updateDevicesGraphics();
}

function updateDevicesGraphics() {
    var alarmPanelContainer = document.getElementById("container-AlarmPanel");
    var alarmPanelElements = alarmPanelContainer.getElementsByClassName("device");
    for (var i = alarmPanelElements.length - 1; i >= 0; i--) {
        alarmPanelElements[i].remove();
    }

    var deviceListContainer = document.getElementById("container-DeviceList");
    var deviceListElements = deviceListContainer.getElementsByClassName("device");
    var numAdditionalButtons = devices.length - deviceListElements.length;
    for (var i = 0; i < numAdditionalButtons; i++) {
        var deviceButton = createDeviceButton('DeviceList', '[-1]');
    }
    deviceListElements = deviceListContainer.getElementsByClassName("device");
    for (var i = 0; i < devices.length; i++) {
        var deviceId = '[' + i + ']';
        var regEx = /\[.*?\]\s?/g;

        deviceListElements[i].id = deviceListElements[i].id.replaceAll(regEx, deviceId);
        var newInnerHtml = deviceListElements[i].innerHTML.replaceAll(regEx, deviceId);
        if (deviceListElements[i].innerHTML != newInnerHtml) {
            deviceListElements[i].innerHTML = newInnerHtml;
        }
        document.getElementById("DeviceList-deviceName-" + deviceId).innerHTML = devices[i].deviceName;
        document.getElementById("DeviceList-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
        document.getElementById("DeviceList-enabledToggle-" + deviceId).checked = parseInt(devices[i].enabledToggle);
        document.getElementById("DeviceList-enabledText-" + deviceId).innerHTML = devices[i].enabledToggle == 1 ? "Enabled" : "Disabled";
        document.getElementById("DeviceList-settings-deviceName-" + deviceId).value = devices[i].deviceName;
        document.getElementById("DeviceList-settings-statusTextActive-" + deviceId).value = devices[i].statusTextActive;
        document.getElementById("DeviceList-settings-statusTextInactive-" + deviceId).value = devices[i].statusTextInactive;
        document.getElementById("DeviceList-settings-timeDelay-" + deviceId).value = devices[i].timeDelay;
        document.getElementById("DeviceList-settings-gpioPin-" + deviceId).value = devices[i].gpioPin;

        if (devices[i].currentStatus == "active" && devices[i].enabledToggle == 1) {
            var alarmButton = createDeviceButton('AlarmPanel', deviceId);
            document.getElementById("AlarmPanel-deviceName-" + deviceId).innerHTML = devices[i].deviceName;
            document.getElementById("AlarmPanel-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
            document.getElementById("AlarmPanel-silencedToggle-" + deviceId).checked = devices[i].silencedToggle;
            document.getElementById("AlarmPanel-silencedText-" + deviceId).innerHTML = devices[i].silencedToggle == 1 ? "Silenced" : "Active";
        }
        var deviceDropdown = document.getElementById("DeviceList-settings-" + deviceId);
        if (deviceDropdown.classList.contains("active")) {
            deviceDropdown.style.display = "none";
            deviceDropdown.classList.remove("active");
        }
    }
    for (var i = deviceListElements.length - 1; i >= devices.length; i--) {
        deviceListElements[i].remove();
    }
}

function changeDeviceName(deviceId, value) {
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].deviceName = value;
    sendDevicesToServer();
    document.getElementById("DeviceList-deviceName-" + deviceId).innerHTML = devices[i].deviceName;
    var alarmPanelDevice = document.getElementById("AlarmPanel-" + deviceId);
    if (alarmPanelDevice != null) {
        document.getElementById("AlarmPanel-deviceName-" + deviceId).innerHTML = devices[i].deviceName;
    }
}

function changeDeviceStatusTextActive(deviceId, value) {
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].statusTextActive = value;
    sendDevicesToServer();
    document.getElementById("DeviceList-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
    document.getElementById("DeviceList-settings-statusTextActive-" + deviceId).value = devices[i].statusTextActive;
    var alarmPanelDevice = document.getElementById("AlarmPanel-" + deviceId);
    if (alarmPanelDevice != null) {
        document.getElementById("AlarmPanel-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
    }
}

function changeDeviceStatusTextInactive(deviceId, value) {
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].statusTextInactive = value;
    sendDevicesToServer();
    document.getElementById("DeviceList-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
    document.getElementById("DeviceList-settings-statusTextInactive-" + deviceId).value = devices[i].statusTextInactive;
    var alarmPanelDevice = document.getElementById("AlarmPanel-" + deviceId);
    if (alarmPanelDevice != null) {
        document.getElementById("AlarmPanel-deviceStatus-" + deviceId).innerHTML = (devices[i].currentStatus == "active") ? devices[i].statusTextActive : devices[i].statusTextInactive;
    }
}

function changeDeviceTimeDelay(deviceId, value) {
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].timeDelay = value;
    sendDevicesToServer();
    document.getElementById("DeviceList-settings-timeDelay-" + deviceId).value = devices[i].timeDelay;
}

function changeDeviceGPIO(deviceId, value) {
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].gpioPin = value;
    sendDevicesToServer();
    document.getElementById("DeviceList-settings-gpioPin-" + deviceId).value = devices[i].gpioPin;
}

function changeDeviceSilenced(deviceId, value) {
    value = (value == true) ? 1 : 0;
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].silencedToggle = value;
    sendDevicesToServer();
    var alarmPanelDevice = document.getElementById("AlarmPanel-silencedText-" + deviceId);
    if (alarmPanelDevice != null) {
        document.getElementById("AlarmPanel-silencedText-" + deviceId).innerHTML = devices[i].silencedToggle == 1 ? "Silenced" : "Active";
    }
}

function changeDeviceEnabled(deviceId, value) {
    value = (value == true) ? 1 : 0;
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].enabledToggle = value;
    sendDevicesToServer();
    //document.getElementById("DeviceList-enabledToggle-"+deviceId).checked = devices[i].enabledToggle;
    updateDevicesGraphics();
}

function convertDeviceIdToIndex(deviceId) {
    var deviceIndex = deviceId.replace('[', '');
    deviceIndex = deviceIndex.replace(']', '');
    return deviceIndex;
}

function setAlarm(deviceId, status) { // status = "active" OR "inactive"
    var i = convertDeviceIdToIndex(deviceId);
    if (devices.length <= i) {
        updateDevicesGraphics();
        return
    };
    devices[i].currentStatus = status;
    updateDevicesGraphics();
}

/* Set up alarm checking updates */
var alarmsOn = false;
setInterval(alarmsUpdate, 500);

function alarmsUpdate() {
    alarmsOn = !alarmsOn;
    for (var i = 0; i < devices.length; i++) {
        var deviceListDeviceStatusElement = document.getElementById("DeviceList-deviceStatus-" + '[' + i + ']');
        if (deviceListDeviceStatusElement != null) {
            if (devices[i].currentStatus == "active") {
                if (alarmsOn == true) {
                    if (deviceListDeviceStatusElement.classList.contains("alarm") == false) {
                        deviceListDeviceStatusElement.classList.add("alarm");
                    }
                } else {
                    if (devices[i].silencedToggle == 0 && devices[i].enabledToggle == 1) { // If NOT silenced AND IS enabled, remove the alarm class to toggle flashing red
                        deviceListDeviceStatusElement.classList.remove("alarm");
                    }
                }
            } else {
                deviceListDeviceStatusElement.classList.remove("alarm");
            }
        }
        var alarmPanelDeviceStatusElement = document.getElementById("AlarmPanel-deviceStatus-" + '[' + i + ']');
        if (alarmPanelDeviceStatusElement != null) {
            if (devices[i].currentStatus == "active") {
                if (alarmsOn == true) {
                    if (alarmPanelDeviceStatusElement.classList.contains("alarm") == false) {
                        alarmPanelDeviceStatusElement.classList.add("alarm");
                    }
                } else {
                    if (devices[i].silencedToggle == 0) { // If NOT silenced, remove the alarm classs to toggle flashing red
                        alarmPanelDeviceStatusElement.classList.remove("alarm");
                    }
                }
            } else {
                alarmPanelDeviceStatusElement.classList.remove("alarm");
            }
        }
    }
}