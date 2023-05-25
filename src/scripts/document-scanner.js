import '../styles/document-scanner.scss';
import Dynamsoft from 'DWT';
console.log('webpack starterkit document scanner');

let DWRemoteScanObject;
let services = [];
let devices = [];

registerEvents();
setupDWT();

function registerEvents(){
  document.getElementById("servicesSelect").addEventListener("change",function(){
    loadDevices();
  });

  document.getElementById("scanButton").addEventListener("click",async function(){
    let deviceConfiguration = {IfCloseSourceAfterAcquire:true, Resolution:300,IfShowUI:false}; // scanning configuration. Check out the docs to learn more: https://www.dynamsoft.com/web-twain/docs/info/api/WebTwain_Acquire.html#acquireimage
    await DWRemoteScanObject.acquireImage(devices[document.getElementById("devicesSelect").selectedIndex], deviceConfiguration);
  });
}

async function loadDevices(){
  let selectedService = services[document.getElementById("servicesSelect").selectedIndex];
  devices = await DWRemoteScanObject.getDevices({serviceInfo: selectedService});
  console.log(devices);
  let devicesSelect = document.getElementById("devicesSelect");
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

async function setupDWT(){
  let serverurl =  'https://demo.scannerproxy.com/'; // A public proxy server provided by Dynamsoft. You can also change to your own proxy server.
  if (window.location.protocol === "https:") {
    serverurl = 'https://tony.scannerproxy.com:10086/';
  }else{
    serverurl = 'http://tony.scannerproxy.com:10085/';
  }
  Dynamsoft.DWT.ResourcesPath = "/dwt-resources";
  DWRemoteScanObject = await Dynamsoft.DWT.CreateRemoteScanObjectAsync(serverurl);
  let element = document.getElementById("dwtcontrolContainer");
  DWRemoteScanObject.Viewer.bind(element); // Bind viewer
  DWRemoteScanObject.Viewer.show(); // Show viewer
  loadServices();  
}

async function loadServices(){
  try {
    services = await DWRemoteScanObject.getDynamsoftService();  
  } catch (error) {
    alert(error.message);
    return;
  }
  
  let servicesSelect = document.getElementById("servicesSelect");
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
