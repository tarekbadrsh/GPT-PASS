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

function setCurrantUser() {
    browser.storage.local.get('currentUser').then(result => {
        let user = result.currentUser || { password: "", email: "" };
        console.log(`Current user: ${user.email}`);

        // Locate the email input and set its value
        let emailInput = document.querySelector('input[name="username"]');
        if (emailInput) {
            emailInput.value = user.email;
        } else {
            let emailInput = document.querySelector('input[name="email"]');
            emailInput.value = user.email;
        }
        // Locate the password input and set its value (assuming there's an input with the name "password")
        let passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput) {
            passwordInput.value = user.password;
        }
    });
}

if (document.readyState === "complete") {
    setCurrantUser();
} else {
    window.addEventListener("load", setCurrantUser);
}
