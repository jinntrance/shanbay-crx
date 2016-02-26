/**
 * 基本的函数，包括Webster 及 在线词源的获取
 * @user Joseph
 */

var etho_pre_url = 'http://www.etymonline.com/index.php?term=';

var keys = [
'62f54ac9-4791-4131-bfdd-1146af327107',
'c0b8de2c-834c-4d08-818d-c7a5ee1cf1a9',
'e8e77e77-6c9d-4ce7-903a-9b9ad3246fd8',
'd283a343-d2ba-45fb-b3b7-fd542a0c25c8',
'a232cef0-720f-414c-a27e-a32648bbc977',
'b0d3d18c-cd69-46ca-bb62-bd5280ae87a7',
'3d539f77-ab91-4839-8ba4-120776fc566e',
'9ce488d2-5924-437a-a718-29f0749bd8c6',
'45b94f06-9d11-4049-9a23-ab80f95dd57e'
];

function ls(callback) {
    chrome.extension.sendRequest({method: "getLocalStorage"}, function (response) {
        console.info(response)
        if (undefined != response)
            for (var k in response.data)
                localStorage[k] = response.data[k];
        if(undefined != callback){
            callback();
        }
    });
    return localStorage;
}

/**
 * 获取在线词源
 */
function getOnlineEtymology(term, callback) {
    var url = etho_pre_url + term.toLowerCase();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var roots = parseEtymology(xhr.responseText);
            callback(term, {roots: roots, ew: term})
        }
    };
    xhr.send();
}

function parseEtymology(text) {
    var etym_url = 'http://www.etymonline.com/';
    var data = $(text.replace(/<img[^>]*>/g, "")).find('#dictionary dl');
    data.find('a').addClass('etymology').attr('target', '_blank').replaceWith(function (i, e) {
        //var anchor = '<a target="_blank" class="etymology" href="' + pre_url + $(this).text() + '">' + $(this).text() + '</a>'
        return $(this).attr('href', etym_url + $(this).attr('href'));
    });
    data.find('dt a').removeClass('etymology');
    data.find('dt a.dictionary').remove();
    return data.html()
}

function getKey() {
    var personal_keys = ls()['web_key'];
    if (undefined != personal_keys && '' != personal_keys.trim()) {
        var p_keys = personal_keys.split(',');
        return p_keys[Math.floor(Math.random() * p_keys.length)];
    }
    return keys[Math.floor(Math.random() * keys.length)];
}
function websterUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=' + getKey()
}
function thesaurusUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/' + term + '?key=7269ef5b-4d9f-4d38-ac7e-f1ed6e5568f7'
}

function getOnlineWebsterCollegiate(term, callback) {
    getOnlineWebster(term, websterUrl(term.toLowerCase()), callback);
}

function getOnlineWebsterThesaurus(term, callback) {
    getOnlineWebster(term, thesaurusUrl(term.toLowerCase()), callback);
}

/**
 * 获取在线Webster 解释
 */
function getOnlineWebster(term, url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var word = $($.parseXML(xhr.responseText)).find('entry').filter(function () {
                return $(this).find('ew').text().trim().length <= term.length
            });
            var derivatives = word.find('ure').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            });
            if (undefined != derivatives) derivatives = derivatives.toArray().toString().replace(/,/g, ", ");
            var syns = word.find('sx').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            });
            if (undefined != syns) syns = syns.toArray().toString().replace(/,/g, ", ");
            var roots = word.children('et');
            var resp_word = word.children('ew');
            var hw = word.children('hw'); // 音节划分
            var fls = word.children('fl'); //lexical class 词性
            var defs = word.children('def');
            callback(word, {
                derivatives: derivatives,
                syns: syns,
                roots: roots,
                fls: fls,
                defs: defs,
                hw: hw,
                ew: resp_word
            });
        }
    };
    xhr.send();
}

/**
 * 通过在线词典查询，替换同义词、词根、词性、解释等。
 */
function showDerivatives(originalTerm, word, json) {
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
        } else if (ls()['etym'] == 'webster') getEthology();
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
    } else if (ls()['etym'] == 'webster') getEthology()
}

/**
 * have a look at http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.67.9369&rep=rep1&type=pdf
 * @param n number of grams
 * @param str1
 * @param str2
 * @returns {number} between 0 and 1, as the similarity of str1 and str2
 */
function n_gram_similarity(n, str1, str2) {
    if (str1 && str2) {
        str1 = str1.replace(/\s+/g, " ");
        str2 = str2.replace(/\s+/g, " ");

        var common_count = 0;
        var sets={};
        for (var i = 0; i < str1.length - n; i++) {
            sets[str1.substr(i, n)]=1;
        }
        for (var j = 0; j < str2.length - n; j++) {
            var this_str = str2.substr(j, n);
            if (1 == sets[this_str]) {
                common_count += 1;
                sets[this_str] +=1;
            }
        }
        return 2.0*common_count / (str1.length + str2.length - 2*(n-1))
    }
    return 0;
}
