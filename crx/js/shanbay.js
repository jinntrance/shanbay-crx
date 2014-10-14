function ls(){
    chrome.extension.sendRequest({method: "getLocalStorage"}, function (response) {
        for (k in response.data)
            localStorage[k] = response.data[k];
    });
    return localStorage;
}

$(function () {
    $(document).on('dblclick', function () {
        var text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/)
        console.info("selected "+text)
        if (undefined != text && null!=text&&0<text.length&&ls()["click2s"]!='no'){
            console.log("searching "+text)
            chrome.extension.sendMessage({
                method: 'lookup',
                action: 'lookup',
                data: text[0]
            },function(resp){
                console.log(resp.data)
            });
            popover({
                shanbay:{
                    loading:true,
                    msg:"查询中...."
                }
            })
        }
    });
});

/**
*@user https://chrome.google.com/webstore/detail/%E6%89%87%E8%B4%9D%E5%8A%A9%E6%89%8B/nmbcclhheehkbdepblmeclbahadcebhj/details
**/

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    console.log("received\n")
    console.log(message.data)
	switch(message.action) {
		case 'popover':
			popover(message.data);
			break;
	}
});

function popover(alldata) {
    var data=alldata.shanbay
    var webster=alldata.webster
    var defs=""
    if(ls()['webster_search']=='yes') defs=webster.defs
	console.log('popover');
	var html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';
    if(true == data.loading) { //loading notification
       html += '<p><span class="word">'+data.msg+'</span></p>';
    }else if(data.data==undefined||data.data.learning_id == undefined) {
        if(1==data.status_code) {// word not exist
        	if(undefined==webster||webster.term=="") {
            html += '未找到单词</h3></div>';
          }
        	else{
            html += '<p><span class="word">'+webster.term+'</span></p></h3>' +
              '<div class="popover-content"><p>'+webster.defs+"</p></div>";
          }
        } else {// word exist, but not recorded
        	html += '<p><span class="word">'+data.data.content+'</span>'
        		+'<small class="pronunciation">'+(data.data.pron.length ? ' ['+data.data.pron+'] ': '')+'</small></p>'
      			+'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
      			+'<div class="popover-content">'
            + getWordContent(data.data, defs)
      			+'</div>';
        }
    } else {// word recorded
      	html += '<p><span class="word">'+data.data.content+'</span>'
        		+'<span class="pronunciation">'+(data.data.pron.length ? ' ['+data.data.pron+'] ': '')+'</span></p>'
      			+'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
      			+'<div class="popover-content">'
      			+ getWordContent(data.data)
      			+'</div>';
    }

    html += '</div></div>'
    $('#shanbay_popover').remove()
	  $('body').append(html);

   	getSelectionOffset(function(left, top) {
		setPopoverPosition(left, top);
   	});

   	$('#shanbay-add-btn').click(function(e) {
   		e.preventDefault();
   		addNewWord(data.data.id);
   	});

    $('#shanbay-relearn-btn').click(function(e) {
      e.preventDefault();
      relearnWord(data.data.learning_id);
    });

   	$('#shanbay_popover .speak.us').click(function(e) {
   		e.preventDefault();
   		var audio_url = 'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
   		playAudio(audio_url);
   	});

   	$('#shanbay_popover .speak.uk').click(function(e) {
   		e.preventDefault();
   		var audio_url = 'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
   		playAudio(audio_url);
   	});

   	$('html').click(function() {
      hidePopover();
    });
    $('body').on('click', '#shanbay_popover', function (e) {
      e.stopPropagation();
    });
}

function getWordContent(data, defs) {
    var html = '<p>'+data.definition.split('\n').join("<br/>")+'</p>';

    var en_definitions = data.en_definitions;
    for (var i in en_definitions) {
      html += '<div class="definition-label">' + i + '</div>' ;
      html += '<ol>'
      for (var j = 0; j < en_definitions[i].length; j++) {
          html += '<li>' + en_definitions[i][j]+ "</li>";
      }
      html += "</ol>";
    }

    if(data.learning_id && data.learning_id != 0){
      html += '<div class="add-btn">'
        +'<a href="#" class="btn" id="shanbay-relearn-btn">我忘了</a>'
        +'<a href="http://www.shanbay.com/review/learning/'+ data.learning_id+'" target="_blank" class="btn" id="shanbay-check-btn">查看</a>'
        +'<p class="success hide">处理成功！</p>'
        +'</div>';
    }else{      
      html += '<p>'+defs+'</p>'
        +'<div class="add-btn">'
        +'<a href="#" class="btn" id="shanbay-add-btn">添加生词</a>'
        +'<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a>'         
        +'<p class="success hide">成功添加！</p>'
        +'</div>';
    }

    return html;
}

function hidePopover() {
	$('#shanbay_popover').remove();
}

function getSelectionOffset(callback) {
  var left = window.innerWidth/2;
  var top = window.innerHeight/2;
  var selection = window.getSelection();
  if(0<selection.rangeCount){
  	var range = window.getSelection().getRangeAt(0);
    var dummy = document.createElement('span');
    range.insertNode(dummy);
  	left = getLeft(dummy) - 50;
  	top = getTop(dummy) + 25;
  	dummy.remove();
    window.getSelection().addRange(range);
  }
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

function addNewWord(word_id) {
	chrome.extension.sendRequest({method: "addWord",data:word_id}, function (rsp) {
    switch(rsp.data.msg){
      case "success":
	      $('#shanbay-add-btn').addClass('hide');
	      $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
	      $('#shanbay-check-btn').attr('href', 'http://www.shanbay.com/review/learning/' + rsp.data.rsp.id);
            break;
      case "error":
        $('#shanbay_popover .success').text('添加失败，请重试。').removeClass().addClass('failed');
        break;
      default:
    }});
}

function relearnWord(learning_id) {
  chrome.extension.sendRequest({method: "relearnWord",data:learning_id}, function (rsp) {
    switch(rsp.data.msg){
      case "success":
        $('#shanbay-relearnWord-btn').addClass('hide');
        $('#shanbay_popover .success, #shanbay-check-btn').removeClass('hide');
        //$('#shanbay-check-btn').attr('href', 'http://www.shanbay.com/review/learning/' + learning_id);
            break;
      case "error":
        $('#shanbay_popover .success').text('处理失败，请重试。').removeClass().addClass('failed');
        break;
      default:
    }});
}


function playAudio(audio_url) {
	if(audio_url) {
		new Howl({
			urls: [audio_url]
		}).play();
	}
}
