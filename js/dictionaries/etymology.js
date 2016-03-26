/**
 * @author Joseph
 */
var originAnchor = undefined;

function getEtymology() {
    originAnchor = undefined;
    chrome.runtime.sendMessage({
        method: 'getEtymology',
        data: {term: getCurrentTerm()}
    });
}

function findDerivativesInContentPage(){
    chrome.runtime.sendMessage({
        method: 'findDerivatives',
        data: {term: getCurrentTerm()}
    });
}

chrome.runtime.onMessage.addListener(function (resp, sender, sendResponse) {
    console.log("received\n");
    console.log(resp.data);
    switch (resp.callback) {
        case 'showEtymology':
            showEtymology(resp.data.word, resp.data.obj)
            break;
        case 'showDerivatives':
            showDerivatives(resp.data.originalTerm, resp.data.word, resp.data.obj)
            break;
    }
});

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

function showEtymology(word, obj){
    if (getCurrentTerm() == word) {
        var roots=obj.roots;
        addButtons();
        if (undefined != roots && roots.trim() != "" && $('#roots .exist').length == 0)
            $("#roots .alert").addClass("well exist").removeClass("alert").html($(roots.trim()));
        else if ($('#roots .well').length == 0)  $("#roots").hide();
        if (!$("#roots .alert").hasClass("alert") && ls()['root2note'] == 'YES') addToNote("#roots a.note-button");
    }
}

/**
 * 通过在线词典查询，替换同义词、词根、词性、解释等。
 */
function showDerivatives(originalTerm, word, json) {
    if (getCurrentTerm() != originalTerm) {
        return;
    }
    var derivatives = json.derivatives;
    var syns = json.syns;
    var roots = json.roots;
    var term = $('#learning_word .word .content.pull-left');
    var small = term.find('small')[0].outerHTML;
    var hw = json.hw;
    var fls = json.fls;
    var defs = json.defs;

    var responseWord = word.find('ew').text();
    if (getCurrentTerm().length <= 4 + responseWord.length) {
        addButtons();
        if (hw.length > 0 && ls()['show_syllabe'] != 'no' && hw[0].textContent.replace(/\*/g, '') == originalTerm) term.html((hw[0].textContent.replace(/\*/g, '·') + small));
        if (undefined != roots && 0 < roots.length && ls()['etym'] == 'webster' && $('#roots .exist').length == 0) {
            var r = $("#roots .alert").addClass("well exist").html(roots);
            if (0 < r.length) r.html(r.html().replace(/<\/it>/g, "</span>").replace(/<it>/g, "<span class='foreign'>"));
            r.removeClass("alert");
            if (!$("#roots .alert").length > 0 && ls()['root2note'] == 'YES') addToNote("#roots a.note-button");
        } else if (ls()['etym'] == 'webster') getEtymology();
        if (undefined != derivatives && "" != derivatives.trim() && $('#affix .exist').length == 0)
            $("#affix .alert").addClass("well exist").removeClass("alert").html(derivatives + "; <br/>" + derivatives.replace(/·/g, '') + "; <br/>" + syns);
        else if ($('#affix .word').length == 0)$("#affix").hide();
        if (!$("#affix .alert").hasClass("alert") && ls()['afx2note'] == 'YES') addToNote("#affix a.note-button");
        if (ls()['web_en'] == 'yes') {
            var endef = $("#review-definitions .endf");
            endef.html('');
            if (fls.length == defs.length) fls.each(function (i) {
                endef.append($('<div class="span1"><span class="part-of-speech label">').find('span').html($(fls[i]).text().substr(0, 4)).parent());
                var def = $('<ol class="span7">');
                $(defs[i]).find('dt').each(function () {
                    def.append($('<li class="definition"><span class="content">').find('span').html($(this).text()).parent())
                });
                endef.append(def)
            })
        }
    } else if (ls()['etym'] == 'webster') getEtymology()
}

