/**
 * @user Joseph
 **/

noteString = '<a href="javascript:void(0)"  class="note-button sblink pull-right">加入笔记</a>'

function getCurrentTerm() {
    return $('#current-learning-word').text();
}

function ls(){
    chrome.extension.sendRequest({method: "getLocalStorage"}, function (response) {
        for (k in response.data)
            localStorage[k] = response.data[k];
    });
    return localStorage;
}

function addNoteButton(selector) {
    if ($(selector).siblings('a.note-button').length == 0) $(selector).before(noteString)
}

function addToNote(add,term) {
    var notes = $(add).siblings("div").text()
    var hint = '加入成功'
    var id = $('#learning-box').attr('data-id')
    var url = "http://www.shanbay.com/api/v1/bdc/note/";

    if (hint != $(add).text()&&$('#note-mine-box li').text().indexOf(notes)==-1&&(undefined==term||term==getCurrentTerm()))
        $.post(url, {learning_id: id, note: notes}, function (data) {
            if (data.status_code == 0)
                $(add).html(hint)
        });
}

$(document).on("DOMNodeInserted", '#learning_word',function () {
    console.log('handling definitions')
    var $definitions = $('#review-definitions');
    if ($definitions.find('div.endf').length > 0 && $('div.endf').text().trim() != "" && ls()['hide_cn'] == 'yes') {
        $definitions.find('div.endf').show()
        var cn_anchor = '<a href="javascript:void(0);" id="show_cn_df" onclick="$(this).siblings().show();" class="sblink pull-right">中文释义</a>'
        if ($definitions.find('div.cndf').hide().siblings('#show_cn_df').length == 0)
            $definitions.find('div.cndf').after(cn_anchor)
    }
}).on("DOMNodeInserted", '#roots .roots-due-wrapper',function () {
        console.log('handling roots')
        addNoteButton('#roots .due_msg')
        if ($("#roots .due_msg").hasClass("alert") && (undefined == ls()['hider'] || ls()['hider'].search("roots") == -1)) {
            if (ls()['etym'] == 'etym')
                getEthology();
        }
        if (undefined != ls()['hider']) {
            var ids = ls()['hider'].split(',')
            for (var i in ids) {
                $('#' + ids[i]).hide()
            }
        }
    }).on("DOMNodeInserted", '#affix .roots-due-wrapper',function () {
        console.log('handling affix')
        addNoteButton('#affix .due_msg')
        if ($("#affix .due_msg").hasClass("alert") && (undefined == ls()['hider'] || ls()['hider'].search("affix") == -1)) {
            findDerivatives();
        }
    }).on("DOMNodeInserted", '#note-mine-box',function () {

    }).on("mouseover", "a.etymology",function () {
        popupEtymology($(this));
        return;
    }).on("click", "a.note-button",function () {
        console.log(this)
        addToNote($(this))
    }).on('mouseup',function (e) {
        $('div.popover').hide()
    }).on('mouseup', 'div.popover', function (e) {
        return false;
    }).keyup(function (e) {
    console.log(String.fromCharCode(e.keyCode)+" pressed")
    switch (e.keyCode) {
        //退出浮框
        case 13:
        case 27:
            $('div.popover').remove();
            return;
        //the chinese definitions C
        case 67:
        case 99:
            $('div.cndf').toggle();
            return;
        //the English definitions G
        case 71:
        case 103:
            $('div.endf').toggle();
            return;
        //全屏W
        case 87:
        case 119:
            $('div.navbar').toggle();
            return;
        //例句E
        case 69:
        case 101:
            $('div#learning-examples-box').toggle();
            return;
        //notes N
        case 78:
        case 110:
            $('div#notes-box').toggle();
            return;
        //词根 R
        case 82:
        case 114:
            $('div#roots').toggle();
            return;
        //notes T
        case 84:
        case 116:
            $('div#roots a.note-button').click();
            $('div#affix a.note-button').click();
            return;
        //webster definition
        case 86:
        case 118:
            $('#review-definitions .endf').toggle();
            return;
        //衍生、同义F
        case 70:
        case 102:
            $('div#affix').toggle();
            return;
        //I to ignore
        case 73:
        case 74:
        case 75:
        case 76:
        case 79:
        case 85:
        case 105:
        case 106:
        case 107:
        case 108:
        case 117:
            var map={i:57,I:57,O:48,o:48,U:49,u:49,j:50,J:50,k:51,K:51,l:52,L:52}
            var key=String.fromCharCode(e.keyCode)

            var $choices = $('#choices li.answer');
            switch(key){
                case 'u':
                case 'U':
                    if(1<$choices.length)$choices[0].click();
                    else $('#review a.known').click();
                    return;
                case 'j':
                case 'J':
                    if(1<$choices.length)$choices[1].click();
                    else $('#review a.unknown').click();
                    return;
                case 'k':
                case 'K':if(4==$choices.length)$choices[2].click() ;return;
                case 'l':
                case 'L':if(4==$choices.length)$choices[3].click();return;
                case 'O':
                case 'o':$('#choices li.forget').click();return;
                case 'i':
                case 'I':$('#learning_word a.pass span').click();return;
            }
            return;
    }
    return;//using "return" other attached events will execute
}).on('keydown','input',function (event) {
    event.stopPropagation();
});

