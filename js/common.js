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
'5fa8f2c0-0fa5-44a8-a1f2-7d37a0f8e987',
'762c2f8c-87ac-481e-ba21-5ae6ebd85b21',
'30de8a01-22b1-446b-b51a-2b0c62fdefdc',
'0627fb80-2ae7-4ce1-82e1-c2a0bcdf3317',
'd9b1eeac-4a10-42b3-8683-70a17bbe04af',
'e855f926-44f0-4be4-91bb-5c5f7d685eca',
'45b94f06-9d11-4049-9a23-ab80f95dd57e',
'cc49f0d8-5299-410c-9661-e88c9e2ca516'
];

function ls(callback) {
    chrome.runtime.sendMessage({method: "getLocalStorage"}, function (response) {
        console.info(response);
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
            callback(term, {
                derivatives: derivatives,
                syns: syns,
                roots: roots,
                fls: fls,
                defs: defs,
                hw: hw,
                ew: resp_word,
                responseText: xhr.responseText
            });
        }
    };
    xhr.send();
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
