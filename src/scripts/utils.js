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

export function moveItemUp(arr, index) {
  if (index <= 0 || index > arr.length - 1) { //out of bounds
    return arr;
  }else{
    const item = arr.splice(index,1)[0] //delete the item
    arr.splice(index - 1,0,item) //add the item
    return arr;
  }
}

export function moveItemDown(arr, index) {
  if (index < 0 || index + 1 > arr.length - 1) { //out of bounds
    return arr;
  }else{
    const item = arr.splice(index,1)[0] //delete the item
    arr.splice(index + 1,0,item) //add the item
    return arr;
  }
}

export function removeItem(arr, index) {
  if (index < 0 || index > arr.length - 1) { //out of bounds
    return arr;
  }else{
    arr.splice(index,1) //delete the item
    return arr;
  }
}