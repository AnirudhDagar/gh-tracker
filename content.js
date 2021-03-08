async function add_user(user_name){
  // Initialize empty users list once
  if (localStorage.getItem("users") == null){
    localStorage.setItem("users", '[]')
    console.log("Initializing empty users list.")
  }
  if (localStorage.getItem(user_name) != null){
    console.log("Username already exists!");
  }
  else{
    var followers = await fetch_followers(user_name);
    var followers_data = followers[0]
    var followers_list = followers[1]
    localStorage.setItem(user_name+"_fd", JSON.stringify(followers_data));
    localStorage.setItem(user_name+"_fl", JSON.stringify(followers_list));
    var old_users = JSON.parse(localStorage.getItem("users"));
    old_users.push(user_name)
    localStorage.setItem("users", JSON.stringify(old_users));
  }
}


async function fetch_user_data(user_name){
  var user_data;
  var user_url = `https://api.github.com/users/${user_name}`;
  try{
    user_data = await (await fetch(user_url)).json();
    await localStorage.setItem(user_name, JSON.stringify(user_data));
    return user_data;
  }
  catch(err){
    console.log("Incorrect username");
    return null;
  }
}


async function fetch_followers(user_name){
    var user_data = await fetch_user_data(user_name);
    var num_followers = JSON.parse(localStorage.getItem(user_name))["followers"];
    var per_page = 100;
    if(num_followers < 100){
        per_page = num_followers;
    }
    var num_pages = Math.floor(num_followers / 100) + 1;
    var followers_list = new Array();
    var followers_data = new Array();
    for(var i=1; i<=num_pages; i++){
        var follower_url = `https://api.github.com/users/${user_name}/followers?page=${i}&per_page=${per_page}`;
        followers_data.push(await (await fetch(follower_url)).json());
    }
    var followers = followers_data.flat();
    for(var i=0; i<followers.length; i++){
      followers_list.push(followers[i]["login"]);
    }
    return [followers, followers_list];
}


async function unfollowers_list(user, unfollowed_by){
  // Initialize empty unfollowers list once
  if (localStorage.getItem(user + "_unfollowers") == null){
    localStorage.setItem(user + "_unfollowers", '[]');
    console.log("Initializing empty users list.")
  }
  var old_unfollowers = JSON.parse(localStorage.getItem(user + "_unfollowers"));
  old_unfollowers.push(unfollowed_by);
  localStorage.setItem(user + "_unfollowers", JSON.stringify(old_unfollowers));
}