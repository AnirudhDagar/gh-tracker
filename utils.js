import { read_storage } from './helper.js'

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


async function compare_followers(debug=false){
  let users = await read_storage("users");
  let total_unfollowed_pairs = [];
  for(let i=0; i<(users.length); i++){
    let bool_unfollowed = false; // flag true when someone unfollowed a tracked user
    // Get list of old followers and current followers
    let old_followers = await read_storage(users[i]+"_fl");
    let curr_followers  = await fetch_followers(users[i]);
    // TODO: Remove the if statement, only for debugging
    if (i==1 && debug){
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
        // Create a list of all time unfollowers for a user X
        await unfollowers_list(users[i], old_followers[j]);
        let user_data = await read_storage(users[i]);
        let unfollower_user_data = await fetch_user_data(old_followers[j], false);
        total_unfollowed_pairs.push(
          {"unfollower": unfollower_user_data,
          "user_who_was_unfollowed": user_data});
      }
    }
    if (bool_unfollowed==false){
        console.log(`Nobody unfollowed ${users[i]}! :)`)
      }
    // Update the chromestorage
    let user_i_fl = users[i] + "_fl";
    chrome.storage.sync.set({[user_i_fl]: curr_followers});
    }
  return total_unfollowed_pairs;
}


export { add_user, fetch_user_data, fetch_followers, unfollowers_list, compare_followers }