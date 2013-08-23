/**
 * @author Joseph
 */

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
        sendResponse({data: localStorage});
    else if (request.method == "setLocalStorage") {
        window.localStorage=request.data;
        sendResponse({data: localStorage})
    }
    else
        sendResponse({data:[]}); // snub them.
});
