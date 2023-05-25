import '../styles/document-scanner.scss';
import Dynamsoft from 'DWT';
console.log('webpack starterkit document scanner');

Dynamsoft.DWT.ResourcesPath = "/dwt-resources";
let DWRemoteScanObject;
let services = [];
let devices = [];

window.onload = async function(){
  registerEvents();
  setupCamera();
  createRemoteScanObject();
};

function registerEvents(){
  document.getElementById("services-select").addEventListener("change",function(){
    loadDevices();
  });

  document.getElementById("scan-button").addEventListener("click",async function(){
    let deviceConfiguration = {IfCloseSourceAfterAcquire:true, Resolution:300,IfShowUI:false}; // scanning configuration. Check out the docs to learn more: https://www.dynamsoft.com/web-twain/docs/info/api/WebTwain_Acquire.html#acquireimage
    await DWRemoteScanObject.acquireImage(devices[document.getElementById("devices-select").selectedIndex], deviceConfiguration);
  });

  document.getElementById("connect-button").addEventListener("click",async function(){
    createRemoteScanObject();
  });
  

  document.getElementById("take-photo-button").addEventListener("click",async function(){
    startCamera();
  });

  document.getElementById("close-button").addEventListener("click",async function(){
    closeCamera();
  });

  document.getElementById("capture-button").addEventListener("click",async function(){
    takePhoto();
  });
}

async function loadDevices(){
  let selectedService = services[document.getElementById("services-select").selectedIndex];
  devices = await DWRemoteScanObject.getDevices({serviceInfo: selectedService});
  console.log(devices);
  let devicesSelect = document.getElementById("devices-select");
  devicesSelect.options.length = 0;
  for (let index = 0; index < devices.length; index++) {
    const device = devices[index];
    if (device.displayName.length > 0) {
      devicesSelect.options.add(new Option(device.displayName, index));
    } else {
      devicesSelect.options.add(new Option(device.name, index));
    }
  }
}

async function createRemoteScanObject(){
  let serverurl =  document.getElementById("serverURL").value;
  DWRemoteScanObject = await Dynamsoft.DWT.CreateRemoteScanObjectAsync(serverurl);
  let element = document.getElementById("dwtcontrol-container");
  DWRemoteScanObject.Viewer.bind(element); // Bind viewer
  DWRemoteScanObject.Viewer.show(); // Show viewer
  window.DWRemoteScanObject = DWRemoteScanObject;
  loadServices();  
}

async function loadServices(){
  try {
    services = await DWRemoteScanObject.getDynamsoftService();  
  } catch (error) {
    alert(error.message);
    return;
  }
  
  let servicesSelect = document.getElementById("services-select");
  servicesSelect.options.length = 0;
  for (let index = 0; index < services.length; index++) {
    const service = services[index];
    if (service.attrs.name.length > 0) {
      servicesSelect.options.add(new Option(service.attrs.name, index));
    } else {
      servicesSelect.options.add(new Option(service.attrs.UUID, index));
    }
  }
  if (services.length > 0) {
    servicesSelect.selectedIndex = 0;
    loadDevices();
  }
}

function setupCamera(){
  const cameraElement = document.querySelector('camera-preview');
  cameraElement.desiredCamera = "back";
  cameraElement.facingMode = "environment";
  cameraElement.active = false;
  cameraElement.desiredResolution = {width:1920,height:1080};
}

function startCamera(){
  const cameraElement = document.querySelector('camera-preview');
  cameraElement.style.display = "";
  cameraElement.active = true;
}

function closeCamera(){
  const cameraElement = document.querySelector('camera-preview');
  cameraElement.active = false;
  cameraElement.style.display = "none";
}

async function takePhoto(){
  const cameraElement = document.querySelector('camera-preview');
  const blob = await cameraElement.takePhoto(true);
  console.log(blob);
  closeCamera();
}


