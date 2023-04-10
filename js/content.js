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
    // const processedNodes = new Set();
    setCurrantUser();
    // processEmailNodes(processedNodes);
    // setInterval(() => processEmailNodes(processedNodes), 5000);
}
if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}

/*
// findEmailsInTextNode:



function findEmailsInDocument() {
    console.log("start findEmailsInDocument");
    const emailRegex = /[\w.-]+@[\w-]+\.[\w.-]+/g;
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const emailNodes = [];

    while (treeWalker.nextNode()) {
        const node = treeWalker.currentNode;
        const text = node.nodeValue;

        if (emailRegex.test(text)) {
            emailNodes.push(node);
            emailRegex.lastIndex = 0; // Reset regex index for the next test
        }
    }

    return emailNodes;
}


function processEmailNodes(processedNodes) {
    const emailRegex = /[\w.-]+@[\w-]+\.[\w.-]+/g;
    const allTextNodes = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = allTextNodes.nextNode())) {
        if (processedNodes.has(node)) {
            continue;
        }
        const text = node.nodeValue;
        if (emailRegex.test(text)) {
            processTextNode(node);
            processedNodes.add(node);
        }
    }
}

function processTextNode(textNode, processedNodes) {
    const emails = findEmailsInDocument(textNode);

    if (emails && emails.length > 0) {
        const span = document.createElement('span');
        const parent = textNode.parentNode;
        emails.forEach(email => {
            span.innerHTML += textNode.textContent.split(email)[0];
            span.innerHTML += email;

            const button = document.createElement("button");
            button.className = "gpt-pass-button";
            button.style.backgroundImage = 'url(' + browser.runtime.getURL('icons/icon96.png') + ')';
            button.style.backgroundSize = 'contain';
            button.style.width = '20px';
            button.style.height = '20px';
            button.style.border = 'none';
            button.style.cursor = 'pointer';

            parent.appendChild(span);
            parent.appendChild(button);

            textNode.textContent = textNode.textContent.split(email)[1];
        });
    }
}
*/