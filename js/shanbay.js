/**
 * 任意网页扇贝查词
 *
 */

let parentBody = null;

function searchingSelectedText (e) {
    let text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/);
    debugLog('info', 'selected ' + text);
    let pos = {
        left: event.clientX + window.pageXOffset,
        top: event.clientY + window.pageYOffset
    };
  if (text && localStorage['click2s'] !== 'no') {
      debugLog('log', 'searching ' + text);
      chrome.runtime.sendMessage({
                                     method: 'lookup',
                                     data: text[0],
                                     position: pos
                                 });
      if (e.target.localName === 'body') {
          parentBody = $(e.target)
      } else {
          parentBody = $(e.target).parents('body')
      }
        popover({
            shanbay: {
                loading: true,
                msg: '查询中....（请确保已登录扇贝网）'
            },
            position: pos
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
    debugLog('log', 'received\n');
    switch (message.callback) {
        case 'popover':
            popover(message.data);
            break;
        case 'forgetWord':
            switch (message.data.msg) {
                case 'success':
                    $('#shanbay-forget-btn').addClass('hide');
                    $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
                    break;
                case 'error':
                    $('#shanbay_popover .success').text('添加失败，请重试。').removeClass()
                        .addClass('failed');
                    break;
                default:
            }
            break;
        case 'addWord':
            switch (message.data.msg) {
                case 'success':
                    $('#shanbay-add-btn').addClass('hide');
                    $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
                    $('#shanbay-check-btn').attr('href', 'http://www.shanbay.com/review/learning/'
                                                         + message.data.rsp.id);
                    break;
                case 'error':
                    $('#shanbay_popover .success').text('添加失败，请重试。').removeClass()
                        .addClass('failed');
                    break;
                default:
            }
            break
    }
});

function popover(alldata) {
    if(!alldata.position || !alldata.position.left) {
        // 无选中位置，则是打开的 PDF 等类型文件
        parentBody = $('body');
    }
  if (!parentBody || 1 != parentBody.length) return;
  let data = alldata.shanbay;
  let webster = alldata.webster;
  let defs = '';
  if (ls()['webster_search'] === 'yes') defs = webster.defs;
  debugLog('log', 'popover');
  let html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';
  html += '<div class="close-btn"><a href="#" class="btn" id="shanbay-close-btn">关闭</a></div>';
  if (data.loading) {
    //loading notification
    html += '<p><span class="word">' + data.msg + '</span></p>'
  } else if (!data.data || !data.data.learning_id) {
    if (1 === data.status_code) {
      // word not exist
      if (!webster || !webster.term) html += '未找到单词</h3></div>';
            else html += '<p><span class="word">' + webster.term + '</span></p></h3>' +
        '<div class="popover-content"><p>' + webster.defs + '</p></div>'
        } else {// word exist, but not recorded
            html += '<p><span class="word">' + data.data.content + '</span>'
                + '<small class="pronunciation">' + (data.data.pron.length ? ' [' + data.data.pron + '] ' : '') + '</small></p>';
            html += '<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>';

            html += '<div class="popover-content">'
        + '<p>' + data.data.definition.split('\n').join('<br/>') + '<br/>' + defs + '</p>'
                + '<div class="add-btn"><a href="#" class="btn" id="shanbay-add-btn">添加生词</a>'
                + '<p class="success hide">成功加入生词库！</p>'
                + '<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a></div>'
        + '</div>'
        }
    } else {// word recorded
    let forgotUrl = 'http://www.shanbay.com/review/learning/' + data.data.learning_id;
        html += '<p><span class="word">' + data.data.content + '</span>'
            + '<span class="pronunciation">' + (data.data.pron.length ? ' [' + data.data.pron + '] ' : '') + '</span></p>';
        html += '<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>';

        html += '<div class="popover-content">'
      + '<p>' + data.data.definition.split('\n').join('<br/>') + '</p>'
      + '<p>' + data.data.en_definition.defn.split('\n').join('<br/>') + '</p>'
            + '<div class="add-btn"><a href="#" class="btn" id="shanbay-forget-btn">我忘了</a></div>'
            + '<p class="success hide">成功加入生词库！</p>'
            + '<div class="add-btn"><a href="' + forgotUrl + '" target="_blank" class="btn" id="shanbay-check-btn">查看</a></div>'
      + '</div>'
    }

  html += '</div></div>';
  $('#shanbay_popover').remove();
  parentBody.append(html);

    getSelectionOffset(alldata.position, function (left, top) {
    setPopoverPosition(left, top);
    let h = $(window).scrollTop() + $(window).height();
        if ( h -200 < top && h >= top) {
      $(window).scrollTop(200 + $(window).scrollTop())
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
        let audio_url = 'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
        playAudio(audio_url);
    });

    $('#shanbay_popover .speak.uk').click(function (e) {
        e.preventDefault();
        let audio_url = 'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
        playAudio(audio_url);
    });

    $('#shanbay_popover #shanbay-close-btn').click(function(e){
        hidePopover();
        e.preventDefault();
        return false;
    });
    $('html').click(function () {
    hidePopover()
  });
  parentBody.on('click', '#shanbay_popover', function (e) {
    e.stopPropagation()
  });

    // 自动加词、忘词、发音
    ls(function () {
        if (localStorage['pronounce_word']) {
            $('#shanbay_popover').find('.speak.' + localStorage['pronounce_word']).click();
        }

        if (localStorage['forget_word'] != 'no') {
            $('#shanbay-add-btn').click();
            $('#shanbay-forget-btn').click();
        }

        // 设置 popup 自动关闭时间
        let waitSeconds = 30;
        if (localStorage['close_wait'] > 0) {
            waitSeconds = localStorage['close_wait'];
        }
        setTimeout(function () {
            hidePopover();
        }, waitSeconds * 1000);
    });

}

function hidePopover() {
    $('#shanbay_popover').remove();
}

function getSelectionOffset(position, callback) {
    let off = {
        left: window.innerWidth * 8 / 10,
        top: window.innerHeight / 10
    };

    let selection = window.getSelection();
    if (0 < selection.rangeCount) {
        let range = window.getSelection().getRangeAt(0);
        let dummy = document.createElement('span');
        range.insertNode(dummy);
        off = getOffset(dummy);
        dummy.remove();
        window.getSelection().addRange(range);
        debugLog('log', off.left + ':' + off.top);
    }

    if(position && position.left && position.top){
        off = {
            left: position.left -  50,
            top: position.top + 10
        };
    }

    callback(off.left, off.top);
}

function getOffset(el) {
    el = el.getBoundingClientRect();
    let off = {
        left: (el.left + el.right) / 2 + window.scrollX - 50,
        top: el.bottom + window.scrollY + 5
    };

    if (el.bottom == el.top) {
        // 行首字母选择后会出现这种情况
        off.top += 30;
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
