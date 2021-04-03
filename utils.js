import { read_storage, read_local_storage } from './helper.js'


/**
 * Adds a user to tracking list.
 * @param {str} user_name
 */
async function add_user(user_name){
  // Get Users List
  let users_list = await read_storage("users");
  if (users_list == null){
    // Initialize empty users list once
    users_list = [];
    chrome.storage.sync.set({"users": users_list})
    console.log("Initializing empty users list.")
  }

  // Check if user_name to be added already exists!
  let user = await read_storage(user_name);
  if (user != null){
    console.log("Username already exists!");
  }
  else{
    let followers_list = await fetch_followers(user_name);
    let user_name_fl = user_name + "_fl";
    chrome.storage.sync.set({[user_name_fl]: followers_list});
    users_list.push(user_name);
    chrome.storage.sync.set({"users": users_list});
  }
}


/**
 * Fetches basic user data from Github API. If bool_add is true,
 * then also saves the user_name to the tracked users list.
 * @param  {str} user_name
 * @param  {Boolean} bool_add
 * @return {JSON Object} user_data
 */
async function fetch_user_data(user_name, bool_add=true){
  let user_url = `https://api.github.com/users/${user_name}`;
  try{
    let user_data = await (await fetch(user_url)).json();
    if (bool_add){
      chrome.storage.sync.set({[user_name]: user_data});
    }
    return user_data;
  }
  catch(err){
    console.log("Incorrect username");
    return null;
  }
}


/**
 * Get the list of followers for a user_name using Github API.
 * @param  {str} user_name
 * @return {JSON Object} followers_list
 */
async function fetch_followers(user_name){
    let user_data = await fetch_user_data(user_name);
    console.log(user_data);
    let num_followers = await new Promise(resolve => {
      chrome.storage.sync.get([user_name], (result) => {
        resolve(result[user_name]["followers"])
      });
    });
    console.log(num_followers);
    let per_page = 100;
    if(num_followers < 100){
        per_page = num_followers;
    }
    let num_pages = Math.floor(num_followers / 100) + 1;
    let followers_list = new Array();
    let followers_data = new Array();
    for(let i=1; i<=num_pages; i++){
        let follower_url = `https://api.github.com/users/${user_name}/followers?page=${i}&per_page=${per_page}`;
        followers_data.push(await (await fetch(follower_url)).json());
    }
    let followers = followers_data.flat();
    for(let i=0; i<followers.length; i++){
      followers_list.push(followers[i]["login"]);
    }
    return followers_list;
}


/**
 * Each user that is being tracked has an all-time unfollowers list.
 * This generates and maintains that list for every user.
 * @param  {str} user
 * @param  {str} unfollowed_by
 */
async function unfollowers_list(user, unfollowed_by){
  // Initialize empty unfollowers list once
  let usr_unfollowers_str = user + "_unfollowers";
  let user_unfollowers = await read_storage(usr_unfollowers_str);
  // console.log(user_unfollowers);
  if (user_unfollowers == null){
    user_unfollowers = [];
    chrome.storage.sync.set({[usr_unfollowers_str]: user_unfollowers});
    console.log("Initializing empty users unfollowers list.")
  }
  user_unfollowers.push(unfollowed_by);
  // console.log(user_unfollowers);
  chrome.storage.sync.set({[usr_unfollowers_str]: user_unfollowers});
}


/**
 * Inputs the new_unfollowed_pairs and saves them after 
 * concatenation with old_unfollowers_data
 * @param  {JSON Object}
 * @return {JSON Object} unfollowers_data
 */
async function keep_time_events(unfollowers_data){
  let old_unfollowers_data = await read_local_storage("unfollowers_info");
  if (old_unfollowers_data != null){
    unfollowers_data = unfollowers_data.concat(old_unfollowers_data);
    chrome.storage.local.set({"unfollowers_info": unfollowers_data});
  }
  else{
    console.log("Initializing unfollowers_info.")
    chrome.storage.local.set({"unfollowers_info": unfollowers_data});
  }
  return unfollowers_data;
}


/**
 * Fetches current followers using Github API & compares them with the
 * old followers which are saved with chrome's storage API.
 * @param  {Boolean}
 * @return {JSON Object}
 */
async function compare_followers(debug=false){
  let users = await read_storage("users");
  if (users==null){
    return [];
  }
  let new_unfollowed_pairs = [];
  for(let i=0; i<(users.length); i++){
    let bool_unfollowed = false; // flag true when someone unfollowed a tracked user
    // Get list of old followers and current followers
    let old_followers = await read_storage(users[i]+"_fl");
    let curr_followers  = await fetch_followers(users[i]);
    // TODO: Remove the if statement, only for debugging
    if (i==0 && debug){
      console.log("removing array");
      curr_followers.splice(3, 1);
      curr_followers.splice(2, 1);
    }
    console.log("old_followers", old_followers.length)
    console.log("curr_followers", curr_followers.length)
    // Compare old followers and new followers
    for(let j=0; j<old_followers.length; j++){
      if(!curr_followers.includes(old_followers[j])){
        bool_unfollowed = true;
        console.log(`${old_followers[j]} unfollowed ${users[i]}! :(`);
        // We approximate the time when script hits this
        // line as the time of unfollowing event.
        let current_time = new Date();
        // Create a list of all time unfollowers for a user X
        await unfollowers_list(users[i], old_followers[j]);
        let user_data = await read_storage(users[i]);
        let unfollower_user_data = await fetch_user_data(old_followers[j], false);
        new_unfollowed_pairs.push(
          {"unfollower": unfollower_user_data,
          "user_who_was_unfollowed": user_data,
          "event_time": current_time.toString()});
      }
    }
    if (bool_unfollowed==false){
        console.log(`Nobody unfollowed ${users[i]}! :)`)
      }
    // Update the chromestorage
    let user_i_fl = users[i] + "_fl";
    chrome.storage.sync.set({[user_i_fl]: curr_followers});
    }
  // Save info
  if (new_unfollowed_pairs.length > 0){
    console.log("Some new unfollowers found.")
  }
  let total_unfollowed_pairs = await keep_time_events(new_unfollowed_pairs);
  return {"total": total_unfollowed_pairs, "new": new_unfollowed_pairs};
}


export { add_user, fetch_user_data, fetch_followers, unfollowers_list, compare_followers }