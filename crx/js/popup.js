/**
 * @user Joseph
 */

$(function(){
    $('#begin-learning').click(function(){
        chrome.tabs.create({url:'http://www.shanbay.com/bdc/review/'})
    })
    $('#batch-add').click(function(){
        chrome.tabs.create({url:'http://www.shanbay.com/bdc/vocabulary/add/batch/'})
    })
    $('#options').click(function(){
        chrome.tabs.create({url:'options.html'})
    })


    checkLoginStatus();
    document.querySelector('#search').addEventListener('click', search);
    document.querySelector('#input').addEventListener('keydown', keydown);
    document.querySelector('#addWord').addEventListener('click', addWord);
    document.querySelector('#reviewWord').addEventListener('click', reviewWord);
    document.querySelector('#sound').addEventListener('click', playSound);
    document.querySelector('#sound').addEventListener('mouseover', playSound);
});


function makeRequest(method, url, data, callback){
    console.log('request url', url);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4){
            if(typeof callback != 'function'){
                return;
            }
            callback(JSON.parse(xhr.responseText));
        }
    };
    xhr.open(method, url, true);
    if(method!='GET'){        
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    var param = serialize(data);
    xhr.send(param);
}

function serialize(obj, prefix) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}


function getFirstChildWithTagName(element, tagName) {
    var tagName = tagName.toUpperCase();
    var childs = element.childNodes;
    for(var i = 0; i < childs.length; i++) {
        if (childs[i].nodeName == tagName)
            return childs[i];
    }
}


function clearArea(area) {
    if (area == 'definition') {
        document.getElementById('content').innerHTML = '';
        document.getElementById('pron').innerHTML = '';
        document.getElementById('sound').innerHTML = '';
        document.getElementById('zh_trans').innerHTML = '';
        document.getElementById('en_trans').innerHTML = '';
        return null;
    }
    document.getElementById(area).innerHTML = '';
}


function showTips(message) {
    var tips = document.getElementById('tips');
    if (message.length == 0)
    clearArea('tips');
    else
    tips.innerHTML = '<p>' + message + '</p>';
}


function loggedIn(nick_name, avatar) {
    clearArea('status');

    var status = document.getElementById('status');

    var user_img = document.createElement('img');
    user_img.setAttribute('src', avatar);
    user_img.setAttribute('width', '20');
    status.appendChild(user_img);

    var user_link = document.createElement('a');
    var user_home = 'http://www.shanbay.com/home/';
    user_link.setAttribute('href', user_home);
    user_link.setAttribute('target', '_newtab');
    user_link.appendChild(document.createTextNode(nick_name + ''));
    status.appendChild(user_link);
}


function loggedOut() {
    var status = document.getElementById('status');
    var login_link = document.createElement('a');
    var login_url = 'http://www.shanbay.com/accounts/login/';
    login_link.setAttribute('href', login_url);
    login_link.setAttribute('target', '_newtab');
    login_link.appendChild(document.createTextNode('Login'));
    clearArea('status');
    status.appendChild(login_link);
    // body area
    var search_area = document.getElementById('search_area');
    search_area.setAttribute('class', 'invisible');
    showTips('请点击右上角链接登录，登录后才能查词');
}


function checkLoginStatus() {
    // focus on input area
    document.getElementById('input').focus();
    // status area
    var status = document.getElementById('status');
    status.innerHTML = '正在检查...';
    // tips area
    //showTips('提示：使用回车键搜索更快捷，点击选项可以自定义设置');
    var request = new XMLHttpRequest();
    var check_url = 'http://www.shanbay.com/api/v1/account/';
    request.open('GET', check_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            // user have logged in
            if (request.getResponseHeader('Content-Type') == 'application/json') {
                var response = JSON.parse(request.responseText);
                loggedIn(response.nickname, response.avatar);
            }
            else {
                alert("loggedOut");
                // user have not logged in
               // loggedOut();
            }
        }
    };
    request.send(null);
}


function addWord() {
    var jump = document.getElementById('addWord');
    var a = getFirstChildWithTagName(jump, 'a');
    var id = a.title;
    jump.innerHTML = 'add...';
    learning(id, function (r) {
        showViewLink(r.data.id);
        review(r.data.id, function(){
            jump.innerHTML = "";               
        });     
    });
}

function reviewWord() {
    var jump = document.getElementById('reviewWord');
    var a = getFirstChildWithTagName(jump, 'a');
    var id = a.title;
    jump.innerHTML = 'review...';
    relearn(id, function (r) {
        jump.innerHTML = "";
    });
}

function learning(id, callback){
    var url = "http://www.shanbay.com/api/v1/bdc/learning/";
    makeRequest('POST', url, {id:id}, callback);
}

function relearn(id, callback){
    var url = "http://www.shanbay.com/api/v1/bdc/learning/"+id;
    makeRequest('PUT', url, {retention:1}, function(r){
        review(id, callback);
    });
}

function review(id, callback){
    var url = "http://www.shanbay.com/api/v1/bdc/review/?ids="+ id;
    makeRequest('GET', url, null, callback);
}

function showViewLink(learning_id){
    clearArea('jump');
    var check_link = 'http://www.shanbay.com/review/learning/';
    var check = document.createElement('a');
    check.setAttribute('id', 'jump_a');
    check.setAttribute('href', check_link + learning_id);
    check.setAttribute('target', '_newtab');
    check.appendChild(document.createTextNode('View'));
    var jump = document.getElementById('jump');    
    jump.appendChild(check);    
}

function showEnDefinitions(en_definitions) {
    var en_trans = document.getElementById('en_trans');
    for (var i in en_definitions) {
        var div = document.createElement('div');
        div.setAttribute('class', 'part-of-speech');
        div.innerHTML = '<strong>' + i + '</strong>';
        var ol = document.createElement('ol');
        for (var j = 0; j < en_definitions[i].length; j++) {
            var li = document.createElement('li');
            li.innerText = en_definitions[i][j];
            ol.appendChild(li);
        }
        en_trans.appendChild(div);
        en_trans.appendChild(ol);
    }
}


function queryOk(response) {
    // clear tips area
    showTips('');
    // check localStorage
    var storage = localStorage.getItem('options');
    // first time run, set localStorage to default
    if ((storage == null) || (storage.search('definitions') == -1)) {
        storage = 'zh_definitions';
        localStorage.setItem('options', storage);
    }

    var learning_id = response.learning_id;

    // word and pronouncation
    var content = document.getElementById('content');
    content.innerHTML = response.content + ' ';
    if (response.pron.length != 0) {
        var pron = document.getElementById('pron');
        // if word too long, put pronouncation in the next line
        if (response.content.length > 11){
            pron.innerHTML = '<br />[' + response.pron + ']';
        }
        else{
            pron.innerHTML = '[' + response.pron + '] ';
        }
    }

    // if audio is available
    if (response.audio.length != 0) {
        var alt = response.content;
        var img = document.createElement('img');
        img.setAttribute('src', 'static/audio.png');
        img.setAttribute('id', 'horn');
        img.setAttribute('alt', alt);
        var sound = document.getElementById('sound');
        sound.appendChild(img);
        // if auto play sound option is set
        //if (storage.search('auto') != -1){
            playSound();
       // }
    }

    // whether show chinese definition
    if (storage.search('zh_definitions') != -1) {
        var zh_trans = document.getElementById('zh_trans');
        zh_trans.innerHTML = response.definition;
    }

    // whether show english definition
    //if (storage.search('en_definitions') != -1){
        showEnDefinitions(response.en_definitions);
    //}

    clearArea('jump');
    clearArea('reviewWord');
    clearArea('addWord');
    
    if (learning_id && learning_id != 0) {
        var add = document.createElement('a');
        add.setAttribute('id', 'reviewWord_a');
        add.setAttribute('href', '#');
        add.setAttribute('title', learning_id);
        add.appendChild(document.createTextNode('Forgot'));
        var span_reviewWord = document.getElementById('reviewWord');
        span_reviewWord.appendChild(add);

        showViewLink(learning_id);
    }
    else {
        var add = document.createElement('a');
        add.setAttribute('id', 'jump_a');
        add.setAttribute('href', '#');
        // let addWord function can access the word name by title name
        add.setAttribute('title', response.object_id);
        add.appendChild(document.createTextNode('Learn'));
        var span_addWord = document.getElementById('addWord');
        span_addWord.appendChild(add);
    }
}

function queryNotFound(word) {
    // clear jump area
    clearArea('jump');
    showTips('<span class="word">' + word + '</span> 没有找到。');
}

function query(word) {
    // show this let user don't panic
    document.getElementById("input").value = word;
    showTips('Doing...');
    clearArea('jump');
    clearArea('definition');
    var request = new XMLHttpRequest();
    var query_url = 'http://www.shanbay.com/api/v1/bdc/search/?word=' + word;
    request.open('GET', query_url);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);
            if (response.status_code == 0)
                queryOk(response.data);
            else
                queryNotFound(word);
        }
    }
    request.send(null);
}

function parse(input) {
    var re = /[^a-zA-Z ]+/g;
    input = input.replace(re, '');
    if (input.length == 0 || input.search(/^ +$/) != -1)
    // have no valid character 
    return null;
    else {
    var word = input.replace(/ +/, ' ');
    word = word.replace(/^ +| +$/, '');
    return word;
    }
}

function search() {
    var input = document.getElementById('input').value;
    var word = parse(input);
    if (word == null) {
    clearArea('jump');
    clearArea('definition');
    showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
    }
    else
    query(word);
    document.getElementById('input').focus();
}

function keydown() {
    if (event.keyCode == 13) {
        var input = document.getElementById('input').value;
    var word = parse(input);
    if (word == null) {
        clearArea('jump');
        clearArea('definition');
        showTips('<span class="color">英文字符</span>和<span class="color">空格</span>为有效的关键字，请重新输入');
    }
    else
        query(word);
    }
}

function playSound() {
    var audio = document.createElement('audio');
    // sound api has changed, url made by my own hand
    var sound_url = 'http://media.shanbay.com/audio/$country/$word.mp3';
    // now hard coded to use American english
    var country = 'us';
    // find word name from element img's alt attribute
    var audio_img = document.getElementById('horn');
    // get word and change space to underscore to generate the url
    var word = audio_img.alt.replace(/ /g, '_');
    sound_url = sound_url.replace('$country', country);
    sound_url = sound_url.replace('$word', word);
    audio.setAttribute('src', sound_url);
    audio.setAttribute('autoplay', 'true');
    var sound = document.getElementById('sound');
    sound.appendChild(audio);
    document.getElementById('input').focus();
}

