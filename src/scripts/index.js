import localforage  from 'localforage';
import '../styles/index.scss';

let metadataStore = localforage.createInstance({
  name: "metadata"
});

window.onload = function(){
  loadDocumentsList();
  registerEvents();
};

async function loadDocumentsList(){
  let ul = document.getElementById("document-list");
  let keys = await metadataStore.keys();
  for (let index = 0; index < keys.length; index++) {
    const timestamp = keys[index];
    let listItem = document.createElement("li");
    let link = document.createElement("a");
    link.href = "document-scanner.html?ID="+timestamp;
    link.target = "_blank";
    link.innerText = new Date(parseInt(timestamp)).toLocaleString();
    listItem.appendChild(link);
    ul.appendChild(listItem);
  }
}

function registerEvents(){
  document.getElementById("new-document-button").addEventListener("click",async function(){
    newDocument();
  });
}

function newDocument(){
  window.open("document-scanner.html?ID="+Date.now(),"_blank");
}
