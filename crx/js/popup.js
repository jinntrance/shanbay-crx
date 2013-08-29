/**
 * @user Joseph
 */

function addBatch(text){
    var lines=text.split('\n')
    var defs={}
    var words=[];
    lines.map(function(line){
        var index=line.trim().indexOf(',')
        var word=''
        if(-1==index) {
            word=line;
        }
        else {
            word=line.substr(0,index).trim()
            var meaning=line.substr(index+1).trim()
            defs[word]=meaning;
        }
        words.push(word)
    })
    for (var i=0;i<words.length;i+=10)
        $.ajax({
            url: "http://www.shanbay.com/bdc/vocabulary/add/batch/?words="+words.slice(i,i+10).join("%0A"),
            type: 'GET',
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            success: function(data) {
                var json=$.parseJSON(data)
                var nf=json['notfound_words']
//                $('#words').val($('#words').val()+'\n'+nf.join('\n'))
//                if(nf.length>0) for (i=0;i<nf.length;i+=1)
//                    $.get("http://www.shanbay.com/bdc/sentence/add/?",{sentence:nf[i],definition:defs[i]})
            }
        });
}
$(function(){
    $('input[type=submit]').click(function(){
        addBatch($('textarea[name=words]').val())
        return false;
    })
})
