import { add_user, compare_followers } from './utils.js'
import { read_storage } from './helper.js'


let debug = true; // Debugging On!
console.log("Background running!");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.current_user_add == 'true'){
    add_user(request.user_name);
  }
  if (request.todo == 'getData'){
    console.log("Requesting to sendMessage!");
    let users;
    let unfollowed_pairs;
    read_storage("users").then((value) => {
      users = value;
      compare_followers(debug).then((ans) => {
        unfollowed_pairs = ans;
        sendResponse({ "type": "data",
                       "users":  users,
                       "compared_unfollowers":  unfollowed_pairs});
      });
    });
  }
  return true;
});