// Create a style element
const style = document.createElement("style");

// Set the CSS rules for the button
style.textContent = `
  button:focus {
    outline: none;
  }

  button:active {
    background-color: green;
  }

  .gpt-pass-button {
    background-color: red;
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    font-size: 20px;
    height: 20px;
    margin-left: 5px;
    padding: 0;
    width: 20px;
  }
`;

// Add the style element to the page
document.head.appendChild(style);

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
    }).catch(function (err) {
        console.error(`Error get currentUser: ${err}`);
    });
}

function onDocumentLoad() {
    browser.storage.local.get("autoFillCheckbox").then(result => {
        let autoFillCheckbox = result.autoFillCheckbox || false;
        if (autoFillCheckbox) {
            setCurrantUser();
        }
    }).catch(function (err) {
        console.error(`Error get autoFillCheckbox: ${err}`);
    });
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

function modifySpan(span) {
    span.classList.add("gpt-pass-spen");
    const button = document.createElement("button");
    button.classList.add("gpt-pass-button");
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