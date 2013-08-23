/**
 * @author Joseph
 */

var etho_pre_url = 'http://www.etymonline.com/index.php?term='
var originAnchor=undefined

function parseEtymology(pre_url, text) {
    var data = $($.parseHTML(text)).find('#dictionary dd');
    data.find('a').replaceWith(function (i,e) {
        var anchor = '<a target="_blank" class="etymology" href="' + pre_url + $(this).text() + '">' + $(this).text() + '</a>'
        return $(anchor)
    });
    return data.html()
}

function getEthology() {
    var pre_url=etho_pre_url
    var term = $('#current-learning-word').text()
    var url = pre_url + term
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && $('#current-learning-word').text() == term) {
            var roots = parseEtymology(pre_url, xhr.responseText);
            if (undefined != roots && roots.trim() != "")
                $("#roots .due_msg").addClass("well").removeClass("alert").html(roots)
            else  $("#roots").remove();
        }
    }
    xhr.send();
}

function popup( anchor) {
    var pre_url=etho_pre_url
    if (undefined == originAnchor) originAnchor = $(anchor);
    var url = pre_url + $(anchor).text()
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var roots = parseEtymology(pre_url, xhr.responseText);
            //$('.popover').remove();
            $('body').append('<div class="popover fade bottom in" style=" display: none;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><span class="word"></span></h3><div class="popover-content"><p></p></div></div></div>')
            $('.popover-title').html('<span class="word">' + $(anchor).text() + '</span>')
            $('.popover-content').html('<p>' + roots + '</p>')
            var offset = $(originAnchor).offset();
            $('.popover').show().offset({top: offset.top + 23, left: offset.left - 130})
        }
    }
    xhr.send();
}



