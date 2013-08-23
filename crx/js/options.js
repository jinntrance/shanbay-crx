/**
 *@user Joseph
 */
// Saves options to localStorage.
function save_options() {
    localStorage["etym"] = $("input[name=etym]:checked").val();
    localStorage["hider"] =  $("input[name=hider]:checkbox:checked").map(function(i,e){return $(e).val()}).toArray();

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "保存成功";
    setTimeout(function() {
        status.innerHTML = "";
    }, 750);
    chrome.extension.sendRequest({method: "setLocalStorage",data:localStorage});

}

// Restores select box state to saved value from localStorage.
function restore_options() {
    $("input[name=etym][value="+localStorage["etym"]+"]").attr("checked",true);
    $("input[name=hider]:checkbox").val(localStorage["hider"].split(','))
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
