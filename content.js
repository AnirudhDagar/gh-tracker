async function init(){
  var users = JSON.parse(localStorage.getItem("users"));
  for(var i=0; i<(users.length); i++){
    var bool_unfollowed = false;
    var old_followers_data = JSON.parse(localStorage.getItem(users[i]+"_fd"));
    var old_followers_list = JSON.parse(localStorage.getItem(users[i]+"_fl"));
    curr_followers  = await fetch_followers(users[i]);
    var curr_followers_data = curr_followers[0]
    var curr_followers_list = curr_followers[1]
    // TODO: Remove the if statement, only for debugging
    if (i==1){
      console.log("removing array");
      curr_followers_list.splice(3, 1);
    }
    for(var j=0; j<old_followers_list.length; j++){
      if(!curr_followers_list.includes(old_followers_list[j])){
        bool_unfollowed = true;
        console.log(`${old_followers_data[j]["login"]} unfollowed ${users[i]}! :(`);
        await unfollowers_list(users[i], old_followers_data[j]["login"]);
        var user_data = JSON.parse(localStorage.getItem(users[i]));
        console.log(user_data, old_followers_data[j])
        addNotificationToDOM_v2(old_followers_data[j], user_data);
      }
    }
    if (bool_unfollowed==false){
        console.log(`Nobody unfollowed ${users[i]}! :)`)
      }
    // Update the localstorage
    localStorage.setItem(users[i]+"_fd", JSON.stringify(curr_followers_data));
    localStorage.setItem(users[i]+"_fl", JSON.stringify(curr_followers_list));
    }
  }


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


function addNotificationToDOM_v2(user1, user2) {
  var username1 = user1["login"];
  var username2 = user2["login"];

  let current_user = document.querySelector("span.css-truncate.css-truncate-target.ml-1").innerText;
  console.log(current_user);
  let userU; let userO; let flag = 0;
  if(username1==current_user || username2==current_user){
    flag = 1;
    if(username1==current_user){
      userU = username1;
      userO = username2;
    }
    else{
      userU = username2;
      userO = username1;
    }
  }
  else{
    userU = username1;
    userO = username2;
  }

  const divc = document.createElement("div");
  divc.classList.add("follow", "d-flex", "flex-items-baseline", "border-bottom", "color-border-secondary" ,"py-3");


  const card_spanDOM = document.createElement("span");
  card_spanDOM.classList.add("mr-3", "d-flex");
  const card_aDOM = document.createElement("a");
  card_aDOM.classList.add("d-inline-block");
  card_aDOM.href = `/${userU}`;

  const card_imageDOM = document.createElement("img");
  card_imageDOM.classList.add("avatar", "avatar-user");
  card_imageDOM.src = user1["avatar_url"];
  card_imageDOM.width = "32";
  card_imageDOM.height = "32";

  card_aDOM.append(card_imageDOM);
  card_spanDOM.append(card_aDOM);

  const card_div1 = document.createElement("div");
  card_div1.classList.add("d-flex", "flex-column", "width-full");
  const card_div2 = document.createElement("div");
  card_div2.classList.add("d-flex", "flex-items-baseline");
  const card_div3 = document.createElement("div");
  const card_div3a = document.createElement("a");
  const card_div3b = document.createElement("a");


  // Create info card
  const divbox = document.createElement("div");
  divbox.classList.add("Box", "p-3", "mt-2");
  const divbox_content = document.createElement("div");
  divbox_content.classList.add("d-flex");
  const divbox_content_a = document.createElement("a");
  divbox_content_a.title=`${userO}`;
  divbox_content_a.href=`/${userO}`;

  const box_imageDOM = document.createElement("img");
  box_imageDOM.classList.add("avatar", "avatar-user", "mr-2");
  box_imageDOM.src = user1["avatar_url"];
  box_imageDOM.width = "40";
  box_imageDOM.height = "40";
  box_imageDOM.alt = `${userO}`;

  const divbox_inner_content = document.createElement("div");
  divbox_inner_content.classList.add("width-full", "ml-1");

  const span_box = document.createElement("span");
  span_box.classList.add("lh-condensed", "color-text-primary");

  const span_box_inner = document.createElement("span");
  span_box_inner.classList.add("mr-1");

  const span_box_inner_a = document.createElement("a");
  span_box_inner_a.classList.add("f5", "Link--secondary", "no-underline");
  span_box_inner_a.href = `/${userO}`;

  const div_bio = document.createElement("div");
  div_bio.classList.add("dashboard-break-word", "lh-condensed", "mb-2", "mt-1", "bio")
  const div_bio_text = document.createElement("div");
  div_bio_text.innerText = `${user1["bio"]}`;

  divbox_content_a.title=`${userO}`;
  divbox_content_a.href=`/${userO}`;

  card_div3a.class="Link--primary no-underline text-bold wb-break-all d-inline-block";
  card_div3a.style="color:black; padding-right:3px; font-Weight:Bold";

  if(flag==1){
    card_div3a.href=`/${userO}`;
    card_div3a.innerText = ` ${userO}`;
    card_div2.innerText = "unfollowed you";
  }
  else{
    card_div3b.class="Link--primary no-underline text-bold wb-break-all d-inline-block";
    card_div3b.style="color:black; padding-left:3px; font-Weight:Bold";
    card_div3a.href=`/${userO}`;
    card_div3a.innerText = ` ${userU}`;
    card_div2.innerText = "unfollowed ";
    card_div3b.href=`/${userU}`;
    card_div3b.innerText = ` ${userO}`;
  }

  card_div3.append(card_div3a);
  card_div2.prepend(card_div3);
  card_div2.append(card_div3b);
  card_div1.append(card_div2);

  div_bio.append(div_bio_text);
  divbox_inner_content.append(div_bio);
  divbox_content.append(divbox_inner_content);
  divbox.append(divbox_content);

  divc.append(card_spanDOM, card_div1, divbox);

  document.querySelector("#dashboard > div > div:nth-child(5)").prepend(divc);
}

init();