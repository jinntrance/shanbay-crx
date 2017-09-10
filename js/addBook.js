/**
 * 添加单词书
 * @user Joseph
 */

$(function () {
    if ($('a.btn-add-new-unit').length > 0) {
        $('.btn-add-new-unit-container').append('<a href="javascript:void(0)" class="btn btn-primary btn-add-new-book">添加全书</a>').
            append('<a href="javascript:void(0)" id="btn-delete-all-book" class="btn btn-primary">删除全部单元</a>').
            append('<div id="add-new-book-container" style="display: none"><div id="wordbook-subscribe-hint"><p>* 可将全部单词列入下框，每行一个单词（也可在每行单词后加上中文释义，但需要用英文逗号隔开）。扇贝未收录单词将出现在如下文本框中。若需添加单词释义，请完成添加单词书并收藏后，到<a href="/bdc/vocabulary/add/batch/">批量添加单词</a>处添加</p></div><textarea id="add-new-book" rows="15"></textarea><a href="javascript:void(0)" class="btn btn-primary cfm-add-new-book">确认添加</a><span id="add-status"></span></div>')
    }
    $(document).on('click', "a.btn-add-new-book", function () {
        $('#add-new-book-container').toggle()
    }).on('click', 'a#btn-delete-all-book', function () {
        $('a.btn-delete-unit').each(function () {
            $.ajax({
                type: "DELETE",
                url: "http://www.shanbay.com/api/v1/wordbook/wordlist/" + $(this).attr('unit-id')
            });
            $(this).parents('.wordbook-containing-wordlist').remove();
        })
    }).on('click', 'a.cfm-add-new-book', function () {
        let $add = $('#add-new-book');
        let lines = $add.val().trim().split('\n');
        $add.val('');
        if (lines.length > 0) {
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
            let s = words;
            let all = s.length;
            let len = Math.ceil(s.length / 200);
            let book_id = location.href.split('/')[4];
            let size = $('td.wordbook-wordlist-name a').size();
            let init = 0;
            if (size > 0) {
                let list = $('td.wordbook-wordlist-name a')[size - 1].innerHTML;
                if (-1 < list.search("list ")) {
                    let num = list.substr(5);
                    init = num++
                }
            }
            $('#add-status').html("添加中...");
            for (let i = init + 1; i <= init + len; i++) {
                let li = "http://www.shanbay.com/api/v1/wordbook/wordlist/";
                let word_num = all < i * 200 ? all - (i - 1) * 200 : 200;
                $.ajax({
                    type: "POST",
                    url: li,
                    dataType: "json",
                    async: false,
                    data: {
                        name: "list " + i,
                        description: word_num + " words",
                        wordbook_id: book_id
                    },
                    success: function (resp) {
                        data = resp.data;
                        let li_id = data.wordlist.id;
                        let index = data.wordlist.name.split(' ')[1]++;
                        let words = s.slice((index - 1) * 200, index * 200);
                        words.forEach(function (e) {
                            $.ajax({
                                type: "POST",
                                async: false,
                                url: 'http://www.shanbay.com/api/v1/wordlist/vocabulary/',
                                dataType: "json",
                                data: {id: li_id, word: e},
                                success: function (data) {
                                    if (404 == data.status_code) {
                                        console.log(e);
                                        if (defs[e])
                                            $add.val($add.val() + e + "," + defs[e] + '\n');
                                        else $add.val($add.val() + e + '\n')
                                    } else {
                                        if (defs[e] && data.data.vocabulary.definition.search(defs[e]) == -1) {
                                            let id = e.id;
                                            $.ajax({
                                                url: "http://www.shanbay.com/wordlist/vocabulary/definition/edit/",
                                                type: 'POST',
                                                data: {
                                                    vocabulary_id: data.data.vocabulary.id,
                                                    wordlist_id: li_id,
                                                    definition: defs[e] + "\n" + data.data.vocabulary.definition
                                                },
                                                dataType: 'JSON'
                                            })
                                        }
                                    }
                                }
                            });
                        })
                    }
                });
            }
            $('#add-status').html("添加完成")
        }
    })
});
