/**
 * 设置页面保存与回复设置相关的js
 *@user Joseph
 */
// Saves options to localStorage.
function save_options() {
//    test_keys();
    localStorage["etym"] = $("input[name=etym]:checked").val();
    localStorage["click2s"] = $("input[name=click2s]:checked").val();
    localStorage["root2note"] = $("input[name=root2note]:checked").val();
    localStorage["afx2note"] = $("input[name=afx2note]:checked").val();
    localStorage["hide_cn"] = $("input[name=hide_cn]:checked").val();
    localStorage["web_en"] = $("input[name=web_en]:checked").val();
    localStorage["not_pop"] = $("input[name=not_pop]:checked").val();
    localStorage["ctx_menu"] = $("input[name=ctx_menu]:checked").val();
    localStorage["dict"] = $("input[name=dict]:checked").val();
    localStorage["skip_easy"] = $("input[name=skip_easy]:checked").val();
    localStorage["show_syllabe"] = $("input[name=show_syllabe]:checked").val();
    localStorage["hider"] = $("input[name=hider]:checkbox:checked").map(function (i, e) {
        return $(e).val()
    }).toArray();
    localStorage["web_key"] = $('textarea[name=web_key]').val().trim().split('\n');


    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "保存成功";
    setTimeout(function () {
        status.innerHTML = "";
    }, 750);
    chrome.extension.sendRequest({method: "setLocalStorage", data: localStorage});

}

// Restores select box state to saved value from localStorage.
function restore_options() {
    $("input[name=etym][value=" + localStorage["etym"] + "]").attr("checked", true);
    $("input[name=click2s][value=" + localStorage["click2s"] + "]").attr("checked", true);
    $("input[name=root2note][value=" + localStorage["root2note"] + "]").attr("checked", true);
    $("input[name=afx2note][value=" + localStorage["afx2note"] + "]").attr("checked", true);
    $("input[name=hide_cn][value=" + localStorage["hide_cn"] + "]").attr("checked", true);
    $("input[name=web_en][value=" + localStorage["web_en"] + "]").attr("checked", true);
    $("input[name=not_pop][value=" + localStorage["not_pop"] + "]").attr("checked", true);
    $("input[name=ctx_menu][value=" + localStorage["ctx_menu"] + "]").attr("checked", true);
    $("input[name=dict][value=" + localStorage["dict"] + "]").attr("checked", true);
    $("input[name=skip_easy][value=" + localStorage["skip_easy"] + "]").attr("checked", true);
    $("input[name=show_syllabe][value=" + localStorage["show_syllabe"] + "]").attr("checked", true);
//    $('textarea[name=web_key]').val(localStorage["web_key"])
    var hider = localStorage["hider"];
    if (undefined == hider) hider = [];
    else hider = hider.split(',');
    $("input[name=hider]:checkbox").val(hider);
    var keys = localStorage["web_key"];
    if (undefined == keys) keys = '';
    else keys = keys.replace(/,/g, '\n');
    $("textarea[name=web_key]").val(keys)
}

function test_keys() {
    var $textarea = $('textarea[name=web_key]');
    $textarea.val().trim().split('\n').forEach(function (e) {
        var term = 'conduct';
        var url = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=' + e;
        getOnlineWebster(term, url, function (data) {
            if (0 < data.length) {
                $textarea.val(($textarea.val() + '\n' + e).trim());
            }
        })
    });
    $textarea.val('')

}

function mail_me() {
    window.open("mailto:jinntrance@gmail.com?subject=Webster Keys&body=" + $('textarea[name=web_key]').val().split('\n').join(','))
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#test').addEventListener('click', test_keys);
document.querySelector('#mail_me').addEventListener('click', mail_me);
