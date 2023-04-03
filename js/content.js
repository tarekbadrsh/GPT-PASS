function hide_notification() {
    var div = document.getElementById("notification-box")
    // remove the div element after 5 seconds
    setTimeout(function () {
        div.parentNode.removeChild(div);
    }, 2000);
}

function show_notification(request) {
    var div = document.createElement('div');
    // create a div element for the HTML
    div.setAttribute('id', 'notification-box');
    div.innerHTML = request.greeting;// 'YOUR HTML CODE HERE';

    // set the CSS properties for the div element
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.right = '0';
    div.style.zIndex = '9999';

    // append the div element to the body of the web page
    document.body.appendChild(div);

    hide_notification();
}

browser.runtime.onMessage.addListener((request) => {
    console.log("Message from the background script:");
    console.log(request.greeting);
    show_notification(request)
    return Promise.resolve({ response: "Hi from content script" });
});


// content script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "getSelectedText") {
        var selectedText = window.getSelection().toString();
        sendResponse({ selectedText: selectedText });
    }
});