/**
 * 任意网页扇贝查词
 *
 */


function ls(callback) {
    chrome.runtime.sendMessage({method: "getLocalStorage"}, function (response) {
        if(undefined != response) {
            for (var k in response.data)
                localStorage[k] = response.data[k];
        }
        if(undefined != callback){
            callback();
        }
    });
    return localStorage;
}

function searchingSelectedText () {
    var text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/);
    console.info("selected " + text);
    if (undefined != text && null != text && 0 < text.length && ls()["click2s"] != 'no') {
        console.log("searching " + text);
        chrome.runtime.sendMessage({
            method: 'lookup',
            data: text[0]
        });
        popover({
            shanbay: {
                loading: true,
                msg: "查询中....（请确保已登录扇贝网）"
            }
        })
    }
}

$(function () {
    ls(function() {
        $(document).on('dblclick', searchingSelectedText);
    });
});

/**
 *@user https://chrome.google.com/webstore/detail/%E6%89%87%E8%B4%9D%E5%8A%A9%E6%89%8B/nmbcclhheehkbdepblmeclbahadcebhj/details
 **/


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("received\n");
    console.log(message.data);
    switch (message.callback) {
        case 'popover':
            popover(message.data);
            break;
        case 'forgetWord':
            switch (message.data.msg) {
                case "success":
                    $('#shanbay-forget-btn').addClass('hide');
                    $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
                    break;
                case "error":
                    $('#shanbay_popover .success').text('添加失败，请重试。').removeClass().addClass('failed');
                    break;
                default:
            }
            break;
        case 'addWord':
            switch (message.data.msg) {
                case "success":
                    $('#shanbay-add-btn').addClass('hide');
                    $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
                    $('#shanbay-check-btn').attr('href', 'http://www.shanbay.com/review/learning/' + message.data.rsp.id);
                    break;
                case "error":
                    $('#shanbay_popover .success').text('添加失败，请重试。').removeClass().addClass('failed');
                    break;
                default:
            }
            break;
    }
});

function popover(alldata) {
    var data = alldata.shanbay;
    var webster = alldata.webster;
    var defs = "";
    if (ls()['webster_search'] == 'yes') defs = webster.defs;
    console.log('popover');
    var html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';
    if (true == data.loading) { //loading notification
        html += '<p><span class="word">' + data.msg + '</span></p>';
    } else if (data.data == undefined || data.data.learning_id == undefined) {
        if (1 == data.status_code) {// word not exist
            if (undefined == webster || webster.term == "") html += '未找到单词</h3></div>';
            else html += '<p><span class="word">' + webster.term + '</span></p></h3>' +
                '<div class="popover-content"><p>' + webster.defs + "</p></div>";
        } else {// word exist, but not recorded
            html += '<p><span class="word">' + data.data.content + '</span>'
                + '<small class="pronunciation">' + (data.data.pron.length ? ' [' + data.data.pron + '] ' : '') + '</small></p>'
            html += '<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'

            html += '<div class="popover-content">'
                + '<p>' + data.data.definition.split('\n').join("<br/>") + "<br/>" + defs + '</p>'
                + '<div class="add-btn"><a href="#" class="btn" id="shanbay-add-btn">添加生词</a>'
                + '<p class="success hide">成功添加！</p>'
                + '<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a></div>'
                + '</div>';
        }
    } else {// word recorded
        var forgotUrl = "http://www.shanbay.com/review/learning/" + data.data.learning_id
        html += '<p><span class="word">' + data.data.content + '</span>'
            + '<span class="pronunciation">' + (data.data.pron.length ? ' [' + data.data.pron + '] ' : '') + '</span></p>'
        html += '<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'

        html += '<div class="popover-content">'
            + '<p>' + data.data.definition.split('\n').join("<br/>") + '</p>'
            + '<p>' + data.data.en_definition.defn.split('\n').join("<br/>") + '</p>'
            + '<div class="add-btn"><a href="#" class="btn" id="shanbay-forget-btn">我忘了</a></div>'
            + '<p class="success hide">成功添加！</p>'
            + '<div class="add-btn"><a href="' + forgotUrl + '" target="_blank" class="btn" id="shanbay-check-btn">查看</a></div>'
            + '</div>';
    }

    html += '</div></div>';
    $('#shanbay_popover').remove();
    $('body').append(html);

    getSelectionOffset(function (left, top) {
        setPopoverPosition(left, top);
        var h =  $(window).scrollTop() + $(window).height();
        if ( h -200 < top && h >= top) {
          $(window).scrollTop(200+$(window).scrollTop());
        }
    });

    $('#shanbay-add-btn').click(function (e) {
        e.preventDefault();
        addNewWord(data.data.id);
    });

    $('#shanbay-forget-btn').click(function (e) {
        e.preventDefault();
        forgetWord(data.data.learning_id);
    });

    $('#shanbay_popover .speak.us').click(function (e) {
        e.preventDefault();
        var audio_url = 'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
        playAudio(audio_url);
    });

    $('#shanbay_popover .speak.uk').click(function (e) {
        e.preventDefault();
        var audio_url = 'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
        playAudio(audio_url);
    });

    $('html').click(function () {
        hidePopover();
    });
    $('body').on('click', '#shanbay_popover', function (e) {
        e.stopPropagation();
    });
}

function hidePopover() {
    $('#shanbay_popover').remove();
}

function getSelectionOffset(callback) {
    var left = window.innerWidth / 2;
    var top = window.innerHeight / 2;
    var selection = window.getSelection();
    if (0 < selection.rangeCount) {
        var range = window.getSelection().getRangeAt(0);
        var dummy = document.createElement('span');
        range.insertNode(dummy);
        var off = getOffset(dummy);
        dummy.remove();
        window.getSelection().addRange(range);
        console.log(off.left + ':' + off.top);
        callback(off.left, off.top);
    }
}

function getOffset(el) {
    el = el.getBoundingClientRect();
    var off = {
        left: (el.left + el.right) / 2 + window.scrollX - 50,
        top: el.bottom + window.scrollY + 5
    };

    if (el.bottom == el.top) {
        // 行首字母选择后会出现这种情况
        off.top += 20;
    }

    return off;
}

function setPopoverPosition(left, top) {
    $('#shanbay_popover').css({
        position: 'absolute',
        left: left,
        top: top
    });
}

function addNewWord(word_id) {
    chrome.runtime.sendMessage({method: "addWord", data: word_id});
}

function forgetWord(learning_id) {
    chrome.runtime.sendMessage({method: "forgetWord", data: learning_id});
}


function playAudio(audio_url) {
    chrome.runtime.sendMessage({method: "playAudio", data: {audio_url: audio_url}})
}
