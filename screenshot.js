/* Takes a screenshot and uses it in a callback as a canvas */
takeScreenshot: function(callback) {
    chrome.extension.sendMessage({name: 'screenshot'}, function(response) {
        var data = response.screenshotUrl;
        var canvas = document.createElement('canvas');
        var img = new Image();
        img.onload = callback;
        img.src = data;
    });
}
