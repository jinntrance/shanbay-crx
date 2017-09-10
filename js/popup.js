/**
 * @user Joseph
 */

function addBatch(text) {
    let lines = text.split('\n');
    let defs = {};
    let words = [];
    lines.map(function (line) {
        let index = line.trim().indexOf(',');
        let word = '';
        if (-1 == index) {
            word = line;
        }
        else {
            word = line.substr(0, index).trim();
            let meaning = line.substr(index + 1).trim();
            defs[word] = meaning;
        }
        words.push(word)
    });
    $('#add-status').html("添加中...");
    for (let i = 0; i < words.length; i += 10)
        $.ajax({
            url: "http://www.shanbay.com/bdc/vocabulary/add/batch/?words=" + words.slice(i, i + 10).join("%0A"),
            type: 'GET',
            async: false,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            success: function (data) {
                let nf = data['notfound_words'];
                let learnt = data['learning_dicts'];
                if (0 < nf.length) {
                    let ch = nf.join('\n');
                    let ds = nf.map(function (e) {
                        if (undefined == defs[e]) return e;
                        else return e + ',' + defs[e]
                    }).join('\n');
                    console.log(ch);
                    let t = $('textarea[name=words]');
                    t.val(t.val() + '\n' + ds)
                }
                learnt.forEach(function (e) {
                    if (defs[e.content] && e.definition.search(defs[e.content]) == -1) {
                        let id = e.id;
                        $.ajax({
                            url: "http://www.shanbay.com/api/v1/bdc/learning/" + id,
                            type: 'PUT',
                            data: {id: id, definition: defs[e.content] + "\n" + e.definition},
                            dataType: 'JSON'
                        })
                    }
                });
//                if(nf.length>0) for (i=0;i<nf.length;i+=1)
//                    $.get("http://www.shanbay.com/bdc/sentence/add/?",{sentence:nf[i],definition:defs[i]})
            }
        });
    $('#add-status').html("添加完成");
}
$(function () {
    $('input[type=submit]').click(function () {
        if ($('#batch-add-hint').length == 0)
            $('form#add-learnings-form').after('<div id="batch-add-hint" class="notfounds"><h3>未添加成功单词会再次出现在上面文本框</h3><span id="add-status"></span> <ul>  </ul></div>');
        let t = $('textarea[name=words]');
        addBatch(t.val());
        t.val('');
        return false;
    });
    $('#maximum-amount-hint').text('每次最多可添1000词。若需添加释义，单词(or 句子)与释义间用英文逗号","隔开。');
    $('#begin-learning').click(function () {
        chrome.tabs.create({url: 'http://www.shanbay.com/bdc/review/'})
    });
    $('#batch-add').click(function () {
        chrome.tabs.create({url: 'http://www.shanbay.com/bdc/vocabulary/add/batch/'})
    });
    $('#options').click(function () {
        chrome.tabs.create({url: 'options.html'})
    })
});
