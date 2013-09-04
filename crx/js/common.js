/**
 * @user Joseph
 */

var etho_pre_url = 'http://www.etymonline.com/index.php?term='

function getOnlineEthology(term,callback){
    var url = etho_pre_url + term.toLowerCase()
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 ) {
            var roots = parseEtymology( xhr.responseText);
            callback(roots)
        }
    }
    xhr.send();
}

function parseEtymology( text) {
    var etym_url = 'http://www.etymonline.com/'
    var data = $(text.replace(/<img[^>]*>/g,"")).find('#dictionary dl');
    data.find('a').addClass('etymology').attr('target', '_blank').replaceWith(function (i, e) {
        //var anchor = '<a target="_blank" class="etymology" href="' + pre_url + $(this).text() + '">' + $(this).text() + '</a>'
        return $(this).attr('href', etym_url + $(this).attr('href'));
    });
    data.find('dt a').removeClass('etymology');
    data.find('dt a.dictionary').remove();
    return data.html()
}

function websterUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=0f4f19c8-b1cd-401f-a183-6513573cb3b9'
}
function thesaurusUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/' + term + '?key=7269ef5b-4d9f-4d38-ac7e-f1ed6e5568f7'
}

function getOnlineWebsterCollegiate(term,callback){
    getOnlineWebster(term,websterUrl(term.toLowerCase()),callback);
}

function getOnlineWebsterThesaurus(term,callback){
    getOnlineWebster(term,thesaurusUrl(term.toLowerCase()),callback);
}

function getOnlineWebster(term,url,callback){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 ) {
            var word = $($.parseXML(xhr.responseText)).find('entry').filter(function () { return $(this).find('ew').text().trim().length<=term.length });
            var derivatives = word.find('ure').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=derivatives) derivatives=derivatives.toArray().toString().replace(/,/g, ", ");
            var syns = word.find('sx').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=syns) syns=syns.toArray().toString().replace(/,/g, ", ")
            var roots=word.children('et')
            var hw=word.children('hw') // 音节划分
            var fls=word.children('fl') //lexical class 词性
            var defs=word.children('def')
            callback(word,{derivatives:derivatives,syns:syns,roots:roots,fls:fls,defs:defs,hw:hw});
        }
    }
    xhr.send();
}
