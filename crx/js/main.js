/**
 * @user Joseph
 **/

chrome.extension.sendRequest({method: "getLocalStorage"}, function(response) {
    for(k in response.data)
        localStorage[k]=response.data[k];
});

 $(document).on("DOMNodeInserted", '#roots .roots-due-wrapper',function () {
    if ($("#roots .due_msg").hasClass("alert")&&localStorage['hider'].search("roots")==-1) {
        if(localStorage['etym']=='etym')
            getEthology();
    }
}).on("DOMNodeInserted", '#affix .roots-due-wrapper',function () {
        if ($("#affix .due_msg").hasClass("alert")&&localStorage['hider'].search("affix")==-1) {
            findDerivatives();
        }
    }).on("DOMNodeInserted", '#note-mine-box',function () {
        var ids=localStorage['hider'].split(',')
        for(var i in ids){
          $('#'+ids[i]).hide()
        }
    }).on("mouseover", "a.etymology", function () {
        popup($(this));
        return;
    });

 $(window).keydown(function (e) {
    switch (e.keyCode) {
        case 13:
        case 27:
            $('div.popover').fadeOut(3000);
            return ;
        case 70:
        case 102:
            $('div.navbar').toggle();
            return ;
        case 69:
        case 101:
            $('div#learning-examples-box').toggle();
            return ;
        case 78:
        case 110:
            $('div#notes-box').toggle();
            return ;
    }
    return;//using "return" other attached events will execute
});

