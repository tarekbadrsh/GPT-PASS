const createStyleElement = () => {
    const style = document.createElement("style");
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
    document.head.appendChild(style);
};

const getSelectedText = (request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        const selectedText = window.getSelection().toString();
        sendResponse({ selectedText });
    }
};

const isEmailValid = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
};

const extractEmail = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0 && isEmailValid(emails[0])) {
        return emails[0];
    }
    console.error(`Can't find email in the input: ${text}`);
    return null;
};

const emailInText = (text) => {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(text);
};

function processUserName(username) {
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

const findParentDiv = (element) => {
    while (element.parentElement) {
        element = element.parentElement;
        if (element.tagName.toLowerCase() === 'div') {
            return element;
        }
    }
    return null;
};

const extractUserNameFromAnchor = () => {
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
};

const extractUserFromText = (text) => {
    let user = { email: "", password: "", first_name: "", last_name: "", birth_date: "" };
    const email = extractEmail(text);
    if (email) {
        user.email = email;
    }

    const user_name = extractUserNameFromAnchor();
    if (user_name) {
        const result = processUserName(user_name);
        user.first_name = result.first_name;
        user.last_name = result.last_name;
    }
    return user;
};

const addGptPassButton = (span) => {
    try {
        span.classList.add("gpt-pass-spen");
        const button = document.createElement("button");
        button.classList.add("gpt-pass-button");

        button.addEventListener("click", (e) => {
            const user = extractUserFromText(span.textContent);
            browser.runtime.sendMessage({ type: "user", user: user });
        });
        span.appendChild(button);
    } catch (err) {
        console.error(`Error send user: ${err}`);
    }
};

const isSixDigitNumber = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
};

async function handleSmsActivate() {

    const phoneElement = document.querySelector('.activate-grid-item__numberq');
    if (!phoneElement) {
        return
    }
    const phone_number = phoneElement.innerText.replace(/\D/g, '');
    let { storage_phone = { phone_number: "", count_of_use: 0 } } = await browser.storage.local.get("storage_phone");
    if (storage_phone.phone_number != phone_number) {
        browser.storage.local.set({ "smscode": "" })
        storage_phone = { phone_number: phone_number, count_of_use: 0 }
        browser.storage.local.set({ storage_phone });
    }
    const smscodeElement = document.querySelector('.underline-orange.cursor-pointer');
    if (smscodeElement) {
        if (isSixDigitNumber(smscodeElement.textContent)) {
            browser.storage.local.set({ "smscode": smscodeElement.textContent });
        }
    }
};

const handleFacebook = () => {
    const spanElements = document.getElementsByTagName("span");

    for (const span of spanElements) {
        if (span.classList.contains("gpt-pass-spen")) {
            continue;
        }
        if (span.parentNode.classList.contains("gpt-pass-spen")) {
            continue;
        }
        if (emailInText(span.textContent)) {
            addGptPassButton(span);
        }
    }
};

async function handleOpenAI() {
    let { autoFillCheckbox = true } = await browser.storage.local.get("autoFillCheckbox");
    if (!autoFillCheckbox) { return }
    let { currentUser = { email: "", password: "", first_name: "", last_name: "", birth_date: "" } } = await browser.storage.local.get('currentUser');
    if (currentUser) {
        // Locate the email input and set its value
        let usernameInput = document.querySelector('input[name="username"]');
        if (usernameInput && usernameInput.value.length < 1) {
            usernameInput.value = currentUser.email;
        }
        let emailInput = document.querySelector('input[name="email"]');
        if (emailInput && emailInput.value.length < 1) {
            emailInput.value = currentUser.email;
        }
        // Locate the password input and set its value (assuming there's an input with the name "password")
        let passwordInput = document.querySelector('input[name="password"]');
        if (passwordInput && passwordInput.value.length < 1) {
            passwordInput.value = currentUser.password;
        }

        const firstNameInput = document.querySelector('input[placeholder="First name"]');
        if (firstNameInput && firstNameInput.value.length < 1) {
            firstNameInput.value = currentUser.first_name;
            firstNameInput.setAttribute('value', currentUser.first_name);
        }

        const lastNameInput = document.querySelector('input[placeholder="Last name"]');
        if (lastNameInput && lastNameInput.value.length < 1) {
            lastNameInput.value = currentUser.last_name;
            lastNameInput.setAttribute('value', currentUser.last_name);
        }

        // Check if the page has the text "Verify your phone number"
        let { storage_phone = { phone_number: null, count_of_use: 0 } } = await browser.storage.local.get("storage_phone");
        const phoneNumberPage = document.body.textContent.includes("Verify your phone number");
        if (phoneNumberPage && storage_phone.phone_number) {
            // Select the phone number text box on this page
            const phonenmbertxt = document.querySelector('.text-input.text-input-lg.text-input-full');
            if (phonenmbertxt && phonenmbertxt.value.length < 1) {
                phonenmbertxt.value = storage_phone.phone_number;
            }
        }

        let { smscode = "" } = await browser.storage.local.get("smscode");
        // Check if the page has the text "Enter code"
        const codePage = document.body.textContent.includes("Enter code");
        if (codePage && storage_phone.phone_number && smscode) {
            // Select the code text box on this page
            const codetxt = document.querySelector('.text-input.text-input-lg.text-input-full');
            // If the code text box is present, set its value to user.code
            if (codetxt && codetxt.value.length < 1) {
                codetxt.value = smscode;
                browser.storage.local.set({ "smscode": "" });
                storage_phone.count_of_use++;
                if (storage_phone.count_of_use == 2) {
                    browser.storage.local.set({ "storage_phone": "" });
                }
            }
        }
    }
};

function onDocumentLoad() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("openai.com")) {
        setInterval(handleOpenAI, 500);
    }

    if (currentUrl.includes("facebook.com")) {
        createStyleElement();
        setInterval(handleFacebook, 1000);
    }

    if (currentUrl.includes("sms-activate.org")) {
        setInterval(handleSmsActivate, 1000);
    }
}

if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}