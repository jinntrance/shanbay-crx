shanbay-crx
===========
This is a Chrome extension for www.shanbay.com , which helps users learn English much more conveniently and more efficiently. 

Basic features include:

- Definition and etymology.
- Shortcuts on shanbay.com.
- Wordlist collection on any websites.

===========

扇贝助手增强版
=======

[扇贝网](http://www.shanbay.com)的Chrome扩展：

- 扇贝单词详细页面添加词根词缀([Online Etymology](http://www.etymonline.com) 或[Merriam Webster](http://www.dictionaryapi.com/) )，帮助记忆；
- 扇贝网记单词时添加键盘[快捷键](#shortcuts)；
- 任意网页查词并收藏到扇贝账户。

# 安装

### Chrome Web Store
访问 [扇贝助手增强版](https://chrome.google.com/webstore/detail/aibonellgbdkldghjgbnapgjblebfkbl/) 即可安装。

### 手动安装
如果你因为众所周知的某种原因无法访问*Chrome Web Store* ，可以按照如下方式安装和更新扩展。

1. 下载扩展压缩包 [zip](https://codeload.github.com/jinntrance/shanbay-crx/zip/master)，解压到某个文件夹，比如文件夹叫`shanbay-crx-master`；
2. 在Google Chrome 地址栏输入并访问 `chrome://extensions/`，确认选中了 "Developer Mode/开发者模式" 。
3. 选择 "Load Unpacked Extension"，并找到先前叫`shanbay-crx-master` 的文件夹。

# 功能

扇贝网用户使用：

1. 可以查找扇贝未提供的词源、简单派生、同义，若扇贝已有的词根和派生则不再额外显示。
2. 如果该词汇没有词源、派生，则默认不显示，节省空间。  
3. 添加全屏的快捷键W，背单词时空间更大。
4. 可以通过设置“选项”隐藏、显示中文释义C、英文G、词根E、派生X、例句M、笔记N区域。快捷键不区分大小写。
5. 词根可选择使用Etymology或是Webster Collegiate的。
6. 可方便设置，默认将词根收藏为笔记(快捷鍵T)、默认不显示中文释义。
7. 任意页面(非扇贝网站)查词、加入生词本,双击选词即可，查词组请划词选择右键选择“在扇贝网查找”。
8. 可选加入Webster全英文释义。

## Shortcuts

快捷键不区分大小写。

- 全局快捷键
    - W 全屏切换(Window)
- 背单词快捷键
    - T 添加词根到笔记noTes
    - Y 打开用Y户分享笔记, Z 作笔记、码字Z, 
    - 发音: A美音/B英音(拼写单词时请使用Alt+A/B)
    - 显示隐藏: C中文释义Chinese、G英文释义enGlish、M例句exaMple、N笔记Notes、E词根(Etymology)、X派生affiX
    - U,J,K,L分別可选1,2,3,4 
    - I太简单(Ignore)、O/o不认识(No)，U,J选择“认识”/“不认识”
    - 若觉着扇贝自带词根不全，可按Ctrl+q 再网上查词源、派生
    
## Webster App Key 注册

非常感谢之前用户的贡献，本Chrome 扩展有几个公用的keys，但每个key 在Webster 上有每天1000次查询的限制。
超过限制通常数天之后，Webster 官方会勒令封key，而且无法保证用公有keys 的用户仍然能够使用英文释义、词根等功能。

所以建议，特别是使用扇贝背单词的用户自己申请key，并在扩展设置中填写自己申请的key 。具体步骤如下：

- 选择官方注册链接[www.dictionaryapi.com](http://www.dictionaryapi.com/register/index.htm) 
- 以个人名义申请App Key ，所以需要填写个人相关注册信息。
    - Unique Users 可以尽量写大一些比如100000
    - Request API Key 写 `Collegiate Dictionary`
    - Company Name 写自己学校或公司即可
    - Application Name 任意写，比如`My app for English Learning`
    - Launch Date 随意写一个未来的时间，格式为月日年如 `02/12/2016`
    - Role/Occupation 填职业，根据自己情况填Student, Engineer etc.
- 选择最后的“同意协议”，并提交注册。
- 注册成功后，登录可在左面Account Info 中的"[My Keys](http://www.dictionaryapi.com/account/my-keys.htm)" 查看到自己的 `Key (Dictionary)` （这里实际上是用Collegiate Dictionary，其他key 暂不可用）。

## 添加新的字典

请开发者阅读此[说明](./js/dictionaries/README.md) 。

热忱欢迎有兴趣者一起完善。


## 捐赠

不少朋友之前提到捐赠以支持我持续开发及更新这个扩展。但是后来考虑到：

- 实际上用这个扩展的很多都是学生党。
- 通过支付宝或微信捐赠账户管理麻烦，及针对这个应用实际用户多少及捐赠不好统计。

于是乎，决定让大家把当前页面最下端的位置捐赠出来当作广告位：一者捐赠门槛也低，二者真正感兴趣才会点击（于本扩展用户及广告主双赢）。


<script type="text/javascript" src="http://www.josephjctang.com/assets/js/analytics.js" async="async"></script>

<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<!-- 扇贝页面 -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-7339457836147536"
     data-ad-slot="5639662152"
     data-ad-format="auto"></ins>
<script>
(adsbygoogle = window.adsbygoogle || []).push({});
</script>



