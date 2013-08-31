/**
 *@user Joseph
 */
// Saves options to localStorage.
function save_options() {
    localStorage["etym"] = $("input[name=etym]:checked").val();
    localStorage["click2s"] = $("input[name=click2s]:checked").val();
    localStorage["root2note"] = $("input[name=root2note]:checked").val();
    localStorage["afx2note"] = $("input[name=afx2note]:checked").val();
    localStorage["hide_cn"] = $("input[name=hide_cn]:checked").val();
    localStorage["web_en"] = $("input[name=web_en]:checked").val();
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
    $("input[name=click2s][value="+localStorage["click2s"]+"]").attr("checked",true);
    $("input[name=root2note][value="+localStorage["root2note"]+"]").attr("checked",true);
    $("input[name=afx2note][value="+localStorage["afx2note"]+"]").attr("checked",true);
    $("input[name=hide_cn][value="+localStorage["hide_cn"]+"]").attr("checked",true);
    $("input[name=web_en][value="+localStorage["web_en"]+"]").attr("checked",true);
    $("input[name=hider]:checkbox").val(localStorage["hider"].split(','))
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
