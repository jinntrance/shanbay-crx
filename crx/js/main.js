/**
 * @user Joseph
 **/

noteString='<a href="javascript:void(0)" id="note-button" class="note-button sblink pull-right">加入笔记</a>'

chrome.extension.sendRequest({method: "getLocalStorage"}, function(response) {
    for(k in response.data)
        localStorage[k]=response.data[k];
});

function addNoteButton(selector){
    if($(selector).siblings('a.note-button').length==0) $(selector).before(noteString)
}

function addToNote(add){
  var notes=$(add).siblings("div").text()
  var hint='加入成功'
  var id=$('#learning-box').attr('data-id')
  var url="http://www.shanbay.com/api/v1/bdc/note/";
  if(hint!=$(add).text())
    $.post(url,{learning_id:id,note:notes},function(data){
        if(data.status_code==0)
         $(add).html(hint)  
      });
}

$(document).on("DOMNodeInserted", '#learning_word',function () {

        var $definitions = $('#review-definitions');
        if($definitions.find('div.endf').length>0 &&localStorage['hide_cn']=='yes'){
           $definitions.find('div.endf').show()
           var cn_anchor='<a href="javascript:void(0);" id="show_cn_df" onclick="$(this).siblings().show();" class="sblink pull-right">中文释义</a>'
           if($definitions.find('div.cndf').hide().siblings('#show_cn_df').length==0)
               $definitions.find('div.cndf').after(cn_anchor)

       }

    }
).on("DOMNodeInserted", '#roots .roots-due-wrapper',function () {
    if ($("#roots .due_msg").hasClass("alert")&&localStorage['hider'].search("roots")==-1) {
        if(localStorage['etym']=='etym')
            getEthology();
        addNoteButton('#roots .due_msg')
    }
    var ids=localStorage['hider'].split(',')
    for(var i in ids){
        $('#'+ids[i]).hide()
    }

}).on("DOMNodeInserted", '#affix .roots-due-wrapper',function () {
        if ($("#affix .due_msg").hasClass("alert")&&localStorage['hider'].search("affix")==-1) {
            findDerivatives();
        }
    }).on("DOMNodeInserted", '#note-mine-box',function () {

    }).on("mouseover", "a.etymology", function () {
        popupEtymology($(this));
        return;
    }).on("click", "a.note-button", function () {
        addToNote($(this))
    }).on('mouseup',function(e) {
        $('div.popover').hide()
    }).on('mouseup','div.popover',function(e) {
     return false;
    });

$(window).keydown(function (e) {
    switch (e.keyCode) {
	//退出浮框
        case 13:
        case 27:
        case 67:
        case 99:
            $('div.popover').remove();
            return ;
	//全屏
        case 70:
        case 102:
            $('div.navbar').toggle();
            return ;
	//例句
        case 69:
        case 101:
            $('div#learning-examples-box').toggle();
            return ;
	//例句
        case 78:
        case 110:
            $('div#notes-box').toggle();
            return ;
	//词根
        case 82:
        case 114:
            $('div#roots').toggle();
            return ;
    //notes
        case 84:
        case 116:
            $('div#roots a.note-button').click();
            return ;
	//衍生、同义
        case 88:
        case 120:
            $('div#affix').toggle();
            return ;
    }
    return;//using "return" other attached events will execute
});

$('input').keydown(function(event) {
  event.stopPropagation();
});

