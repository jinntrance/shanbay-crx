/**
 * @user Joseph
 **/

noteString = '<a href="javascript:void(0)"  class="note-button sblink pull-right">加入笔记</a>'

function getCurrentTerm() {
    return $('#current-learning-word').text();
}

function addNoteButton(selector) {
    if ($(selector).siblings('a.note-button').length == 0) $(selector).before(noteString)
}

function addToNote(add,term) {
    var sib=$(add).siblings("div")
    var notes =sib.text().trim()
    if(sib.has('#affix_word_tree_container').length>0) notes=sib.find('#affix_word_tree_container').text().trim()
    var hint = '加入成功'
    var id = $('#learning-box').attr('data-id')
    var url = "http://www.shanbay.com/api/v1/bdc/note/";

    if (hint != $(add).text()&&$('#note-mine-box li').text().indexOf(notes)==-1&&(undefined==term||term==getCurrentTerm()))
        $.post(url, {learning_id: id, note: notes}, function (data) {
            if (data.status_code == 0)
                $(add).html(hint)
        });
}

function wrapper(title){
    return $('<div><div class="span1"><h6 class="pull-right">'+title+' </h6></div> <div class="roots-wrapper span9"><div class="alert">"扇贝助手"努力查询中.....请确保能访问<a target="_blank" href="http://www.etymonline.com/">词源</a>和<a target="_blank" href="http://www.dictionaryapi.com/">派生、音节划分</a></div></div></div>').html()
}

function addButtons(){
    if($('#roots .well').length==0)
        $('#roots').html(wrapper('词根'))
    if($('#affix .word,#affix .well').length==0)
        $('#affix').html(wrapper('派生'))
}

function replaceButtons(){
    if($('#roots .exist').length==0)
        $('#roots').html(wrapper('词根'))
    if($('#affix .exist').length==0)
        $('#affix').html(wrapper('派生'))
    searchOnline()
}

function searchOnline() {
    if ($('#roots .exist').length==0&&(undefined == ls()['hider'] || ls()['hider'].search("roots") == -1)) {
        if (ls()['etym'] != 'webster')
            getEthology();
    }
    if ($('#affix .exist').length==0&&(undefined == ls()['hider'] || ls()['hider'].search("affix") == -1)) {
        findDerivatives();
    }
}
$(document).on("DOMNodeInserted", '#learning-box',function () {
//    console.log('handling definitions')
    var $definitions = $('#review-definitions');
    var cn_anchor = '<a href="javascript:void(0);" id="show_cn_df" onclick="$(this).siblings(\'div.cndf\').toggle();" class="sblink pull-right">中文释义</a>'
    if ($definitions.find('div.cndf').siblings('#show_cn_df').length == 0)
        $definitions.find('div.cndf').after(cn_anchor)
    if ($definitions.find('div.endf').length > 0 && $('div.endf').text().trim() != "" && ls()['hide_cn'] == 'yes') {
        $definitions.find('div.endf').show()
    }
}).on("DOMNodeInserted", '#learning_word a#show_cn_df',function () {
    console.log('retrieving English definitions')
    searchOnline();
    if (undefined != ls()['hider']) {
        var ids = ls()['hider'].split(',')
        for (var i in ids) {
            $('#' + ids[i]).hide()
        }
    }
}).on("DOMNodeInserted", '#roots .roots-wrapper,#roots .roots-due-wrapper',function (e) {
        console.log('#roots triggered')
        addNoteButton('#roots .alert,#roots .well')
    }).on("DOMNodeInserted", '#roots a.note-button',function (e) {
        console.log('retrieving roots data')
        if ($("#roots .well").length>0 && ls()['root2note'] == 'yes') addToNote("#roots a.note-button");
    }).on("DOMNodeInserted", '#affix .roots-wrapper,#affix .roots-due-wrapper,#affix .word',function (e) {
        console.log('#affix triggered')
        addNoteButton('#affix .alert,#affix .well')
    }).on("DOMNodeInserted", '#affix a.note-button',function (e) {
        console.log('retrieving affix data')
        if($('#affix .well').length>0&&  ls()['afx2note'] == 'yes')    addToNote('#affix a.note-button');
    }).on("DOMNodeInserted", '#note-mine-box',function () {

    }).on("mouseover", "a.etymology",function (e) {
        popupEtymology($(this));
        return;
    }).on("click", "a.note-button",function (e) {
        console.log('clicking a note-button')
        addToNote($(this))
    }).on('mouseup',function (e) {
        if($(this).parents('div.popover-crx').length==0)
            $('div.popover-crx').remove()
    }).on('mouseup', 'div.popover-crx', function (e) {
        return false;
    }).keyup(function (e) {
    console.log(String.fromCharCode(e.keyCode)+" pressed")
    switch (e.keyCode) {
        //退出浮框
        case 13:
        case 27:
            $('div.popover-crx').remove();
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
        //例句M
        case 77:
        case 109:
            $('div#learning-examples-box').toggle();
            return;
        //notes N
        case 78:
        case 110:
            $('div#notes-box').toggle();
            return;
        // Q
        case 81:
        case 113:
            if(e.ctrlKey)
                replaceButtons()
            return;
        //词根 E
        case 69:
        case 101:
            $('div#roots').toggle();
            return;
        //notes T
        case 84:
        case 116:
            $('a.note-button').each(function(e){
                addToNote($(this));
            });
            return;
        //webster definition V
        case 86:
        case 118:
            $('#review-definitions .endf').toggle();
            return;
        //衍生、同义X
        case 88:
        case 120:
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
                    if(0== $choices.length) $('#review a.known')[0].click()
                    else $choices[0].click();
                    return;
                case 'j':
                case 'J':
                    if(1<$choices.length)$choices[1].click();
                    else $('#review a.unknown')[0
                        ].click();
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
}).on('keyup','input,textarea',function (event) {
    event.stopPropagation();
});

