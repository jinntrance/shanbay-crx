/**
 * 词典添加和配置
 * @user Joseph
 */



function findDerivatives(callback) {
    if(ls()['dict'] == 'webster') {
        // 设置使用Webster 字典
        getOnlineWebsterCollegiate(originalTerm, function (word, json) {
            callback({
                data: {
                    originalTerm: originalTerm,
                    word: word,
                    json: json
                }
            });
        });
    } else if (ls()['dict'] == 'oxford'){
        // 设置使用Oxford 字典
        //TODO add oxford dictionary here
    }
}
