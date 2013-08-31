function ls(){
    chrome.extension.sendRequest({method: "getLocalStorage"}, function (response) {
        for (k in response.data)
            localStorage[k] = response.data[k];
    });
    return localStorage;
}

$(function () {
    $(document).on('dblclick', function () {
        var text = window.getSelection().toString().match(/^[a-zA-Z\s']+$/)
        if (undefined != text && null!=text&&0<text.length&&ls()["click2s"]!='no'){
            console.log("searching "+text)
            chrome.extension.sendMessage({
                method: 'lookup',
                action: 'lookup',
                data: text[0]
            },function(resp){
                console.log(resp.data)
            });
        }
    });
});

/**
*@user https://chrome.google.com/webstore/detail/%E6%89%87%E8%B4%9D%E5%8A%A9%E6%89%8B/nmbcclhheehkbdepblmeclbahadcebhj/details
**/

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("received\n"+message.data)
	switch(message.action) {
		case 'popover':
			popover(message.data);
			break;
	}
});

function popover(data) {
	console.log('popover');
	var html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';

    if(data.learning_id == 0) {
      if(data.voc == "") {// word not exist
      	html += '未找到单词</h3></div>';
      } else {// word exist, but not recorded
      	html += '<p><span class="word">'+data.voc.content+'</span>'
      		+'<small class="pronunciation">'+(data.voc.pron.length ? ' ['+data.voc.pron+'] ': '')+'</small></p>'
			+'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
			+'<div class="popover-content">'
			+'<p>'+data.voc.definition.split('\n').join("<br/>")+'</p>'
			+'<div class="add-btn"><a href="#" class="btn" id="shanbay-add-btn">添加到生词库</a>'
			+'<p class="success hide">成功添加到生词库！</p>'
			+'<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a></div>'
			+'</div>';
      }
    } else {// word recorded
    	html += '<p><span class="word">'+data.voc.content+'</span>'
      		+'<span class="pronunciation">'+(data.voc.pron.length ? ' ['+data.voc.pron+'] ': '')+'</span></p>'
			+'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
			+'<div class="popover-content">'
			+'<p>'+data.voc.definition.split('\n').join("<br/>")+'</p>'
			+'</div>';
    }

    html += '</div></div>'

	$('body').append(html);

   	getSelectionOffset(function(left, top) {
		setPopoverPosition(left, top);
   	});

   	$('#shanbay-add-btn').click(function(e) {
   		e.preventDefault();
   		addNewWord(data.voc.content);
   	});

   	$('#shanbay_popover .speak.us').click(function(e) {
   		e.preventDefault();
   		var audio_url = 'http://media.shanbay.com/audio/us/' + data.voc.content + '.mp3';
   		playAudio(audio_url);
   	});

   	$('#shanbay_popover .speak.uk').click(function(e) {
   		e.preventDefault();
   		var audio_url = 'http://media.shanbay.com/audio/uk/' + data.voc.content + '.mp3';
   		playAudio(audio_url);
   	});

   	$('html').click(function() {
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
	var range = window.getSelection().getRangeAt(0);
   	var dummy = document.createElement('span');
   	range.insertNode(dummy);
	var left = getLeft(dummy) - 50;
	var top = getTop(dummy) + 25;
	dummy.remove();
    window.getSelection().addRange(range);
	console.log(left + ':' + top);
	callback(left, top);
}
function getTop(e){ 
	var offset=e.offsetTop; 
	if(e.offsetParent!=null) offset+=getTop(e.offsetParent); 
	return offset;
} 

function getLeft(e){ 
	var offset=e.offsetLeft; 
	if(e.offsetParent!=null) offset+=getLeft(e.offsetParent); 
	return offset;
}

function setPopoverPosition(left, top) {
	$('#shanbay_popover').css({
		position: 'absolute',
		left: left,
		top: top
	});
}

function addNewWord(word) {
	$.ajax({
		url: 'http://www.shanbay.com/api/learning/add/' + word,
		type: 'GET',
	    dataType: 'JSON',
	    contentType: "application/json; charset=utf-8",
	    success: function(data) {
	      console.log('success');
	      $('#shanbay-add-btn').addClass('hide');
	      $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
	      $('#shanbay-check-btn').attr('href', 'http://www.shanbay.com/learning/' + data.id);
	    },
	    error: function() {
	      console.log('error');
	      $('#shanbay_popover .success').text('添加失败，请重试。').removeClass().addClass('failed');
	    },
	    complete: function() {
	      console.log('complete');
	    }
	});
}


function playAudio(audio_url) {
	if(audio_url) {
		new Howl({
			urls: [audio_url]
		}).play();
	}
}
