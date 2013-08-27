/**
 * @user Joseph
 */
function websterUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=0f4f19c8-b1cd-401f-a183-6513573cb3b9'
}
function thesaurusUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/' + term + '?key=7269ef5b-4d9f-4d38-ac7e-f1ed6e5568f7'
}

function findDerivatives() {
    var originalTerm = getCurrentTerm()
    var url = websterUrl(originalTerm)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && getCurrentTerm() == originalTerm) {
            var word = $($.parseXML(xhr.responseText)).find('entry').filter(function () { return $(this).find('ew').text()==originalTerm });
            var derivatives = word.find('ure').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=derivatives) derivatives=derivatives.toArray().toString().replace(/,/g, ", ");
            var syns = word.find('sx').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=syns) syns=syns.toArray().toString().replace(/,/g, ", ")
            var roots=word.children('et').html()
            if(undefined!=roots) roots=roots.toString().replace(/<\/it>/g,"</span>").replace(/<it>/g,"<span class='foreign'>")
            var term = $('#learning_word .word .content.pull-left');
            var small = term.find('small')[0].outerHTML
	        var hw=word.children('hw')
	        var fls=word.children('fl')
	        var defs=word.children('def')

	        var responseWord=word.find('ew').text()
            if (getCurrentTerm().length < 3 + responseWord.length) {
                if (hw.length > 0) term.html((hw[0].textContent.replace(/\*/g, '·') + small))
                if (undefined != roots && roots.trim() != "" && ls()['etym'] != 'etym') {
                    $("#roots .due_msg").addClass("well").removeClass("alert").html(roots)
                    if (!$("#roots .due_msg").hasClass("alert") && ls()['root2note'] == 'yes') addToNote("#roots a.note-button");
                }
                else getEthology()
                if (undefined != derivatives && "" != derivatives.trim()) $("#affix .due_msg").addClass("well").removeClass("alert").html(derivatives + "; <br/>"+derivatives.replace(/·/g,'')+"; <br/>" + syns)
                else $("#affix").hide();
                if (!$("#affix .due_msg").hasClass("alert") && ls()['afx2note'] == 'yes') addToNote("#affix a.note-button");
                if (ls()['web_en'] == 'yes'){
                    var endef=$("#review-definitions .endf");
                    endef.html('')
                    if(fls.length==defs.length) fls.each(function(i){
                        endef.append($('<div class="span1"><span class="part-of-speech label">').find('span').html($(fls[i]).text().substr(0,4)).parent())
                        var def=$('<ol class="span7">')
                        $(defs[i]).find('dt').each(function(){
                            def.append($('<li class="definition"><span class="content">').find('span').html($(this).text()).parent())
                        })
                        endef.append(def)
                    })
                }
            } else getEthology()
        }
    }
    xhr.send();
}
