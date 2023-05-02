/*
 * Content.js for a Firefox extension
 */

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
    console.error(`Cannot find email in the input: ${text}`);
    return null;
};

const emailInText = (text) => {
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(text);
};

function processUserName(username) {
    username = username.trim();
    let first_name, last_name;
    const spaceIndex = username.indexOf(" ");
    if (spaceIndex !== -1) {
        first_name = username.slice(0, spaceIndex);
        last_name = username.slice(spaceIndex + 1);
    } else {
        first_name = username;
        last_name = "AI";
    }
    return { first_name, last_name };
}

const findParentDiv = (element) => {
    while (element.parentElement) {
        element = element.parentElement;
        if (element.tagName.toLowerCase() === "div") {
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
    console.error("Cannot find username in the input");
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
        console.error(`Error sending user: ${err}`);
    }
};

const isSixDigitNumber = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
};

async function handleSmsActivate() {
    const phoneElement = document.querySelector(".activate-grid-item__numberq");
    if (!phoneElement) {
        return;
    }
    const phone_number = phoneElement.innerText.replace(/\D/g, "");
    let { storage_phone = { phone_number: "", count_of_use: 0 } } = await browser.storage.local.get("storage_phone");
    if (storage_phone.phone_number !== phone_number) {
        await browser.storage.local.set({ smscode: undefined });
        storage_phone = { phone_number: phone_number, count_of_use: 0 };
        await browser.storage.local.set({ storage_phone });
    }
    const smscodeElement = document.querySelector(".underline-orange.cursor-pointer");
    if (smscodeElement) {
        if (isSixDigitNumber(smscodeElement.textContent)) {
            await browser.storage.local.set({ smscode: smscodeElement.textContent });
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

function fillInputIfEmpty(selector, value) {
    const inputElement = document.querySelector(selector);
    if (inputElement && inputElement.value.length < 1) {
        inputElement.value = value;
        inputElement.setAttribute("value", value);
    }
}

async function handleOpenAI() {
    const { autoFillCheckbox = true, currentUser = undefined, storage_phone = undefined, smscode = undefined } = await browser.storage.local.get(["autoFillCheckbox", "currentUser", "storage_phone", "smscode"]);

    if (!autoFillCheckbox || !currentUser) {
        return;
    }

    fillInputIfEmpty('input[name="username"]', currentUser.email);
    fillInputIfEmpty('input[name="email"]', currentUser.email);
    fillInputIfEmpty('input[name="password"]', currentUser.password);
    fillInputIfEmpty('input[placeholder="First name"]', currentUser.first_name);
    fillInputIfEmpty('input[placeholder="Last name"]', currentUser.last_name);

    if (document.body.textContent.includes("Verify your phone number") && storage_phone && storage_phone.phone_number) {
        fillInputIfEmpty(".text-input.text-input-lg.text-input-full", storage_phone.phone_number);
    }

    if (document.body.textContent.includes("Enter code") && storage_phone && storage_phone.phone_number && smscode) {
        fillInputIfEmpty(".text-input.text-input-lg.text-input-full", smscode);
        await browser.storage.local.set({ smscode: undefined });
        storage_phone.count_of_use++;

        if (storage_phone.count_of_use == 2) {
            await browser.storage.local.set({ storage_phone: undefined });
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
