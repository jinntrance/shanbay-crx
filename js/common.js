/**
 * 基本的函数，包括Webster 及 在线词源的获取
 * @user Joseph
 */

const etym_url = 'https://www.etymonline.com';
const etho_pre_url = etym_url + '/search?q=';

const keys = [
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
'cc49f0d8-5299-410c-9661-e88c9e2ca516',
'74e6ab1d-8977-40ac-a56a-ece724d9851c',
'e81cc7d7-a2c5-41da-b452-3325b66defc2'
];

const devMode = !('update_url' in chrome.runtime.getManifest());

function ls(callback) {
    chrome.runtime.sendMessage({method: "getLocalStorage"}, function (response) {
        if(response) {
            for (let k in response.data)
                localStorage[k] = response.data[k];
        }
        if(callback){
            callback();
        }
    });
    return localStorage;
}

const debugLog = (level = 'log', ...msg) => {
    /**
     * 在开发模式下打印日志
     * @param msg 可以为任何值
     * @param level console之下的任何函数名称
     * */
    if (devMode) {
        console[level](...msg)
    }
};

/**
 * 获取在线词源
 */
function getOnlineEtymology(term, callback) {
    let url = etho_pre_url + term.toLowerCase();
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            let roots = parseEtymology(xhr.responseText, term);
            callback(term, {roots: roots, ew: term})
        }
    };
    xhr.send();
}

function parseEtymology(text, term) {
    let wordSelector = 'a.word--C9UPa';
    let data = $(text.replace(/<img[^>]*>/g, "")).find(`div:has(>${wordSelector})`);
    data.find(wordSelector).attr('target', '_blank').replaceWith(function (i, e) {
        //let anchor = '<a target="_blank" class="etymology" href="' + pre_url + $(this).text() + '">' + $(this).text() + '</a>'
        return $(this).attr('href', etym_url + $(this).attr('href'));
    });
    data.find('>div').remove();
    data.find('>ul').remove();
    if (term) {
        data.find('a').filter(function (index) {
            return $(this).find('p').text().indexOf(term) < 0;
        }).remove();
    }
    return data.html()
}

function getKey() {
    let personal_keys = ls()['web_key'];
    if (undefined != personal_keys && '' != personal_keys.trim()) {
        let p_keys = personal_keys.split(',');
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
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            let word = $($.parseXML(xhr.responseText)).find('entry').filter(function () {
                return $(this).find('ew').text().trim().length <= term.length + 2
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

        let common_count = 0;
        let sets={};
        for (let i = 0; i < str1.length - n; i++) {
            sets[str1.substr(i, n)]=1;
        }
        for (let j = 0; j < str2.length - n; j++) {
            let this_str = str2.substr(j, n);
            if (1 == sets[this_str]) {
                common_count += 1;
                sets[this_str] +=1;
            }
        }
        return 2.0*common_count / (str1.length + str2.length - 2*(n-1))
    }
    return 0;
}
