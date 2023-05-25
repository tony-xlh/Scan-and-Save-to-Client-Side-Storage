export function arrayBufferToBlob(buffer,type){
  return new Blob([buffer],{type:type});
}

export function blobToArrayBuffer(blob){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader;
    reader.addEventListener("loadend",function(){
      resolve(reader.result);
    });
    reader.addEventListener("error",reject);
    reader.readAsArrayBuffer(blob);
  });
}

export function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}
