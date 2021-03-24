import { add_user, fetch_user_data, fetch_followers, unfollowers_list, compare_followers } from './utils.js'
import { read_storage } from './helper.js'


function getInputValue(){
    // Selecting the input element and get its value 
    var input_user = document.getElementById("myInput").value;
    add_user(input_user);
}


function main(){
  document.getElementById('myButton').addEventListener('click', getInputValue);
}

main();