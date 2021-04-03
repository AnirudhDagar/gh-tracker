async function main(){
  // Message passing API - communicate with extension
  chrome.runtime.sendMessage({todo: "getData"}, function(response){
    let users = response.users;
    let new_unfollowed_pairs = response.compared_unfollowers;
    let unfollowers_data = response.unfollowers_info;
    console.log("users: ", users);
    console.log("new_unfollowed_pairs", new_unfollowed_pairs);
    console.log("unfollowers_info", unfollowers_data);
    if (users==null){
        console.log("No users set to tracking list!")
        let current_user = document.querySelector("body > div.position-relative.js-header-wrapper > header > div.Header-item.position-relative.mr-0.d-none.d-md-flex > details > summary > img").alt.replace("@", "");
        console.log(`Adding ${current_user} to users tracking list`);
        chrome.runtime.sendMessage({"current_user_add": "true", "user_name": current_user})
        users = [`${current_user}`];
        new_unfollowed_pairs = [];
    }
    if (new_unfollowed_pairs.length == 0){
        console.log(`Nobody unfollowed ${users}! :)`)
      }
    if (unfollowers_data == null || unfollowers_data.length == 0){
        console.log(`No unfollowers data to be added to DOM for ${users}!`)
      }
    else{
      for(let i=0; i<unfollowers_data.length; i++){
        // Send unfollower data to DOM for rendering
        console.log(unfollowers_data[i]["unfollower"]["login"]);
        // TODO: Remove timeout; added to avoid activity_div==null
        setTimeout(() => {  console.log("Wait 1s!");
        addNotificationToDOM(unfollowers_data[i]["unfollower"],
                             unfollowers_data[i]["user_who_was_unfollowed"],
                             unfollowers_data[i]["event_time"]);
        }, 1000);
      }
    }
  });
}


/**
 * Injects the unfollowers card to the activity tab on github feed.
 * @param {DateTime Object} previous_date
 */
function timeDifference(previous_date) {
  let msPerMinute = 60 * 1000;
  let msPerHour = msPerMinute * 60;
  let msPerDay = msPerHour * 24;
  let msPerMonth = msPerDay * 30;
  let msPerYear = msPerDay * 365;

  let current = new Date();
  let elapsed = current - previous_date;

  if (elapsed < msPerMinute) {
       return Math.round(elapsed/1000) + ' seconds ago';
  }
  else if (elapsed < msPerHour) {
       return Math.round(elapsed/msPerMinute) + ' minutes ago';
  }
  else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour ) + ' hours ago';
  }
  else if (elapsed < msPerMonth) {
      return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
  }
  else if (elapsed < msPerYear) {
      return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
  }
  else {
      return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
  }
}


/**
 * Injects the unfollowers card to the activity tab on github feed.
 * @param {JSON object} user_dict1
 * @param {JSON object} user_dict2
 * @param {str} unfollow_event_time
 */
function addNotificationToDOM(user_dict1, user_dict2, unfollow_event_time) {
  // Get time stamp data
  let activity_div = document.querySelector("#dashboard > .news > div[data-repository-hovercards-enabled]:not([class])");
  if (activity_div == null) {
    console.log("activity_div is null");
  }
  let event_lists = activity_div.getElementsByTagName("relative-time");

  // Convert from string to date object
  unfollow_event_time = new Date(unfollow_event_time);

  // Set color scheme according to the theme
  let theme = document.getElementsByTagName("html")[0].getAttribute("data-color-mode");
  console.log("Using", theme, "theme");
  let color = "#24292E"; // color for light theme
  if (theme=="dark"){
    color = "#c9d1d9"; // color for dark theme
  }

  // Get current logged in user
  let current_user = document.querySelector("body > div.position-relative.js-header-wrapper > header > div.Header-item.position-relative.mr-0.d-none.d-md-flex > details > summary > img").alt.replace("@", "");
  console.log("Current User: ", current_user);
  let flag_curr_user = false;
  if(user_dict2['login']==current_user){
    flag_curr_user = true;
  }

  const div_follow = document.createElement("div");
  div_follow.classList.add("follow");
  const div_body = document.createElement("div");
  div_body.classList.add("body");

  const div_card = document.createElement("div");
  div_card.classList.add("d-flex", "flex-items-baseline", "border-bottom", "color-border-secondary" ,"py-3");

  const card_spanDOM = document.createElement("span");
  card_spanDOM.classList.add("mr-3", "d-flex");
  const card_aDOM = document.createElement("a");
  card_aDOM.classList.add("d-inline-block");
  card_aDOM.href = `/${user_dict1["login"]}`;

  const card_imageDOM = document.createElement("img");
  card_imageDOM.classList.add("avatar", "avatar-user");
  card_imageDOM.src = user_dict1["avatar_url"];
  card_imageDOM.width = "32";
  card_imageDOM.height = "32";

  card_aDOM.append(card_imageDOM);
  card_spanDOM.append(card_aDOM);

  const card_div1 = document.createElement("div");
  card_div1.classList.add("d-flex", "flex-column", "width-full");
  const baseline_div = document.createElement("div");
  baseline_div.classList.add("d-flex", "flex-items-baseline");
  const card_div3 = document.createElement("div");
  const card_div3a = document.createElement("a");
  const card_div3b = document.createElement("a");

  const span_date = document.createElement("span")
  span_date.classList.add("f6", "color-text-tertiary", "no-wrap", "ml-1");
  const relative_time_tag = document.createElement("relative-time")

  relative_time_tag.setAttribute("datetime", unfollow_event_time)
  relative_time_tag.classList.add("no-wrap");
  relative_time_tag.setAttribute("title", unfollow_event_time.toUTCString())
  relative_time_tag.innerText = timeDifference(unfollow_event_time);

  card_div3a.classList.add("Link--primary", "no-underline", "text-bold", "wb-break-all", "d-inline-block");
  card_div3a.style=`color:${color}; padding-right:3px; font-Weight:600!important`;

  if(flag_curr_user){
    card_div3a.href=`/${user_dict1["login"]}`;
    card_div3a.innerText = ` ${user_dict1["login"]}`;
    baseline_div.innerText = "unfollowed you";
  }
  else{
    card_div3b.classList.add("Link--primary", "no-underline", "text-bold", "wb-break-all", "d-inline-block");
    card_div3b.style=`color:${color}; padding-left:3px; font-Weight:600!important`;
    card_div3a.href=`/${user_dict1["login"]}`;
    card_div3a.innerText = ` ${user_dict1["login"]}`;
    baseline_div.innerText = "unfollowed ";
    card_div3b.href=`/${user_dict2["login"]}`;
    card_div3b.innerText = ` ${user_dict2["login"]}`;
  }
  
  card_div3.append(card_div3a);
  baseline_div.prepend(card_div3);
  if (!flag_curr_user){
    baseline_div.append(card_div3b);
  }
  span_date.append(relative_time_tag);
  baseline_div.append(span_date);

  //////////////////////////////////////////////
  const divB = document.createElement("div");
  divB.classList.add("Box", "p-3", "mt-2");

  const div1 = document.createElement("div");
  div1.classList.add("d-flex");

  const div1a = document.createElement("a");
  div1a.href = `/${user_dict2["login"]}`; div1a.title = `${user_dict2["login"]}`;

  const div1ai = document.createElement("img");
  div1ai.classList.add("avatar", "avatar-user", "mr-2");
  div1ai.src = user_dict2["avatar_url"];
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
  span2a1.href = `/${user_dict2["login"]}`;
  let name = user_dict2["name"];
  if (name){
    span2a1.innerText = `${name}`; // add name
  }
  else{
    name = user_dict2["login"];
    span2a1.innerText = `${name}`; // add login instead of name
  }
  const span2a2 = document.createElement("a");
  span2a2.classList.add("f5", "Link--secondary", "no-underline");
  span2a2.href = `/${user_dict2["login"]}`;
  span2a2.innerText = `${user_dict2["login"]}`;
  span2a2.style = "padding-left:6px";

  const div3 = document.createElement("div");
  div3.classList.add("dashboard-break-word", "lh-condensed", "mb-2", "mt-1", "bio");

  const div4 = document.createElement("div");
  bio_text = user_dict2["bio"]
  if (bio_text){
    let string = `${bio_text}`;  // add bio
    // Replace all text in bio to create @orgs links
    // $n, where n is integer b/w 1-100, inserts the nth parenthesized submatch string
    let replacedStr = string.replace(/@([a-zA-Z-]+)/g, `<a style="color:${color}; font-Weight:600!important;" href="https://github.com/$1">@$1</a>`);
    div4.innerHTML = `${replacedStr}`;
  }
  else{
    div4.innerHTML = "";  // add empty string instead of null bio
  }

  const p1=document.createElement("p");
  p1.classList.add("f6", "color-text-secondary", "m-0");

  const p1s1=document.createElement("span");
  p1s1.classList.add("mr-3");
  const p1s1a=document.createElement("a");
  p1s1a.classList.add("Link--muted");
  p1s1a.href = `/${user_dict2["login"]}?tab=repositories`;
  p1s1a.innerText =  `${user_dict2["public_repos"]} repositories`;

  const p1s2=document.createElement("span");
  p1s2.classList.add("mr-3");
  const p1s2a=document.createElement("a");
  p1s2a.classList.add("Link--muted");
  p1s2a.href = `/${user_dict2["login"]}?tab=followers`;
  p1s2a.innerText =  `${user_dict2["followers"]} followers`;

  p1s1.append(p1s1a); p1s2.append(p1s2a);
  p1.append(p1s1, p1s2);
  div3.append(div4);
  span2.append(span2a1, span2a2);
  span1.append(span2);
  div2.append(span1, div3, p1);
  div1a.append(div1ai);
  div1.append(div1a, div2);
  divB.append(div1);
  card_div1.append(baseline_div, divB);
  div_card.append(card_spanDOM, card_div1);
  div_body.append(div_card);
  div_follow.append(div_body);

  // Now loop through this event_lists comparing our current event time to put the card there.
  let most_recent_event_time = new Date(event_lists[0].getAttribute("datetime"));
  if (unfollow_event_time > most_recent_event_time){
    console.log("Insert at the top!");
    activity_div.prepend(div_follow);
  }
  else{
    for (var i=0; i < event_lists.length - 1; i += 1) {
      event_time_i = new Date(event_lists[i].getAttribute("datetime"));
      event_time_i_plus = new Date(event_lists[i+1].getAttribute("datetime"));
      if (unfollow_event_time <= event_time_i && unfollow_event_time >= event_time_i_plus){
        activity_div.insertBefore(div_follow, activity_div.children[i+1]);
        console.log("Insert before:", i+1);
        break;
      }
    }
  }
}


window.addEventListener('load', (event) => {
    console.log('The page has fully loaded');
    main();
});