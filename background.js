import { add_user, compare_followers } from './utils.js'
import { read_storage } from './helper.js'

let debug = false; // Debugging On!
console.log("Background running!");
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
  if (request.current_user_add == 'true'){
    add_user(request.user_name);
  }
  if (request.todo == 'getData'){
    console.log("Requesting to sendMessage!");
    let users;
    let unfollowed_pairs;
    let unfollowers_data;
    read_storage("users").then((value) => {
      users = value;
      compare_followers(debug).then((ans) => {
        unfollowed_pairs = ans.new;
        unfollowers_data = ans.total;
        console.log("unfollowers_info", unfollowers_data)
        sendResponse({ "type": "data",
             "users":  users,
             "compared_unfollowers":  unfollowed_pairs,
             "unfollowers_info":  unfollowers_data});
      });
    });
  }
  return true;
});


// Run and check for unfollowers every 180000ms/3minutes in the background.
let check_interval = setInterval(function() {
  console.log("running every 3 minutes")
  let data = compare_followers(debug)}
  , 180000);