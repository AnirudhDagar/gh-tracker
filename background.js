import { add_user, fetch_user_data, fetch_followers, unfollowers_list, compare_followers } from './utils.js'
import { read_storage } from './helper.js'


let debug = true; // Debugging On!
console.log("Background running!");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.todo == 'getData'){
    console.log("Requesting to sendMessage!");
    let users;
    let unfollowed_pairs;
    read_storage("users").then((value) => {
      users = value;
      compare_followers(debug).then((ans) => {
        unfollowed_pairs = ans;
        console.log("Logger aara:", users, unfollowed_pairs);
        sendResponse({ "type": "data",
                       "users":  users,
                       "compared_unfollowers":  unfollowed_pairs});
      });
    });
  }
  return true;
});