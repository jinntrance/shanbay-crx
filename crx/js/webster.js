/**
 * @user Joseph
 */
function websterUrl(term) {
    return 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/' + term + '?key=0f4f19c8-b1cd-401f-a183-6513573cb3b9'
}

function findDerivatives() {
    var term = $('#current-learning-word').text()
    originTerm = term
    var url = websterUrl(term)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && $('#current-learning-word').text() == originTerm) {
            var word = $($.parseXML(xhr.responseText));
            var derivatives = word.find('ure').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=derivatives) derivatives=derivatives.toArray().toString().replace(/,/g, ", ");
            var syns = word.find('sx').map(function (i, e) {
                return e.textContent.replace(/\*/g, '·')
            })
            if(undefined!=syns) syns=syns.toArray().toString().replace(/,/g, ", ")
            var roots=word.find('et').html()
            if(undefined!=roots) roots=roots.toString().replace(/<\/it>/g,"</span>").replace(/<it>/g,"<span class='foreign'>")
            var term = $('#learning_word .word .content.pull-left');
            var small = term.find('small')[0].outerHTML
	    var hw=word.find('hw')
            if(hw.length>0) term.html((hw[0].textContent.replace(/\*/g, '·') + small))
            if(undefined != roots&& roots.trim() != ""&&localStorage['etym']!='etym')
                $("#roots .due_msg").addClass("well").removeClass("alert").html(roots)
            else getEthology()
            addNoteButton("#roots .due_msg");
            if (undefined != derivatives && "" != derivatives.trim()) $("#affix .due_msg").addClass("well").removeClass("alert").html(derivatives + "<br/>" + syns)
            else $("#affix").hide();
        }
    }
    xhr.send();
}
