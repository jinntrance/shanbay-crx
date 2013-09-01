/**
 * @user Joseph
 */

function findDerivatives() {
    var originalTerm = getCurrentTerm()
    getOnlineWebsterCollegiate(originalTerm, function (word,json) {
        if (getCurrentTerm() == originalTerm) {
            var derivatives = json.derivatives
            var syns = json.syns
            var roots=json.roots
            var term = $('#learning_word .word .content.pull-left');
            var small = term.find('small')[0].outerHTML
	        var hw=json.hw
	        var fls=json.fls
	        var defs=json.defs

	        var responseWord=word.find('ew').text()
            if (getCurrentTerm().length < 3 + responseWord.length) {
                addButtons();
                if (hw.length > 0) term.html((hw[0].textContent.replace(/\*/g, '·') + small))
                if (undefined != roots &&0< roots.length&& ls()['etym'] == 'webster'&& $('#roots .exist').length==0) {
                    var r=$("#roots .alert").addClass("well exist").removeClass("alert").html(roots.trim())
                    r.html(r.html().replace(/<\/it>/g,"</span>").replace(/<it>/g,"<span class='foreign'>"))
                    if (!$("#roots .well").length>0 && ls()['root2note'] == 'yes') addToNote("#roots a.note-button");
                } else if(ls()['etym'] == 'webster') getEthology();
                if (undefined != derivatives && "" != derivatives.trim()&&$('#affix .exist').length==0)
                    $("#affix .alert").addClass("well exist").removeClass("alert").html(derivatives + "; <br/>"+derivatives.replace(/·/g,'')+"; <br/>" + syns)
                else if($('#affix .word').length==0 )$("#affix").hide();
                if (!$("#affix .alert").hasClass("alert") && ls()['afx2note'] == 'yes') addToNote("#affix a.note-button");
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
            } else if(ls()['etym'] == 'webster') getEthology()
        }
    });
}
