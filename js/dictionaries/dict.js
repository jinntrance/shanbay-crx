/**
 * @user Joseph
 */

function findDerivatives() {
    var originalTerm = getCurrentTerm();
    if(ls()['dict'] == 'webster') {
        // 设置使用Webster 字典
        getOnlineWebsterCollegiate(originalTerm, function (word, json) {
            if (getCurrentTerm() == originalTerm) {
                showDerivatives(originalTerm, word, json);
            }
        });
    } else if (ls()['dict'] == 'oxford'){
        // 设置使用Oxford 字典
        //TODO add oxford dictionary here
    }
}
