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



function validateEmail(email) {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
}

function extractUserEmail(input) {
    let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = input.match(emailRegex);
    if (emails && emails.length > 0 && validateEmail(emails[0])) {
        return emails[0];
    }
    console.error(`Can't find email in the input: ${input}`);
    return null;
}

// findEmailsInTextNode:
function findEmail(text) {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(text);
}

function processUsername(username) {
    // Trim the username
    username = username.trim();

    // Split the username into first and last names
    let first_name, last_name;
    const spaceIndex = username.indexOf(" ");
    if (spaceIndex !== -1) {
        first_name = username.slice(0, spaceIndex);
        last_name = username.slice(spaceIndex + 1);
    } else {
        first_name = username;
        last_name = "AI";
    }
    return { "first_name": first_name, "last_name": last_name };
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

function extractUserName() {
    const anchorElements = document.getElementsByTagName("a");
    for (const anchor of anchorElements) {
        if (anchor.textContent === "View profile") {
            const parentDiv = findParentDiv(anchor);

            if (parentDiv) {
                const username = parentDiv.firstElementChild.textContent;
                return username;
            }
        }
    }
    console.error(`Can't find user_name in the input: ${input}`);
    return null;
}

function extractUser(text) {
    let user = { email: "", password: "", first_name: "", last_name: "", birth_date: "" };
    const email = extractUserEmail(text);
    if (email) {
        user.email = email;
    }
    const user_name = extractUserName();
    if (user_name) {
        const result = processUsername(user_name);
        user.first_name = result.first_name;
        user.last_name = result.last_name;
    }
    return user;
}

function modifySpan(span) {
    span.classList.add("gpt-pass-spen");
    const button = document.createElement("button");
    button.classList.add("gpt-pass-button");

    button.addEventListener("click", (e) => {
        const user = extractUser(span.textContent);
        browser.runtime.sendMessage({ type: "user", user: user });
    });
    span.appendChild(button);
}

function isSixDigitNumber(value) {
    const regex = /^\d{6}$/;
    return regex.test(value);
}

function handleSmsActivate() {
    const phoneElement = document.querySelector('.activate-grid-item__numberq');
    if (phoneElement) {
        const htmlBlock = phoneElement.innerHTML;
        const regex = /<b>(\+\d{2}\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2})<\/b>/;
        const matches = htmlBlock.match(regex);
        if (matches && matches[1]) {
            const phone_number = matches[1].replace(/\D+/g, '');
            if (true) {
                let phone = { "phone_number": phone_number, count_of_use: 0 }
                browser.storage.local.set({ phone: phone }).catch(function (err) {
                    console.error(`Error set phone_number: ${err}`);
                });
                console.log("phone number : ", phone_number);
            }
        }
    }

    const smscodeElement = document.querySelector('.underline-orange.cursor-pointer');
    if (smscodeElement) {
        const smscode = smscodeElement.textContent;
        if (isSixDigitNumber(smscode)) {
            browser.storage.local.set({ "smscode": smscode }).catch(function (err) {
                console.error(`Error set smscode: ${err}`);
            });
            console.log("smscode : ", smscode);
        }
    }
}

function handleFacebook() {
    const spanElements = document.getElementsByTagName("span");

    for (const span of spanElements) {
        if (span.classList.contains("gpt-pass-spen")) {
            continue;
        }

        if (span.parentNode.classList.contains("gpt-pass-spen")) {
            continue;
        }

        if (findEmail(span.textContent)) {
            modifySpan(span);
        }
    }
}

function handleOpenAI() {
    browser.storage.local.get("autoFillCheckbox").then(result => {
        let autoFillCheckbox = result.autoFillCheckbox || true;
        if (autoFillCheckbox) {
            browser.storage.local.get('currentUser').then(result => {
                let user = result.currentUser || { email: "", password: "", first_name: "", last_name: "", birth_date: "" };
                console.log(user);

                // Locate the email input and set its value
                let usernameInput = document.querySelector('input[name="username"]');
                if (usernameInput && usernameInput.value.length < 1) {
                    usernameInput.value = user.email;
                }
                let emailInput = document.querySelector('input[name="email"]');
                if (emailInput && emailInput.value.length < 1) {
                    emailInput.value = user.email;
                }
                // Locate the password input and set its value (assuming there's an input with the name "password")
                let passwordInput = document.querySelector('input[name="password"]');
                if (passwordInput && passwordInput.value.length < 1) {
                    passwordInput.value = user.password;
                }

                const firstNameInput = document.querySelector('input[placeholder="First name"]');
                if (firstNameInput && firstNameInput.value.length < 1) {
                    firstNameInput.value = user.first_name;
                    firstNameInput.setAttribute('value', user.first_name);
                }

                const lastNameInput = document.querySelector('input[placeholder="Last name"]');
                if (lastNameInput && lastNameInput.value.length < 1) {
                    lastNameInput.value = user.last_name;
                    lastNameInput.setAttribute('value', user.last_name);
                }

                // Check if the page has the text "Verify your phone number"
                const phoneNumberPage = document.body.textContent.includes("Verify your phone number");
                if (phoneNumberPage) {
                    // Select the phone number text box on this page
                    const phonenmbertxt = document.querySelector('.text-input.text-input-lg.text-input-full');
                    // If the phone number text box is present, set its value to user.phonenumber
                    if (phonenmbertxt && phonenmbertxt.value.length < 1) {
                        browser.storage.local.get("phone").then(result => {
                            if (result.phone) {
                                let phone = result.phone;
                                phonenmbertxt.value = phone.phone_number;
                                phone.count_of_use = phone.count_of_use + 1;
                                if (phone.count_of_use == 2) {
                                    browser.storage.local.remove("phone");
                                }
                            }
                        }).catch(function (err) {
                            console.error(`Error get phone_number: ${err}`);
                        });
                    }
                }

                // Check if the page has the text "Enter code"
                const codePage = document.body.textContent.includes("Enter code");
                if (codePage) {
                    // Select the code text box on this page
                    const codetxt = document.querySelector('.text-input.text-input-lg.text-input-full');
                    // If the code text box is present, set its value to user.code
                    if (codetxt && codetxt.value.length < 1) {
                        browser.storage.local.get("smscode").then(result => {
                            if (result.smscode) {
                                codetxt.value = result.smscode;
                                browser.storage.local.remove("smscode");
                            }
                        }).catch(function (err) {
                            console.error(`Error get smscode: ${err}`);
                        });
                    }
                }

            }).catch(function (err) {
                console.error(`Error get currentUser: ${err}`);
            });
        }
    }).catch(function (err) {
        console.error(`Error get autoFillCheckbox: ${err}`);
    });

}

function onDocumentLoad() {
    // Get the current URL
    const currentUrl = window.location.href;
    // Check if the current URL includes "platform.openai.com"
    if (currentUrl.includes("openai.com") || currentUrl.includes("openai.com")) {
        setInterval(function () {
            handleOpenAI();
        }, 500);
    }

    // Check if the current URL includes "facebook.com"
    if (currentUrl.includes("facebook.com")) {
        // get data from facebook
        setInterval(function () {
            handleFacebook();
        }, 1000);
    }

    // Check if the current URL includes "sms-activate.org"
    if (currentUrl.includes("sms-activate.org")) {
        // get data from facebook
        setInterval(function () {
            handleSmsActivate();
        }, 1000);
    }
}

if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}