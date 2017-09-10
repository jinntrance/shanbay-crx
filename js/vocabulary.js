/**
 * 批量添加单词
 * @user Joseph
 **/

$(function () {

    $(document).on('click', '.learning .master', function () {
        let review_id = $(this).parents('.learning').attr('id').split('-')[1];
        let $d = $(this);
        $d.html('<span class="loading">&nbsp;</span>');
        resolveLearning(review_id, show_msg($d));
        function show_msg(d) {
            $('#learning-' + review_id).find('.msg').show();
            d.hide();
            setTimeout(function () {
                $('#learning-' + review_id).find('.msg').fadeOut();
            }, 2000)
        }
    });
    $(document).on('click', '.learning .set-not-hard', function () {
        let review_id = $(this).parents('.learning').attr('id').split('-')[1];
        let $d = $(this);
        $d.html('<span class="loading">&nbsp;</span>');
        setLearningReviewTimes(review_id, show_msg($d));
        function show_msg(d) {
            $('#learning-' + review_id).find('.msg').show();
            d.hide();
            setTimeout(function () {
                $('#learning-' + review_id).find('.msg').fadeOut();
                d.parent().parent().slideUp();
            }, 1000)
        }
    });
    $(document).on('click', '.learning .fail', function () {
        let review_id = $(this).parents('.learning').attr('id').split('-')[1];
        let $d = $(this);
        $d.html('<span class="loading">&nbsp;</span>');
        failLearning(review_id, show_msg($d));
        function show_msg(d) {
            $('#learning-' + review_id).find('.msg').show();
            d.hide();
            setTimeout(function () {
                $('#learning-' + review_id).find('.msg').fadeOut();
            }, 2000)
        }
    });
    $(document).on('click', '.learning .delete', function () {
        let $delete_trigger = $(this);
        $delete_trigger.siblings('.delete-confirm').show().click(function () {
            let review_id = $(this).parents('.learning').attr('id').split('-')[1];
            let url = get_url("delete_learning", {"learning_id": review_id});
            let $d = $(this);
            $d.html('<span class="loading">&nbsp;</span>');
            $.get(url, function (data) {
                $('#learning-' + review_id).find('.msg').show();
                $d.hide();
                setTimeout(function () {
                    $('#learning-' + review_id).remove();
                }, 1000)
            })
        });
    });
    let originUrl = window.location.href;
    currentPage = 1;
    let url = originUrl.split("page=")[0];
    if (originUrl.indexOf('page=') > 0)
        currentPage = originUrl.match(/page=(\d+)/)[1]++;
    else url += '?';
    let lis = $('.pagination li a.endless_page_link');
    let lastPage = lis[lis.length - 2].textContent++;
    let loading = false;
    $(window).scroll(function () {
        if (!loading && currentPage < lastPage && $(window).scrollTop() > $(document).height() - $(window).height() - 100) {
            loading = true;
            currentPage += 1;
            let currentUrl = url + "page=" + currentPage;
            $.get(currentUrl, function (data) {
                let added = $(data).find('.learning');
                if ('yes' == ls()['skip_easy']) added = $(data).find('.learning:has(span.setmaster,span.set-not-hard)');
                if (0 < added.length) {
                    $('.learning').last().after(added);
                    $(".pagination li.active a").text('当前第' + currentPage + '页').attr('href', currentUrl)
                }
            });
            loading = false;
        }
    });
});

function resolveLearning(learning_id, callback, params) {
    $.get('/learning/resolve/' + learning_id + '/', function (data) {
        if (callback) {
            callback.apply(undefined, params);
        }
    })
}
