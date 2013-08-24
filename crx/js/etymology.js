/**
 * @author Joseph
 */

var etho_pre_url = 'http://www.etymonline.com/index.php?term='
var etym_url='http://www.etymonline.com/'
var originAnchor=undefined

function parseEtymology(pre_url, text) {
    var data = $($.parseHTML(text)).find('#dictionary dl');
    data.find('a').addClass('etymology').attr('target','_blank').replaceWith(function (i,e) {
        //var anchor = '<a target="_blank" class="etymology" href="' + pre_url + $(this).text() + '">' + $(this).text() + '</a>'
	    return $(this).attr('href', etym_url+$(this).attr('href'));
    });
    data.find('dt a').removeClass('etymology');
    data.find('dt a.dictionary').remove();
    return data.html()
}

function getEthology() {
    var pre_url=etho_pre_url
    originAnchor=undefined
    var term = $('#current-learning-word').text()
    var url = pre_url + term
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && $('#current-learning-word').text() == term) {
            var roots = parseEtymology(pre_url, xhr.responseText);
            if (undefined != roots && roots.trim() != "")
                $("#roots .due_msg").addClass("well").removeClass("alert").html($(roots))
            else  $("#roots").hide();
            if(!$("#roots .due_msg").hasClass("alert")&&localStorage['root2note']=='yes') addToNote("#roots a.note-button");
        }
    }
    xhr.send();
}

function popup(anchor,term,text) {
            $('.popover').remove();
            $('body').append('<div class="popover fade bottom in" style=" display: none;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><span class="word"></span></h3>'+noteString+'<div class="popover-content"></div></div></div>')
            $('.popover-title').html('<span class="word">' + term + '</span>')
            $('.popover-content').html('<p>' + text + '</p>')
            var offset = $(anchor).offset();
            if(undefined!=offset) $('.popover').show().offset({top: offset.top + 23, left: offset.left - 130})  ;
      if(localStorage['root2note']=='yes') addToNote(".popover a.note-button");
}

function popupEtymology( anchor) {
    var pre_url=etho_pre_url
    if (undefined == originAnchor|| $(anchor).parents("#roots").length>0) originAnchor = $(anchor);
    //var url = pre_url + $(anchor).text()
    var url = $(anchor).attr('href')
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var roots = parseEtymology(pre_url, xhr.responseText);
	    popup(originAnchor,$(anchor).text(),roots)
        }
    }
    xhr.send();
}



