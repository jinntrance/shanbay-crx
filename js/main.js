/**
 * 扇贝背单词页面所需的快捷键等
 * @user Joseph
 **/

noteString = '<a href="javascript:void(0)"  class="note-button sblink pull-right">加入笔记</a>';

/**
 * The template for box snippet
 */
var boxTemplate = [
    '<div id="{id}" class="row">',
    '        <div class="word span10">',
    '            <div class="row">',
    '                <div class="span1">',
    '                    <h6 class="pull-right">{title}</h6>',
    '                </div>',
    '                <div class="span9">',
    '                    <div class="well">',
    '                        {content}',
    '                    </div>',
    '                </div>',
    '            </div>',
    '        </div>',
    '    </div>'
].join("");

/**
 * Compile html string
 * @param id
 * @param title
 * @param content
 */
function compileBoxHtml(id,title,content) {
    let output = boxTemplate.replace("{content}",content);
    output = output.replace("{id}",id);
    output = output.replace("{title}",title);
    return output;
}

function formatString(origin) {
    if(origin === null || typeof origin === "undefined") {
        return "-";
    }else{
        return origin;
    }
}

/**
 * Inject the view for words changes and phrase
 * @param data
 */
function renderWordChangesAndPhrase(response) {
    if(response){
        if(ls()['exchanges'] == 'yes' && response.exchanges.length > 1){
            let exchanges = [
                "复数："+formatString(response.baesInfo.exchange.word_pl[0]),
                "过去式："+formatString(response.baesInfo.exchange.word_past[0]),
                "过去分词："+formatString(response.baesInfo.exchange.word_done[0]),
                "现在分词："+formatString(response.baesInfo.exchange.word_ing[0]),
                "第三人称单数："+formatString(response.baesInfo.exchange.word_third[0])
            ].map(function (exchange) {
                return "<p>"+exchange+"<p/>"
            }).join("");
            let $exchanges = compileBoxHtml("exchanges","单词变形",exchanges);

            // insert to dom
            $('#learning_word').after($exchanges);
        }

        if(ls()['phrases'] == 'yes' && response.netmean.RelatedPhrase.length > 0){
            let phrase = response.netmean.RelatedPhrase.map(function (one) {
                return "<p>"+ one.word + " " + one.list.map(function (subOne) {
                        return subOne.exp + " "
                    }) +"</p>"
            }).join("");
            let $phrase = compileBoxHtml("phrase","常用短语",phrase);
            $('#learning_word').after($phrase);
        }
    }
}

chr = chrome;

function getCurrentTerm() {
    return $('#current-learning-word').text();
}
/**
 * “加入笔记”的按钮添加
 * @param selector
 */
function addNoteButton(selector) {
    let button = $(selector).siblings('a.note-button');
    if (button.length == 0 && !$(selector).hasClass("alert")) {
        $(selector).before(noteString);
    }
}

/**
 * 添加成个人笔记
 * @param add
 * @param term
 */
function addToNote(add, term) {
    let sib = $(add).siblings("div");
    let notes = sib.text().trim();
    if (sib.has('#affix_word_tree_container').length > 0) notes = sib.find('#affix_word_tree_container').text().trim();
    let hint = '加入成功';
    let id = $('#learning-box').attr('data-id');
    let url = "http://www.shanbay.com/api/v1/bdc/note/";
    let note_sim = 0;
    // 查看个人笔记中与新笔记的相似度
    $('#note-mine-box li').each(function () {
        let sim = n_gram_similarity(4, notes, $(this).text());
        if(sim>note_sim){
            note_sim = sim;
        }
    });

    if(note_sim>0) {
        debugLog('info', "similarity between the new and old note is: " + note_sim);
    }

    if ( $(add).parent().find('.alert').length == 0 &&
        hint != $(add).text() &&
        (undefined == term || term == getCurrentTerm())) {
        if(note_sim<=0.3) {
             // TODO 修改笔记相似度
            $('textarea[name=note]').val(notes);
            $('input[type=submit]').click();
        }else{
            hint = '已添加过'
        }
        $(add).html(hint);

    }
}

function wrapper(title) {
    return $('<div><div class="span1" ><h6 class="pull-right">' + title + ' </h6></div> <div class="roots-wrapper span9"><div class="alert">"扇贝助手"努力查询中.....<br/>请确保能访问<a target="_blank" href="http://www.etymonline.com/">词源</a>和<a target="_blank" href="http://www.dictionaryapi.com/">派生、音节划分</a>及<a target="_blank" href="http://josephjctang.com/shanbay-crx/#webster-app-key-注册"> 申请Webster Key</a>并在扇贝插件<a target="_blank" href="javascript:void(0);" id="settings">设置</a>中并打开Webster功能</div></div></div>').html()
}

function addButtons() {
    if ($('#roots .well').length == 0)
        $('#roots').html(wrapper('词根'));
    if ($('#affix .word,#affix .well').length == 0)
        $('#affix').html(wrapper('派生'))
}

function replaceButtons() {
    if ($('#roots .exist').length == 0)
        $('#roots').html(wrapper('词根'));
    if ($('#affix .exist').length == 0)
        $('#affix').html(wrapper('派生'));
    searchOnline()
}

function searchOnline() {
    if ($('#roots .exist').length == 0 && (undefined == ls()['hider'] || ls()['hider'].search("roots") == -1)) {
        if (ls()['etym'] != 'webster')
            getEtymology();
    }
    if (ls()['dict'] && ls()['dict'] != 'no' && $('#affix .exist').length == 0 && (undefined == ls()['hider'] || ls()['hider'].search("affix") == -1)) {
        findDerivativesInContentPage();
    }
}
$(document).on("DOMNodeInserted", '#learning-box', function () {
//    debugLog('log', 'handling definitions')
    let $definitions = $('#review-definitions');
    let cn_anchor = '<a href="javascript:void(0);" id="show_cn_df" onclick="$(this).siblings(\'div.cndf\').toggle();" class="sblink pull-right">中文释义</a>';
    if ($definitions.find('div.cndf').siblings('#show_cn_df').length == 0)
        $definitions.find('div.cndf').after(cn_anchor);
    if ($definitions.find('div.endf').length > 0 && $('div.endf').text().trim() != "" && ls()['hide_cn'] == 'yes') {
        $definitions.find('div.endf').show();
        $definitions.find('div.cndf').hide();
    }

    let name={
        affix: '派生',
        roots:'词根'
    };
    $('#affix, #roots').each(function (e) {
            if ("" == $(this).html().trim()) {
                let label = name[$(this).attr('id')];
                if(label) {
                    //TODO
                    //$(this).html('<div class="span1"><h6 class="pull-right">' + label + '</h6></div><div class="roots-wrapper span9">' +
                    //noteString + '<div class="alert"></div></div>');
                    //debugLog('log', "roots/affix body inserted");
                }
            }
        }
    )
}).on("DOMNodeInserted", '#learning_word a#show_cn_df', function () {
    // TODO 改变在线搜索的触发条件
    if($('#learning_word .word h1.content').length>0) {
        debugLog('log', 'retrieving English definitions');

        searchOnline();

        /**
         * phrases and exchanges need to fetch data from iciba API
         */
        if(ls()['phrases'] == 'yes' || ls()['exchanges'] == 'yes'){
            getFromIciba(
                getCurrentTerm(),
                renderWordChangesAndPhrase
            );
        }
    }
    if (undefined != ls()['hider']) {
        let ids = ls()['hider'].split(',');
        for (let i in ids) {
            if (ids[i]) {
                $('#' + ids[i]).hide()
            }
        }
    }

}).on("DOMNodeInserted", '#roots .roots-wrapper,#roots .roots-due-wrapper', function (e) {
    debugLog('log', '#roots triggered');
    addNoteButton('#roots .alert,#roots .well')
}).on("DOMNodeInserted", '#roots a.note-button', function (e) {
    debugLog('log', 'retrieving roots data');
    if ($("#roots .well").length > 0 && ls()['root2note'] == 'yes') addToNote("#roots a.note-button");
}).on("DOMNodeInserted", '#affix .roots-wrapper,#affix .roots-due-wrapper,#affix .word', function (e) {
    debugLog('log', '#affix triggered');
    addNoteButton('#affix .alert,#affix .well')
}).on("DOMNodeInserted", '#affix a.note-button', function (e) {
    debugLog('log', 'retrieving affix data');
    if ($('#affix .well').length > 0 && ls()['afx2note'] == 'yes')    addToNote('#affix a.note-button');
}).on("mouseover", "a.etymology", function (e) {
    popupEtymology($(this));
    return;
}).on("click", "a.note-button", function (e) {
    debugLog('log', 'clicking a note-button');
    addToNote($(this))
}).on("click", "a#settings", function (e) {
    chrome.runtime.sendMessage({method: "openSettings", anchor: "webster_set"});
}).on('mouseup', function (e) {
    if ($(this).parents('div.popover-crx').length == 0)
        $('div.popover-crx').remove()
}).on('mouseup', 'div.popover-crx', function (e) {
    return false;
}).keyup(function (e) {
    //keydown/keyup组合不区分英文字母大小写，检测他们的keycode属性时，都为大写码。
    //keypress区分大小写。
    debugLog('log', String.fromCharCode(e.keyCode) + " pressed");
    switch (String.fromCharCode(e.keyCode)) {
        //退出浮框，esc return 等
        case "\x0D":
        case "\x1B":
            $('div.popover-crx').remove();
            return;
        //the chinese definitions C
        case 'C':
            $('div.cndf').toggle();
            return;
        //the English definitions G
        case 'G':
            $('div.endf').toggle();
            return;
        //全屏W
        case 'W':
            $('div.navbar').toggle();
            return;
        //例句M
        case 'M':
            $('div#learning-examples-box').toggle();
            return;
        //notes N
        case 'N':
            $('div#notes-box').toggle();
            return;
        // Q
        case 'Q':
            if (e.ctrlKey)
                replaceButtons();
            return;
        //词根 E
        case 'E':
            $('div#roots').toggle();
            return;
        //notes T
        case 'T':
            $('a.note-button').each(function (e) {
                addToNote($(this));
            });
            return;
        //webster definition V
        case 'V':
            $('#review-definitions .endf').toggle();
            return;
        //A
        case 'A':
            $('.learning-speaker .us').click();
            return;
        //B
        case 'B':
            $('.learning-speaker .uk').click();
            return;
        //衍生、同义X
        case 'X':
            $('div#affix').toggle();
            return;
        //Y 打开用户共享    
        case 'Y':
            if (0 < $('a.note-user-box-tab').length)
                $('a.note-user-box-tab')[0].click();
            return true;
        //Z 作笔记 码字
        case 'Z':
            if (0 < $('a[href="#note-create"]').length)
                $('a[href="#note-create"]')[0].click();
            return true;
        //I to ignore
        case 'I':
        case 'O':
        case 'U':
        case 'J':
        case 'K':
        case 'L':
            let key = String.fromCharCode(e.keyCode);

            let $choices = $('#choices li.answer');
            switch (key) {
                case 'U':
                    if (0 == $choices.length) {
                        if ($('#review a.known').length > 0) {
                            $('#review a.known')[0].click();
                        }
                    }
                    else $choices[0].click();
                    return;
                case 'J':
                    if (1 < $choices.length)$choices[1].click();
                    else {
                        if ($('#review a.unknown').length > 0) $('#review a.unknown')[0].click();
                        if ($('a.btn-forget').length > 0)$('a.btn-forget')[0].click();
                    }
                    return;
                case 'K':
                    if (4 == $choices.length)$choices[2].click();
                    return;
                case 'L':
                    if (4 == $choices.length)$choices[3].click();
                    return;
                case 'O':
                    $('#choices li.forget').click();
                    return;
                case 'I':
                    $('#learning_word a.pass span').click();
                    return;
            }
            return;
    }
    return;//using "return" other attached events will execute
}).on('keyup', 'input,textarea', function (event) {
    if (event.altKey && ('B' == String.fromCharCode(event.which))) {
        debugLog('log', "reading British English");
        $('.learning-speaker .uk').click()
    }
    else if (event.altKey && ('A' == String.fromCharCode(event.which))) {
        debugLog('log', "reading American English");
        $('.learning-speaker .us').click()
    }

    event.stopPropagation();
});


function getFromIciba(word, callback)
{
    $.ajax({
        url:"https://www.iciba.com/index.php",
        data:{
            a:"getWordMean",
            c:"search",
            list:"1,3,4,8,9,12,13,15",
            word:word,
            _:Math.random()
        },
        success:callback
    })
}
