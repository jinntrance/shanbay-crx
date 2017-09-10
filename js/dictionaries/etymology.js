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
    debugLog('log', "received\n");
    debugLog('log', resp.data);
    switch (resp.callback) {
        case 'showEtymology':
            showEtymology(resp.data.term, resp.data.json);
            break;
        case 'showDerivatives':
            showDerivatives(resp.data.term, resp.data.json);
            break;
        case 'popupEtymology':
            popup(resp.data.originAnchor, resp.data.term, resp.data.roots);
            break;
    }
});

function popup(anchor, term, text) {
    $('.popover-crx').remove();
    $('.popover').remove();
    $('body').append('<div class="popover popover-crx fade bottom in" style=" display: none;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><span class="word"></span></h3>' + noteString + '<div class="popover-content"></div></div></div>');
    $('.popover-title').html('<span class="word">' + term + '</span>');
    $('.popover-content').html('<p>' + text + '</p>');
    let offset = $(anchor).offset();
    if (undefined != offset) $('.popover-crx').slideDown().offset({
        top: offset.top + 23,
        left: offset.left - 130
    });
    if (ls()['root2note'] == 'yes') addToNote(".popover-crx a.note-button");
}

function popupEtymology(anchor) {
    let pre_url = etho_pre_url;
    if (undefined == originAnchor || originAnchor.text() != $(anchor).text()) {
        if ($(anchor).parents("#roots").length > 0) originAnchor = $(anchor);
        //let url = pre_url + $(anchor).text()
        let url = $(anchor).attr('href');
        chrome.runtime.sendMessage({
            method: 'popupEtymology',
            data: {
                originAnchor: originAnchor,
                term: $(anchor).text(),
                url: url
            }
        });
    }
}

function showEtymology(term, json){
    if (getCurrentTerm() == term) {
        let roots=json.roots;
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
function showDerivatives(originalTerm, json) {
    if (getCurrentTerm() != originalTerm) {
        return;
    }

    let word = $($.parseXML(json.responseText)).find('entry').filter(function () {
        return $(this).find('ew').text().trim().length <= originalTerm.length
    });
    let derivatives = word.find('ure').map(function (i, e) {
        return e.textContent.replace(/\*/g, '·')
    });
    if (undefined != derivatives) derivatives = derivatives.toArray().toString().replace(/,/g, ", ");
    let syns = word.find('sx').map(function (i, e) {
        return e.textContent.replace(/\*/g, '·')
    });
    if (undefined != syns) syns = syns.toArray().toString().replace(/,/g, ", ");

    let roots = word.children('et');
    let resp_word = word.children('ew');
    let hw = word.children('hw'); // 音节划分
    let fls = word.children('fl'); //lexical class 词性
    let defs = word.children('def');

    let term = $('#learning_word .word .content.pull-left');
    let small = term.find('small')[0].outerHTML;

    let responseWord = word.find('ew').text();
    if (getCurrentTerm().length <= 4 + responseWord.length) {
        addButtons();
        if (hw.length > 0 && ls()['show_syllabe'] != 'no' && hw[0].textContent.replace(/\*/g, '') == originalTerm) term.html((hw[0].textContent.replace(/\*/g, '·') + small));
        if (undefined != roots && 0 < roots.length && ls()['etym'] == 'webster' && $('#roots .exist').length == 0) {
            let r = $("#roots .alert").addClass("well exist").html(roots);
            if (0 < r.length) r.html(r.html().replace(/<\/it>/g, "</span>").replace(/<it>/g, "<span class='foreign'>"));
            r.removeClass("alert");
            if (!$("#roots .alert").length > 0 && ls()['root2note'] == 'YES') addToNote("#roots a.note-button");
        } else if (ls()['etym'] == 'webster') getEtymology();
        if (undefined != derivatives && "" != derivatives.trim() && $('#affix .exist').length == 0)
            $("#affix .alert").addClass("well exist").removeClass("alert").html(derivatives + "; <br/>" + derivatives.replace(/·/g, '') + "; <br/>" + syns);
        else if ($('#affix .word').length == 0)$("#affix").hide();
        if (!$("#affix .alert").hasClass("alert") && ls()['afx2note'] == 'YES') addToNote("#affix a.note-button");
        if (ls()['web_en'] == 'yes') {
            let endef = $("#review-definitions .endf");
            endef.html('');
            if (fls.length == defs.length) fls.each(function (i) {
                endef.append($('<div class="span1"><span class="part-of-speech label">').find('span').html($(fls[i]).text().substr(0, 4)).parent());
                let def = $('<ol class="span7">');
                $(defs[i]).find('dt').each(function () {
                    def.append($('<li class="definition"><span class="content">').find('span').html($(this).text()).parent())
                });
                endef.append(def)
            })
        }
    } else if (ls()['etym'] == 'webster') getEtymology()
}

