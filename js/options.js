/**
 * 设置页面保存与回复设置相关的js
 *@user Joseph
 */
chrome.management.getSelf(function (info) {
    console.log(info);
})
// Saves options to localStorage.
function save_options() {
    $('input[type=radio]:checked').each(function (index) {
        let name = this.name;
        localStorage[name] = this.value;
    });
    $('input[type=text]').each(function (index) {
        let name = this.name;
        localStorage[name] = this.value;
    });
    localStorage["hider"] = $("input[name=hider]:checkbox:checked").map(function (i, e) {
        return $(e).val()
    }).toArray();
    localStorage["web_key"] = $('textarea[name=web_key]').val().trim().split('\n');


    // Update status to let user know options were saved.
    let status = document.getElementById("status");
    status.innerHTML = "保存成功";
    setTimeout(function () {
        status.innerHTML = "";
    }, 750);
    chrome.runtime.sendMessage({method: "setLocalStorage", data: localStorage});

}

// Restores select box state to saved value from localStorage.
function restore_options() {
    $('input[type=radio]').each(function (index) {
       let name = this.name;
       let value = localStorage[name];
        if (value && value.trim().length > 0) {
            $("input[name=" + name + "][value=" + value + "]").attr("checked", true);
        }
    });
    $('input[type=text]').each(function (index) {
        let name = this.name;
        if(localStorage[name] && localStorage[name].trim().length > 0) {
            $("input[name=" + name + "]").val(localStorage[name]);
        }
    });
//    $('textarea[name=web_key]').val(localStorage["web_key"])
    let hider = localStorage["hider"];
    if (!hider) hider = [];
    else hider = hider.split(',');
    $("input[name=hider]:checkbox").val(hider);
    let keys = localStorage["web_key"];
    if (!keys) keys = '';
    else keys = keys.replace(/,/g, '\n');

    // 增加行数显示完 keys
    let row = 3;
    let keys_length = keys.split(/\n/).length;
    if (keys_length > 3) {
        row = keys_length;
    }
    $("textarea[name=web_key]").val(keys).attr("rows", row);

}

function test_keys() {
    save_options();
    let $textarea = $('textarea[name=web_key]');
    let keys = $textarea.val().trim();
    if (keys.length > 0)
        keys.split('\n').forEach(function (e) {
            let term = 'conduct';
            let url = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=' + e;
            getOnlineWebster(term, url, function (data) {
                if (0 < data.length) {
                    $textarea.val(($textarea.val() + '\n' + e).trim());
                    save_options();
                }
            })
        });
    $textarea.val('')
}

function mail_me() {
    window.open("mailto:jinntrance@gmail.com?subject=Webster Keys&body=" + $('textarea[name=web_key]').val().split('\n').join(','))
}

document.addEventListener('DOMContentLoaded', function(){
	restore_options();
	document.querySelector('#save').addEventListener('click', test_keys);
	document.querySelector('#test').addEventListener('click', test_keys);
	document.querySelector('#mail_me').addEventListener('click', mail_me);
});
