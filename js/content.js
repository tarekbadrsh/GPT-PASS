// function hide_notification() {
//     var div = document.getElementById("notification-box")
//     // remove the div element after 5 seconds
//     setTimeout(function () {
//         div.parentNode.removeChild(div);
//     }, 2000);
// }

// function show_notification(request) {
//     var div = document.createElement('div');
//     // create a div element for the HTML
//     div.setAttribute('id', 'notification-box');
//     div.innerHTML = request.greeting;// 'YOUR HTML CODE HERE';

//     // set the CSS properties for the div element
//     div.style.position = 'fixed';
//     div.style.bottom = '0';
//     div.style.right = '0';
//     div.style.zIndex = '9999';

//     // append the div element to the body of the web page
//     document.body.appendChild(div);

//     hide_notification();
// }

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
        let usernameInput = document.querySelector('input[name="username"]');
        if (usernameInput) {
            usernameInput.value = user.email;
        }
        let emailInput = document.querySelector('input[name="email"]');
        if (emailInput) {
            emailInput.value = user.email;
        }
        // Locate the password input and set its value (assuming there's an input with the name "password")
        let passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput) {
            passwordInput.value = user.password;
        }
    });
}


function onDocumentLoad() {
    setCurrantUser();
    setInterval(() => processSpanElements(), 2000);
}
if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}

// findEmailsInTextNode:
function isEmail(text) {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(text);
}


function onButtonClick(e) {
    e.stopPropagation(); // Prevents click event from bubbling up
    console.log("Red button clicked");
    // You can add your function here later.
}

function modifySpan(span) {
    span.classList.add("gpt-pass-spen");

    const button = document.createElement("button");
    button.style.backgroundColor = "red";
    button.style.border = "none";
    button.style.borderRadius = "50%";
    button.style.color = "white";
    button.style.fontSize = "20px";
    button.style.padding = "0";
    button.style.width = "20px";
    button.style.height = "20px";
    button.style.marginLeft = "5px";
    button.style.cursor = "pointer";

    button.addEventListener("click", (e) => {
        const email = span.textContent;
        browser.runtime.sendMessage({ email: email });
    });

    span.appendChild(button);
}

function processSpanElements() {
    const spanElements = document.getElementsByTagName("span");

    for (const span of spanElements) {
        if (span.classList.contains("gpt-pass-spen")) {
            continue;
        }

        if (span.parentNode.classList.contains("gpt-pass-spen")) {
            continue;
        }

        if (isEmail(span.textContent)) {
            modifySpan(span);
        }
    }
}