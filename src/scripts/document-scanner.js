import '../styles/document-scanner.scss';
import Dynamsoft from 'DWT';
import {moveItemUp, moveItemDown, removeItem, getUrlParam, arrayBufferToBlob, blobToArrayBuffer} from './utils';
import localforage  from 'localforage';
console.log('webpack starterkit document scanner');

Dynamsoft.DWT.ResourcesPath = "/dwt-resources";
let DWRemoteScanObject;
let services = [];
let devices = [];
let images = [];
let documentID;
let selectedID;

let metadataStore = localforage.createInstance({
  name: "metadata"
});

let imagesStore = localforage.createInstance({
  name: "images"
});

window.onload = async function(){
  documentID = getUrlParam("ID");
  if (!documentID) {
    alert("Empty document ID");
    return;
  }
  registerEvents();
  setupCamera();
  createRemoteScanObject();
  loadImagesListFromIndexedDB();
};

function registerEvents(){
  document.getElementById("services-select").addEventListener("change",function(){
    loadDevices();
  });

  document.getElementById("scan-button").addEventListener("click",async function(){
    scanDocument();
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

  document.getElementById("move-up-button").addEventListener("click",async function(){
    moveSelectedUp();
  });

  document.getElementById("move-down-button").addEventListener("click",async function(){
    moveSelectedDown();
  });

  document.getElementById("remove-button").addEventListener("click",async function(){
    removeSelected();
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
  await saveImageToIndexedDB(blob);
  closeCamera();
}

async function scanDocument(){
  let deviceConfiguration = {IfCloseSourceAfterAcquire:true, Resolution:300,IfShowUI:false}; // scanning configuration. Check out the docs to learn more: https://www.dynamsoft.com/web-twain/docs/info/api/WebTwain_Acquire.html#acquireimage
  await DWRemoteScanObject.acquireImage(devices[document.getElementById("devices-select").selectedIndex], deviceConfiguration);
  const blob = await DWRemoteScanObject.getImages([0],Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG, Dynamsoft.DWT.EnumDWT_ImageFormatType.blob);
  await DWRemoteScanObject.removeImages([0]);
  saveImageToIndexedDB(blob);
}

async function displayImagesInIndexedDB(){
  const documentViewer = document.getElementById("document-viewer");
  const pages = documentViewer.getElementsByClassName("page");
  for (let index = 0; index < images.length; index++) {
    const ID = images[index];
    const blob = await loadImageAsBlobFromIndexedDB(ID);
    let page = pages[index];
    if (page) {
      if (page.getAttribute("ID") === ID) {
        if (!page.getAttribute("src")) {
          page.src = URL.createObjectURL(blob);
        }
      }
    }else{
      page = document.createElement("img");
      page.className = "page";
      page.setAttribute("ID",ID);
      page.src = URL.createObjectURL(blob);
      page.addEventListener("click",function(){
        selectPage(ID);
      });
      documentViewer.appendChild(page);
    }
  }
}

function selectPage(ID){
  selectedID = ID;
  const documentViewer = document.getElementById("document-viewer");
  const pages = documentViewer.getElementsByClassName("page");
  for (let index = 0; index < pages.length; index++) {
    const page = pages[index];
    if (page.getAttribute("ID") === ID) {
      page.classList.add("selected");
    }else{
      page.classList.remove("selected");
    }
  }
}

function appendImageToProject(ID){
  images.push(ID);
  saveImagesListToIndexedDB();
}

function saveImagesListToIndexedDB(){
  metadataStore.setItem(documentID,images);
}

async function saveImageToIndexedDB(blob){
  const ID = generateImageID();
  const buffer = await blobToArrayBuffer(blob);
  await imagesStore.setItem(ID,buffer);
  appendImageToProject(ID);
  await displayImagesInIndexedDB();
}

async function loadImageAsBlobFromIndexedDB(ID){
  const buffer = await imagesStore.getItem(ID);
  const blob = arrayBufferToBlob(buffer);
  return blob;
}

function generateImageID(){
  return Date.now().toString();
}

async function loadImagesListFromIndexedDB(){
  const value = await metadataStore.getItem(documentID);
  if (value) {
    images = value;
    displayImagesInIndexedDB();
  }
}

function moveSelectedUp(){
  const index = images.indexOf(selectedID);
  const documentViewer = document.getElementById("document-viewer");
  moveItemUp(images,index);
  moveItemUp(documentViewer,index);
  saveImagesListToIndexedDB();
}

function moveSelectedDown(){
  const index = images.indexOf(selectedID);
  const documentViewer = document.getElementById("document-viewer");
  moveItemDown(images,index);
  moveItemDown(documentViewer,index);
  saveImagesListToIndexedDB();
}

async function removeSelected(){
  const index = images.indexOf(selectedID);
  await imagesStore.removeItem(selectedID);
  const documentViewer = document.getElementById("document-viewer");
  removeItem(images,index);
  removeItem(documentViewer,index);
  saveImagesListToIndexedDB();
}
