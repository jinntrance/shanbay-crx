/**
 * @author Joseph
 */

var etho_pre_url='http://www.etymonline.com/index.php?term='

function websterUrl(term){
 return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/'+term+'?key=0f4f19c8-b1cd-401f-a183-6513573cb3b9'
}

function parseEtymology(pre_url,text){
 var data=$($.parseHTML(text)).find('#dictionary dd');
 data.find('a').replaceWith(function(){
 var anchor= '<a target="_blank" class="etymology" href="'+pre_url+$(this).text()+'">'+$(this).text()+'</a>'
 return $(anchor)
 });
 return data.html()
}

function getEthology(pre_url){
var term=$('#current-learning-word').text()
var url=pre_url+term
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4&& $('#current-learning-word').text()==term) {
  var roots= parseEtymology(pre_url,xhr.responseText);
  if(undefined!=roots&&roots.trim()!="")
 	$("#roots .due_msg").addClass("well").removeClass("alert").html(roots)
  else  $("#roots").remove();
  }
}
xhr.send();
}

function popup(pre_url,anchor){
var url=pre_url+$(anchor).text()
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
  var roots= parseEtymology(pre_url,xhr.responseText);
  $('.popover').remove();
  $('body').append('<div class="popover fade bottom in" style=" display: none;"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"><span class="word"></span></h3>div class="popover-content"><p></p></div></div></div>')
  $('.popover-title').html('<span class="word">'+$(anchor).text()+'</span>')
  $('.popover-content').html('<p>'+roots+'</p>')
  var offset=$(anchor).offset();
  $('.popover').show().offset({top:offset.top+23,left:offset.left-130})
  }
}
xhr.send();
}

function findDeritives(){
var term=$('#current-learning-word').text()
originTerm=term
var url=websterUrl(term)
var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4&&$('#current-learning-word').text()==originTerm) {
  var word=$($.parseXML(xhr.responseText));
  var deritives=word.find('ure').map(function(i,e){
  		return e.textContent.replace(/\*/g,'·')
  }).toArray().toString().replace(/,/g,", ");
  var syns=word.find('sx').map(function(i,e){
  		return e.textContent.replace(/\*/g,'·')
  }).toArray().toString().replace(/,/g,", ")
  var term=$('#learning_word .word .content.pull-left');
  var small=term.find('small')[0].outerHTML
  term.html((word.find('hw')[0].textContent.replace(/\*/g,'·')+small))
  if(undefined!=deritives&&""!=deritives.trim()) $("#affix .due_msg").addClass("well").removeClass("alert").html(deritives+"<br/>"+syns)
  else $("#affix").remove();
  }
}
xhr.send();
}

$("#review").on("DOMNodeInserted",'#roots .roots-due-wrapper',function(){
  if($("#roots .due_msg").hasClass("alert")) {
  getEthology(etho_pre_url);
  }
}).on("DOMNodeInserted",'#affix .roots-due-wrapper',function(){
  if($("#affix .due_msg").hasClass("alert")) {
  findDeritives();
  }
}).on("mouseover","a.etymology",function(){
  popup(etho_pre_url,$(this));
 return;
});

$(window).keydown(function(e) {
    switch (e.keyCode) {
        case 13: case 27:  
            $('div.popover').fadeOut(3000);
            return false; //"return false" will avoid further events
        case 70: case 102:  
            $('div.navbar').toggle();
            return false; //"return false" will avoid further events
    }
    return; //using "return" other attached events will execute
});


