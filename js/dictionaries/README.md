## 单词来源接口

包含：

- 音标
- 英文释义
- 词根、词缀

解析后单个单词对应的数据格式WORD 如后：

```json
{
    derivatives: 派生词,
    syns: 近义词,
    roots: 词根词源,
    fls: 词性,
    defs: 单词定义,
    hw: 带音节划分的词如list*less,
    ew: 单词
} 
```

## 解析单词的函数

[common.js] 中，获取及解析Webster 及Etymology 词源的两个函数。

```javascript
function getOnlineWebsterCollegiate(term, callback)
function getOnlineEtymology(term, callback)
```

其中回调函数格式：callback(term, json)，term 为查询单词，json 为解析后如上面格式WORD 的数据对象。

# 添加新的字典

- 在[common.js] 中添加如上格式的的解析函数F ，并将数据存在格式为WORD 的对象中。
- 在设置页面 [options.html](../options.html) 的“Web Dictionary 使用” 处，添加对应的词典设置
- 在[dict.js](./dict.js) 中添加对应设置后F 函数的调用。

[common.js]: ../common.js
