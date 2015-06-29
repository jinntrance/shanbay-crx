/**
 * @author Joseph
 */
var originAnchor = undefined;

function getEthology() {
    originAnchor = undefined;
    var term = getCurrentTerm();
    getOnlineEtymology(term, function (obj) {
        if (getCurrentTerm() == term) {
            var roots=obj.roots
            addButtons();
            if (undefined != roots && roots.trim() != "" && $('#roots .exist').length == 0)
                $("#roots .alert").addClass("well exist").removeClass("alert").html($(roots.trim()));
            else if ($('#roots .well').length == 0)  $("#roots").hide();
            if (!$("#roots .alert").hasClass("alert") && ls()['root2note'] == 'YES') addToNote("#roots a.note-button");
        }
    });
}

function popup(anchor, term, text) {
    $('.popover-crx').remove();
    $('.popover').remove();
    $('body').append('<div class="popover popover-crx fade bottom in" style=" display: none;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><span class="word"></span></h3>' + noteString + '<div class="popover-content"></div></div></div>');
    $('.popover-title').html('<span class="word">' + term + '</span>');
    $('.popover-content').html('<p>' + text + '</p>');
    var offset = $(anchor).offset();
    if (undefined != offset) $('.popover-crx').slideDown().offset({
        top: offset.top + 23,
        left: offset.left - 130
    });
    if (ls()['root2note'] == 'yes') addToNote(".popover-crx a.note-button");
}

function popupEtymology(anchor) {
    var pre_url = etho_pre_url;
    if (undefined == originAnchor || originAnchor.text() != $(anchor).text()) {
        if ($(anchor).parents("#roots").length > 0) originAnchor = $(anchor);
        //var url = pre_url + $(anchor).text()
        var url = $(anchor).attr('href');
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var roots = parseEtymology(xhr.responseText);
                popup(originAnchor, $(anchor).text(), roots)
            }
        };
        xhr.send();
    }
}



