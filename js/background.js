/**
 * @author Joseph
 */

checked = false;

$(function () {
    check_in();
    setTimeout(function () {
        checked = false;
        check_in();
    }, 3 * 60 * 60 * 1000);//每3h提醒一次

    chrome.contextMenus.removeAll(function () {
        if (localStorage['ctx_menu'] != 'no') {
            chrome.contextMenus.create({
                "title": '在扇贝网中查找"%s"',
                "contexts": ["selection"],
                "onclick": function (info, tab) {
                    isUserSignedOn(function () {
                        getClickHandler(info.selectionText, tab);
                    });
                }
            });
        }
    });
});

var notified = false;

function notify(title, message, url) {
    if (!title) {
        title = "背单词读文章练句子"
    }
    if (!message) {
        message = "少壮不努力，老大背单词！";
    }
    if (!url) {
        url = "http://www.shanbay.com/";
    }
    var opt = {
        type: "basic",
        title: title,
        message: message,
        iconUrl: "icon_48.png"
    };
    var notId = Math.random().toString(36);
    if (!notified && ls()['not_pop'] != 'no') {
        notification = chrome.notifications.create(notId, opt, function (notifyId) {
            console.info(notifyId + " was created.");
            notified = true
        });
    }
    chrome.notifications.onClicked.addListener(function (notifyId) {
        console.info("notification was clicked");
        chrome.notifications.clear(notifyId, function () {
        });
        if (notId == notifyId) {
            chrome.tabs.create({
                url: url
            })
        }
        notified = false
    });
    setTimeout(function () {
        chrome.notifications.clear(url, function () {
        });
    }, 5000);
}

function notify_login() {
    notify("", "请登录……", "http://shanbay.com/accounts/login/");
}


function check_in() {
    var check_in_url = "http://www.shanbay.com/api/v1/checkin/";
    $.getJSON(check_in_url, function (json) {
        var arry = json.data.tasks.map(function (task) {
            return task.meta.num_left;
        });
        var m = max(arry);
        localStorage['checkin'] = m;
        if (0 == m) {
            chrome.browserAction.setBadgeText({text: ''});
        }
        else if (m > 0) {
            chrome.browserAction.setBadgeText({text: m + ''});
            //notified = false;
            notify();
        }
    }).fail(function () {
        //notified = false;
        notify();
    });
    checked = true;
}

function max(array) {
    if (undefined == array || array.length == 0) return 0;
    var max = array[0];
    array.forEach(function (e) {
        if (e > max) max = e;
    });
    return max;
}

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    console.log("received method: " + request.method);
    switch (request.method) {
        case "getLocalStorage":
            sendResponse({data: localStorage});
            break;
        case "setLocalStorage":
            window.localStorage = request.data;
            sendResponse({data: localStorage});
            break;
        case 'lookup':
            isUserSignedOn(function () {
                getClickHandler(request.data, sender.tab);
            });
            sendResponse({data: {tabid: sender.tab.id}});
            break;
        case 'addWord':
            addNewWordInBrgd(request.data, sendResponse);
            break;
        case 'forgetWord':
            forgetWordInBrgd(request.data, sendResponse);
            break;
        case 'openSettings':
            chrome.tabs.create({url: chrome.runtime.getURL("options.html") + '#' + request.anchor});
            sendResponse({data: {tabid: sender.tab.id}});
            break;
        case 'playAudio':
            playAudio(request.data['audio_url']);
            break;
        default :
            sendResponse({data: []}); // snub them.
    }
});

chrome.extension.onMessage.addListener(function (message, sender, sendResponse) {
    var tabid = sender.tab.id;
    console.log("received " + message.data);
    switch (message.action) {
        case 'is_user_signed_on':
            isUserSignedOn();
            break;
        case 'lookup':
            isUserSignedOn(function () {
                getClickHandler(message.data, sender.tab);
            });
            break;
    }
});


function addNewWordInBrgd(word_id, sendResponse) {
    chrome.cookies.getAll({"url": 'http://www.shanbay.com'}, function (cookies) {
        $.ajax({
            url: 'http://www.shanbay.com/api/v1/bdc/learning/',
            type: 'POST',
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                content_type: "vocabulary",
                id: word_id
            }),
            success: function (data) {
                sendResponse({data: {msg: 'success', rsp: data.data}});
                console.log('success');
            },
            error: function () {
                sendResponse({data: {msg: 'error', rsp: {}}});
                console.log('error');
            },
            complete: function () {
                console.log('complete');
            }
        });
    });
}

function forgetWordInBrgd(learning_id, sendResponse) {
    chrome.cookies.getAll({"url": 'http://www.shanbay.com'}, function (cookies) {
        $.ajax({
            url: 'http://www.shanbay.com/api/v1/bdc/learning/' + learning_id,
            type: 'PUT',
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                retention: 1
            }),
            success: function (data) {
                sendResponse({data: {msg: 'success', rsp: data.data}});
                console.log('success');
            },
            error: function () {
                sendResponse({data: {msg: 'error', rsp: {}}});
                console.log('error');
            },
            complete: function () {
                console.log('complete');
            }
        });
    });
}

function normalize(word) {
    return word.replace(/·/g, '');
}

var getLocaleMessage = chrome.i18n.getMessage;
var API = 'http://www.shanbay.com/api/v1/bdc/search/?word=';


function isUserSignedOn(callback) {
    chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'sessionid'}, function (cookie) {
        if (cookie) {
            localStorage.setItem('shanbay_cookies', cookie);
            callback();
        } else {
            localStorage.removeItem('shanbay_cookies');
            notified = false;
            notify_login();
        }
    });
}

function getClickHandler(term, tab) {
    console.log('signon');
    var url = API + normalize(term);//normalize it only

    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'JSON',
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            console.log('success');
            if ((1 == data.status_code) || localStorage['search_webster'] == 'yes')
                getOnlineWebsterCollegiate(term, function (word, json) {
                    var defs = json.fls.map(function (i) {
                        return "<span class='web_type'>" + json.fls[i].textContent + '</span>, ' + json.defs[i].textContent
                    }).toArray().join('<br/>');
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'popover',
                        data: {
                            shanbay: data,
                            webster: {term: json.hw[0].textContent.replace(/\*/g, '·'), defs: defs}
                        }
                    });
                });
            else chrome.tabs.sendMessage(tab.id, {
                action: 'popover',
                data: {shanbay: data}
            });
        },
        error: function () {
            console.log('error');
        },
        complete: function () {
            console.log('complete');
        }
    });
}

function singularize(word) {
    var specailPluralDic = {
        'men': 'man',
        'women': 'woman',
        'children': 'child'
    };
    var result = specailPluralDic[word];
    if (result) {
        return result;
    }

    var pluralRule = [{
        'match': /s$/,
        'replace': ''
    }];

    for (var j = 0; j < pluralRule.length; j++) {
        if (word.match(pluralRule[j].match)) {
            return word.replace(pluralRule[j].match, pluralRule[j].replace);
        }
    }

    return word;
}

function playAudio(audio_url) {
    if (audio_url) {
        new Howl({
            urls: [audio_url]
        }).play().volume(1.0);
    }
}
