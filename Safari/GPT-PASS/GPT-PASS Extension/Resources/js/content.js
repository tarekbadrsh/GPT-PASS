/*
 * Optimized content.js for an extension
 */

// Generate a random birth date
function generateRandomBirthDate() {
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;
    const randomMonth = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const randomDay = (Math.floor(Math.random() * 25) + 1).toString().padStart(2, '0');
    return `${randomMonth}/${randomDay}/${randomYear}`;
}
class User {
    constructor(email, first_name, last_name) {
        this.status = "";
        this.tabId = "";
        this.facebookUrl = window.location.href;
        this.email = email;
        this.setPassword(this.email);
        this.first_name = first_name;
        this.last_name = last_name;
        this.setBirthDate();
        this.phone_number = "";
        this.smscode = "";
        this.activationId = "";
    }

    async setPassword(password) {
        this.password = await generateHash(password);
    }

    setBirthDate() {
        this.birth_date = generateRandomBirthDate();
    }
}

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

// Generate a hash for a given string
async function generateHash(str) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(digest));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex.slice(0, 16);
    } catch (err) {
        console.error(`Failed to generate hash: ${err}`);
        return null;
    }
}

const extractUser = async (text) => {
    let user = { email: "", password: "", first_name: "", last_name: "", birth_date: "", number: { phone_number: "NAN", smscode: "NAN", activationId: "NAN" } };
    const email = extractEmail(text);
    if (email) {
        user.email = email;
        user.birth_date = generateRandomBirthDate();
        user.password = await generateHash(user.email);
    }

    const user_name = extractUserNameFromAnchor();
    if (user_name) {
        const result = processUserName(user_name);
        user.first_name = result.first_name;
        user.last_name = result.last_name;
    }
    return user;
};

const addGptPassButton = async (span) => {
    try {
        span.classList.add("gpt-pass-spen");
        const button = document.createElement("button");
        button.classList.add("gpt-pass-button");

        button.addEventListener("click", async (e) => {
            const user = await extractUser(span.textContent);
            browser.runtime.sendMessage({ type: "user", user: user });
            console.log(user);
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
    const { autoSmsCheckbox = true } = await browser.storage.local.get("autoSmsCheckbox");

    if (!autoSmsCheckbox) {
        return;
    }

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

const handleFacebook = async () => {
    const spanElements = document.getElementsByTagName("span");

    for (const span of spanElements) {
        if (span.classList.contains("gpt-pass-spen")) {
            continue;
        }
        if (span.parentNode.classList.contains("gpt-pass-spen")) {
            continue;
        }
        if (emailInText(span.textContent)) {
            await addGptPassButton(span);
        }
    }
};

function simulateKeyPressAndRelease(targetElement, key, code, keyCode, which) {
    const keyDownEvent = new KeyboardEvent('keydown', { key, code, keyCode, which, bubbles: true, cancelable: true });
    targetElement.dispatchEvent(keyDownEvent);

    const keyUpEvent = new KeyboardEvent('keyup', { key, code, keyCode, which, bubbles: true, cancelable: true });
    targetElement.dispatchEvent(keyUpEvent);
}

function OpenAILastButton(textarea, username, autoCloseTab) {
    setInterval(() => {
        clickOnButton('.flex.w-full.items-center.justify-center.gap-2', 'Next');
        clickOnButton('.flex.w-full.items-center.justify-center.gap-2', 'Done', autoCloseTab);
    }, 200);
    textarea.value = `Hi ChatGPT my name is ${username}`;
    simulateKeyPressAndRelease(textarea, key = 'Enter', code = 'Enter', keyCode = 13, which = 13);
    clearInterval(intervals.openAI);
}

function fillInputIfEmpty(selector, value) {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        targetElement.value = value;
        targetElement.setAttribute("value", value);
    }
}

function clickOnButton(selector, text, closetab) {
    const buttonDivs = document.querySelectorAll(selector);
    let done = false;
    buttonDivs.forEach((buttonDiv) => {
        if (text) {
            const buttonText = buttonDiv.textContent.trim();
            if (buttonText === text) {
                buttonDiv.click();
                done = true;
            }
        } else {
            buttonDiv.click();
            done = true;
        }
        if (closetab && done) {
            browser.runtime.sendMessage({ type: "closeCurrentTab" });
        }
    });
}


async function handleOpenAI() {
    const { autoFillCheckbox = true, autoSmsCheckbox = true, currentUser = undefined, storage_phone = undefined, smscode = undefined, autoCloseTab = false } =
        await browser.storage.local.get(["autoFillCheckbox", "autoSmsCheckbox", "currentUser", "storage_phone", "smscode", "autoCloseTab"]);

    if (!autoFillCheckbox || !currentUser) {
        return;
    }
    fillInputIfEmpty('input[name="email"]', currentUser.email);
    fillInputIfEmpty('input[name="password"]', currentUser.password);
    fillInputIfEmpty('input[name="username"]', currentUser.email);
    fillInputIfEmpty('input[placeholder="First name"]', currentUser.first_name);
    fillInputIfEmpty('input[placeholder="Last name"]', currentUser.last_name);
    clickOnButton('.onb-resend-email-btn', null, autoCloseTab);

    if (autoSmsCheckbox && document.body.textContent.includes("Verify your phone number") && storage_phone && storage_phone.phone_number) {
        fillInputIfEmpty(".text-input.text-input-lg.text-input-full", storage_phone.phone_number);
    }

    if (autoSmsCheckbox && document.body.textContent.includes("Enter code") && storage_phone && storage_phone.phone_number && smscode) {
        fillInputIfEmpty(".text-input.text-input-lg.text-input-full", smscode);
    }
    const textarea = document.querySelector(`textarea.m-0.w-full.resize-none.border-0.bg-transparent.p-0.pr-7.focus\\:ring-0.focus-visible\\:ring-0.dark\\:bg-transparent.pl-2.md\\:pl-0`);
    if (textarea) {
        // click on welcome button.
        OpenAILastButton(textarea, currentUser.first_name, autoCloseTab);
    };
}



const intervals = {
    openAI: null,
    facebook: null,
    smsActivate: null,
};


function onDocumentLoad() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("openai.com")) {
        intervals.openAI = setInterval(handleOpenAI, 500);
    }

    if (currentUrl.includes("facebook.com")) {
        createStyleElement();
        intervals.facebook = setInterval(handleFacebook, 1000);
    }

    if (currentUrl.includes("sms-activate.org")) {
        intervals.smsActivate = setInterval(handleSmsActivate, 1000);
    }
}

if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}
