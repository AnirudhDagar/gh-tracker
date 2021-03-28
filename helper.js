export async function read_storage(key){
  let out = await new Promise(resolve => {
  chrome.storage.sync.get([key], (result) => {
    resolve(result[key]);
  });
});
  return out;
}

export async function read_local_storage(key){
  let out = await new Promise(resolve => {
  chrome.storage.local.get([key], (result) => {
    resolve(result[key]);
  });
});
  return out;
}