async function init(){
  let users = await JSON.parse(localStorage.getItem("users"));
  for(let i=0; i<(users.length); i++){
    let bool_unfollowed = false; // flag true if someone unfollowed a tracked users
    // Get list of old followers and current followers
    let old_followers = await JSON.parse(localStorage.getItem(users[i]+"_fl"));
    let curr_followers  = await fetch_followers(users[i]);
    // TODO: Remove the if statement, only for debugging
    if (i==1){
      console.log("removing array");
      curr_followers.splice(3, 1);
    }
    // Compare old followers and new followers
    for(let j=0; j<old_followers.length; j++){
      if(!curr_followers.includes(old_followers[j])){
        bool_unfollowed = true;
        console.log(`${old_followers[j]} unfollowed ${users[i]}! :(`);
        // Create a list of all time unfollowers for a user X
        await unfollowers_list(users[i], old_followers[j]);
        let user_data = await JSON.parse(localStorage.getItem(users[i]));
        let unfollower_user = await fetch_user_data(old_followers[j], bool_add=false);
        addNotificationToDOM_v2(unfollower_user, user_data);
      }
    }
    if (bool_unfollowed==false){
        console.log(`Nobody unfollowed ${users[i]}! :)`)
      }
    // Update the localstorage
    localStorage.setItem(users[i]+"_fl", JSON.stringify(curr_followers));
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
    let followers_list = await fetch_followers(user_name);
    localStorage.setItem(user_name+"_fl", JSON.stringify(followers_list));
    let old_users = JSON.parse(localStorage.getItem("users"));
    old_users.push(user_name);
    localStorage.setItem("users", JSON.stringify(old_users));
  }
}


async function fetch_user_data(user_name, bool_add=true){
  let user_data;
  let user_url = `https://api.github.com/users/${user_name}`;
  try{
    user_data = await (await fetch(user_url)).json();
    if (bool_add){
      await localStorage.setItem(user_name, JSON.stringify(user_data));
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
    let num_followers = JSON.parse(localStorage.getItem(user_name))["followers"];
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
  if (localStorage.getItem(user + "_unfollowers") == null){
    localStorage.setItem(user + "_unfollowers", '[]');
    console.log("Initializing empty users list.")
  }
  let old_unfollowers = JSON.parse(localStorage.getItem(user + "_unfollowers"));
  old_unfollowers.push(unfollowed_by);
  localStorage.setItem(user + "_unfollowers", JSON.stringify(old_unfollowers));
}


function addNotificationToDOM_v2(dict2, dict1) {
  let current_user = document.querySelector("body > div.position-relative.js-header-wrapper > header > div.Header-item.position-relative.mr-0.d-none.d-md-flex > details > summary > img").alt.replace("@", "");
  console.log(current_user);
  let flag = 0;
  if(dict2['login']==current_user){
    flag = 1;
  }

  const divc = document.createElement("div");
  divc.classList.add("follow", "d-flex", "flex-items-baseline", "border-bottom", "color-border-secondary" ,"py-3");

  const card_spanDOM = document.createElement("span");
  card_spanDOM.classList.add("mr-3", "d-flex");
  const card_aDOM = document.createElement("a");
  card_aDOM.classList.add("d-inline-block");
  card_aDOM.href = `/${dict1["login"]}`;

  const card_imageDOM = document.createElement("img");
  card_imageDOM.classList.add("avatar", "avatar-user");
  card_imageDOM.src = dict1["avatar_url"];
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

  card_div3a.class="Link--primary no-underline text-bold wb-break-all d-inline-block";
  card_div3a.style="color:#24292E; padding-right:3px; font-Weight:600!important";

  if(flag==1){
    card_div3a.href=`/${dict1["login"]}`;
    card_div3a.innerText = ` ${dict1["login"]}`;
    card_div2.innerText = "unfollowed you";
  }
  else{
    card_div3b.class="Link--primary no-underline text-bold wb-break-all d-inline-block";
    card_div3b.style="color:#24292E; padding-left:3px; font-Weight:600!important";
    card_div3a.href=`/${dict1["login"]}`;
    card_div3a.innerText = ` ${dict1["login"]}`;
    card_div2.innerText = "unfollowed ";
    card_div3b.href=`/${dict2["login"]}`;
    card_div3b.innerText = ` ${dict2["login"]}`;
  }
  
  card_div3.append(card_div3a);
  card_div2.prepend(card_div3);
  card_div2.append(card_div3b);
  // card_div1.append(card_div2);

  //////////////////////////////////////////////
  const divB = document.createElement("div");
  divB.classList.add("follow", "Box", "p-3", "mt-2");

  const div1 = document.createElement("div");
  div1.classList.add("d-flex");

  const div1a = document.createElement("a");
  div1a.href = `/${dict2["login"]}`; div1a.title = `${dict2["login"]}`;

  const div1ai = document.createElement("img");
  div1ai.classList.add("avatar", "avatar-user", "mr-2");
  div1ai.src = dict2["avatar_url"];
  div1ai.width = "40";
  div1ai.height = "40";

  const div2 = document.createElement("div");
  div2.classList.add("width-full", "ml-1");

  const span1 = document.createElement("span");
  span1.classList.add("lh-condensed", "color-text-primary");

  const span2 = document.createElement("span");
  span2.classList.add("mr-1");

  const span2a1 = document.createElement("a");
  span2a1.classList.add("f4", "text-bold", "Link--primary", "no-underline");
  span2a1.href = `/${dict2["login"]}`;
  console.log(dict2["name"])
  span2a1.innerText = `${dict2["login"]}`; ///// add name
  const span2a2 = document.createElement("a");
  span2a2.classList.add("f5", "Link--secondary", "no-underline");
  span2a2.href = `/${dict2["login"]}`;
  span2a2.innerText = `${dict2["login"]}`;
  span2a2.style="padding-left:6px";

  const div3= document.createElement("div");
  div3.classList.add("dashboard-break-word", "lh-condensed", "mb-2", "mt-1", "bio");

  const div4= document.createElement("div");
  bio_text = dict2["bio"]
  if (bio_text){
    let string = `${bio_text}`; //// add bio
    let replacedStr = string.replace(/@(\w+)/g, '<a style="color:#24292E; font-Weight:600!important;" href="https://github.com/$1">@$1</a>');
    div4.innerHTML = `${replacedStr}`;
  }
  else{
    let string = "";
    div4.innerHTML = `${string}`;
  }

  const p1=document.createElement("p");
  p1.classList.add("f6", "color-text-secondary", "m-0");

  const p1s1=document.createElement("span");
  p1s1.classList.add("mr-3");
  const p1s1a=document.createElement("a");
  p1s1a.classList.add("Link--muted");
  p1s1a.href = `/${dict2["login"]}?tab=repositories`;
  p1s1a.innerText =  `${dict2["public_repos"]} repositories`;

  const p1s2=document.createElement("span");
  p1s2.classList.add("mr-3");
  const p1s2a=document.createElement("a");
  p1s2a.classList.add("Link--muted");
  p1s2a.href = `/${dict2["login"]}?tab=followers`;
  p1s2a.innerText =  `${dict2["followers"]} followers`;

  p1s1.append(p1s1a); p1s2.append(p1s2a);
  p1.append(p1s1, p1s2);

  div3.append(div4);
  span2.append(span2a1, span2a2);
  span1.append(span2);
  div2.append(span1, div3, p1);
  div1a.append(div1ai);
  div1.append(div1a, div2);
  divB.append(div1);
  //////////////////////
  
  card_div1.append(card_div2, divB);
  divc.append(card_spanDOM, card_div1);

  document.querySelector("#dashboard > div > div:nth-child(5)").prepend(divc);
}

setTimeout(function(){init();}, 2000);