var emptied = false;

function empty(id) {
  if( ! emptied ) {
    document.getElementById(id).innerHTML="";
    emptied = true;
  }
}