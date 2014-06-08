/**
 * @author Joseph
 */


$(function() {
    check_in();
    setTimeout(function(){
      check_in();
    },3*60*60*1000);//每3h提醒一次


    chrome.contextMenus.removeAll(function() {
        chrome.contextMenus.create({
            "title": '在扇贝网中查找"%s"',
            "contexts":["selection"],
            "onclick": function(info, tab) {
                isUserSignedOn(function() {
                    getClickHandler(info.selectionText, tab);
                });
            }
        });
    });
});


function check_in(){
    var check_in="http://www.shanbay.com/api/v1/checkin/";
    $.getJSON(check_in,function(json){
        var arry=json.data.tasks.map(function(task){
            return task.meta.num_left;
        });
        var m=max(arry);
        localStorage['checkin']=m;
        if(0==m){
            chrome.browserAction.setBadgeText({text: ''});
        }
        else if(m>0) {
            chrome.browserAction.setBadgeText({text: m+''});
            var notification = webkitNotifications.createNotification("icon_48.png", "背单词读文章练句子", "少壮不努力，老大背单词！");
            notification.addEventListener('click', function () {
                notification.cancel();
                chrome.tabs.create({
                    url:"http://www.shanbay.com/"
                })
            });
            notification.show();
        }
    });
}

function max(array){
    if( undefined==array|| array.length==0) return 0;
    var max=array[0];
    array.forEach(function(e){
        if(e>max) max=e;
    });
    return max;
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log("received method: "+request.method)
    switch(request.method){
        case "getLocalStorage":
            sendResponse({data: localStorage});
            break;
        case "setLocalStorage":
            window.localStorage=request.data;
            sendResponse({data: localStorage});
            break;
        case 'lookup':
            isUserSignedOn(function() {
                getClickHandler(request.data, sender.tab);
            });
            sendResponse({data:{tabid:sender.tab.id}})
            break;
        case 'openSettings':
            chrome.tabs.create({url: chrome.runtime.getURL("options.html")+'#'+request.anchor});
            sendResponse({data:{tabid:sender.tab.id}})
            break;
        default :
            sendResponse({data:[]}); // snub them.
    }
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
    var tabid = sender.tab.id;
    console.log("received "+message.data)
    switch(message.action) {
        case 'is_user_signed_on':
            isUserSignedOn();
            break;
        case 'lookup':
            isUserSignedOn(function() {
                getClickHandler(message.data, sender.tab);
            });
            break;
    }
});

function normalize(word){
    return word.replace(/·/g,'');
}



/**
*@user https://chrome.google.com/webstore/detail/%E6%89%87%E8%B4%9D%E5%8A%A9%E6%89%8B/nmbcclhheehkbdepblmeclbahadcebhj/details
**/


var getLocaleMessage = chrome.i18n.getMessage;
var API = 'http://www.shanbay.com/api/word/';


function isUserSignedOn(callback) {
    chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'username'}, function (cookie) {
        if (cookie) {
            localStorage.setItem('shanbay_cookies', cookie);
            callback();
        } else {
            localStorage.removeItem('shanbay_cookies');
            var notification = webkitNotifications.createNotification("icon_48.png", "登陆", "登陆扇贝网后方可划词查义");
            notification.addEventListener('click', function () {
                notification.cancel();
                chrome.tabs.create({
                    url:"http://www.shanbay.com/accounts/login/"
                })
            });
            setTimeout(function(){
                notification.cancel();
            },5000);
            notification.show();
        }
    });
}

function getClickHandler(term, tab) {
  console.log('signon');
  var url = 'http://www.shanbay.com/api/word/' + singularize(normalize(term));//normalize it then sigularize

  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'JSON',
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      console.log('success');
      if((data.learning_id == 0&&data.voc == "")||localStorage['search_webster']=='yes')
        getOnlineWebsterCollegiate(term,function(word,json){
            var defs=json.fls.map(function(i){
                return "<span class='web_type'>"+json.fls[i].textContent+'</span>, '+json.defs[i].textContent
            }).toArray().join('<br/>')
            chrome.tabs.sendMessage(tab.id, {
                action: 'popover',
                data: {shanbay:data,webster:{term:json.hw[0].textContent.replace(/\*/g, '·'),defs:defs}}
            });
        })
      else chrome.tabs.sendMessage(tab.id, {
        action: 'popover',
        data: {shanbay:data}
      });
    },
    error: function() {
      console.log('error');
    },
    complete: function() {
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
  if(result) {
    return result;
  }

  var pluralRule = [{
    'match': /s$/,
    'replace': ''
  }];
  // , {
  //   'match': /(ss)$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(n)ews$/,
  //   'replace': /$1ews/
  // }, {
  //   'match': /([ti])a$/,
  //   'replace': /$1um/
  // }, {
  //   'match': /([^f])ves$/,
  //   'replace': /$1fe/
  // }, {
  //   'match': /(hive)s$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(tive)s$/,
  //   'replace': /$1/
  // }, {
  //   'match': /([lr])ves$/,
  //   'replace': /$1f/
  // }, {
  //   'match': /([^aeiouy]|qu|famil|librar)ies$/,
  //   'replace': /$1y/
  // }, {
  //   'match': /(s)eries$/,
  //   'replace': /$1eries/
  // }, {
  //   'match': /(m)ovies$$/,
  //   'replace': /$1ovie/
  // }, {
  //   'match': /(x|ch|ss|sh)es$/,
  //   'replace': /$1/
  // }, {
  //   'match': /^(m|l)ice$/,
  //   'replace': /$1ouse/
  // }, {
  //   'match': /(bus)(es)?$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(o)es$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(shoe)s$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(cris|test)(is|es)$/,
  //   'replace': /$1is/
  // }, {
  //   'match': /^(a)x[ie]s$/,
  //   'replace': /$1xis/
  // }, {
  //   'match': /(octop|vir)(us|i)$/,
  //   'replace': /$1us/
  // }, {
  //   'match': /(alias|status)(es)?$/,
  //   'replace': /$1/
  // }, {
  //   'match': /^(ox)en/,
  //   'replace': /$1/
  // }, {
  //   'match': /(vert|ind)ices$/,
  //   'replace': /$1ex/
  // }, {
  //   'match': /(matr)ices$/,
  //   'replace': /$1ix/
  // }, {
  //   'match': /(quiz)zes$/,
  //   'replace': /$1/
  // }, {
  //   'match': /(database)s$/,
  //   'replace': /$1/
  // }];

  for(var j=0; j<pluralRule.length; j++) {
    if(word.match(pluralRule[j].match)) {
      return word.replace(pluralRule[j].match, pluralRule[j].replace);
    }
  }

  return word;
}

