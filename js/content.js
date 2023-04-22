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

function getRandomBirthDate() {
    // Generate a random year within the specified range
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;

    // Generate a random month (1 to 12)
    const randomMonth = Math.floor(Math.random() * 12) + 1;

    // Generate a random day, considering the number of days in each month
    const randomDay = Math.floor(Math.random() * 25) + 1;;

    // Return the random birth date as a string in the format 'MM/DD/YYYY'
    return `${randomMonth.toString().padStart(2, '0')}/${randomDay.toString().padStart(2, '0')}/${randomYear}`;
}

function setCurrantUser() {
    browser.storage.local.get('currentUser').then(result => {
        let user = result.currentUser || { email: "", password: "", first_name: "", last_name: "", birth_date: "" };
        console.log(user);

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
        setInterval(function () {
            const firstNameInput = document.querySelector('input[placeholder="First name"]');
            if (firstNameInput) {
                firstNameInput.value = user.first_name;
                firstNameInput.setAttribute('value', user.first_name);
            }

            const lastNameInput = document.querySelector('input[placeholder="Last name"]');
            if (lastNameInput) {
                lastNameInput.setAttribute('value', user.last_name);
                simulateUserTyping(lastNameInput, user.last_name);
            }
        }, 1000);


        var interval = setInterval(function () {
            const birthdateInput = document.querySelector('input[placeholder="Birthday (MM/DD/YYYY)"]');
            if (birthdateInput) {
                birthdateInput.value = user.birth_date
                birthdateInput.setAttribute('value', user.birth_date);
            }
            clearInterval(interval);
        }, 1000);

    }).catch(function (err) {
        console.error(`Error get currentUser: ${err}`);
    });
}

function onDocumentLoad() {
    // Get the current URL
    const currentUrl = window.location.href;
    // Check if the current URL includes "platform.openai.com"
    if (currentUrl.includes("platform.openai.com") || currentUrl.includes("auth0.openai.com")) {
        browser.storage.local.get("autoFillCheckbox").then(result => {
            let autoFillCheckbox = result.autoFillCheckbox || true;
            if (autoFillCheckbox) {
                setCurrantUser();
            }
        }).catch(function (err) {
            console.error(`Error get autoFillCheckbox: ${err}`);
        });
    }

    // Check if the current URL includes "platform.openai.com"
    if (currentUrl.includes("facebook.com")) {
        // get data from facebook
        setInterval(function () {
            processSpanElements();
            processAnchorElements();
        }, 2000);
    }
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
        browser.runtime.sendMessage({ type: "email", email: email });
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

// findUserNameInDivNode:
function findParentDiv(element) {
    while (element.parentElement) {
        element = element.parentElement;
        if (element.tagName.toLowerCase() === 'div') {
            return element;
        }
    }
    return null;
}

function processAnchorElements() {
    const anchorElements = document.getElementsByTagName("a");

    for (const anchor of anchorElements) {
        if (anchor.textContent === "View profile") {
            const parentDiv = findParentDiv(anchor);

            if (parentDiv) {
                const username = parentDiv.firstElementChild.textContent;
                browser.runtime.sendMessage({ type: "username", username: username });
            }
        }
    }
}