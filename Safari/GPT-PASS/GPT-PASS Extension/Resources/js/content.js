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
    constructor(facebookUrl, instagramUrl, email, first_name, last_name) {
        this.status = "";
        this.tabId = "";
        this.facebookUrl = facebookUrl;
        this.instagramUrl = instagramUrl;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.setBirthDate();
        this.phone_number = "";
        this.smscode = "";
        this.activationId = "";
    }

    async SetPassword() {
        this.password = await generateHash(this.email);
    }

    setBirthDate() {
        this.birth_date = generateRandomBirthDate();
    }
}

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

const findParentDiv = (element) => {
    while (element.parentElement) {
        element = element.parentElement;
        if (element.tagName.toLowerCase() === "div") {
            return element;
        }
    }
    return null;
};

function processUserName() {
    const anchorElements = document.getElementsByTagName("a");
    let first_name = "GPT";
    let last_name = "AI";
    let instagramUrl = "instagram.com";

    for (const anchor of anchorElements) {
        if (anchor.textContent === "View profile") {
            instagramUrl = anchor.href; // To get the link from the anchor tag
            const parentDiv = findParentDiv(anchor);
            if (parentDiv) {
                const username = parentDiv.firstElementChild.textContent;
                const spaceIndex = username.indexOf(" ");
                if (spaceIndex !== -1) {
                    first_name = username.slice(0, spaceIndex);
                    last_name = username.slice(spaceIndex + 1);
                } else {
                    first_name = username;
                }
            }
            return { instagramUrl, first_name, last_name };
        }
    }

    console.error("Cannot find username in the input");
    return null;
}

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
    const email = extractEmail(text);
    const user_name = processUserName();
    let user = new User(window.location.href, user_name.instagramUrl, email, user_name.first_name, user_name.last_name);
    await user.SetPassword();
    return user;
};

const addGptPassButton = async (span) => {
    try {
        span.classList.add("gpt-pass-spen");
        const button = document.createElement("button");
        button.classList.add("gpt-pass-button");

        button.addEventListener("click", async (e) => {
            const user = await extractUser(span.textContent);
            await browser.runtime.sendMessage({ type: "user", user: user });
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

    let phoneElement = document.querySelector(".activate-grid-item__numberq");
    let phone_number = ""
    if (!phoneElement) {
        await browser.storage.local.set({ phone_number });
        return;
    }
    phone_number = phoneElement.innerText.replace(/\D/g, "");
    if (phone_number) {
        await browser.storage.local.set({ phone_number });
    }
    const smscodeElement = document.querySelector(".underline-orange.cursor-pointer");
    let smscode = ""
    if (!smscodeElement || !isSixDigitNumber(smscodeElement.textContent)) {
        await browser.storage.local.set({ smscode });
        return;
    }
    smscode = smscodeElement.textContent;
    await browser.storage.local.set({ smscode });
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

const facebookSendPassword = (message) => {
    if (message.user.facebookUrl === window.location.href) {
        fillInput('textarea[placeholder="Reply on Instagram…"]', message.user.email);
        clickOnButton('div[aria-label="Send"][role="button"]');
        setTimeout(() => {
            fillInput('textarea[placeholder="Reply on Instagram…"]', message.user.password);
            clickOnButton('div[aria-label="Send"][role="button"]');
            setTimeout(() => {
                fillInput('textarea[placeholder="Reply on Instagram…"]', `👆ده الباسورد
معذرة علي التأخير جايلي رسايل كتير جدا!

من فضلك هما بعتولك ايميل شبه الصورة الي في اللينك
دوس علي الزرار الأخضر عشان تاكتف الاكونت

انت مش محتاج VPN بس علي الاغلب هيقولك غير متوفر في بلدك
خلص وبعدها ابعتلي عشان احط نمرة اوروبي واشغل الاكونت
    
https://imgtr.ee/images/2023/05/18/280Kn.md.jpg
                `);
                clickOnButton('div[aria-label="Send"][role="button"]');
            }, 100);
        }, 100);

        let xpathLabelButton = "//div[contains(text(), 'Add label')]";
        let addLabelButton = document.evaluate(xpathLabelButton, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        addLabelButton.click();
        fillInput('input[placeholder="Add label"]', "--");
        browser.runtime.sendMessage({ type: "status", status: "password-sent" });
    }
};


const facebookUserAlreadyExists = (message) => {
    if (message.user.facebookUrl === window.location.href) {
        fillInput('textarea[placeholder="Reply on Instagram…"]', `
انت عندك اكونت بالفعل ... ممكن تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`);
        clickOnButton('div[aria-label="Send"][role="button"]');
        let xpathLabelButton = "//div[contains(text(), 'Add label')]";
        let addLabelButton = document.evaluate(xpathLabelButton, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        addLabelButton.click();
        fillInput('input[placeholder="Add label"]', "--");
        browser.runtime.sendMessage({ type: "status", status: "user-already-exists-sent" });
    }
};


function simulateKeyPressAndRelease(targetElement, key, code, keyCode, which) {
    const keyDownEvent = new KeyboardEvent('keydown', { key, code, keyCode, which, bubbles: true, cancelable: true });
    targetElement.dispatchEvent(keyDownEvent);

    const keyUpEvent = new KeyboardEvent('keyup', { key, code, keyCode, which, bubbles: true, cancelable: true });
    targetElement.dispatchEvent(keyUpEvent);
}

function simulateMouseEvents(targetElement) {
    // Simulate mouse movement towards the target element
    const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: targetElement.getBoundingClientRect().x, clientY: targetElement.getBoundingClientRect().y });
    document.dispatchEvent(mouseMoveEvent);

    // Simulate mouse over
    const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseOverEvent);

    // Simulate mouse down (button press)
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseDownEvent);

    // Simulate mouse up (button release)
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseUpEvent);

    // Simulate click after a small delay to mimic human interaction
    setTimeout(() => {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        targetElement.dispatchEvent(clickEvent);
    }, 100);
}

function clickOnButton(selector, text, closetab) {
    const buttonDivs = document.querySelectorAll(selector);
    let done = false;
    buttonDivs.forEach((buttonDiv) => {
        if (text) {
            const buttonText = buttonDiv.textContent.trim();
            if (buttonText === text) {
                simulateMouseEvents(buttonDiv);
                done = true;
            }
        } else {
            simulateMouseEvents(buttonDiv);
            done = true;
        }
        if (closetab && done) {
            browser.runtime.sendMessage({ type: "closeCurrentTab" });
        }
    });
    return done
}

function OpenAILastButton(textarea, username, autoCloseTabCheckbox) {
    const welcomeInterval = setInterval(() => {
        clickOnButton('.flex.w-full.items-center.justify-center.gap-2', 'Next', autoCloseTabCheckbox);
        const done = clickOnButton('.flex.w-full.items-center.justify-center.gap-2', 'Done');
        if (done) {
            textarea.value = `Hi ChatGPT my name is ${username}`;
            simulateKeyPressAndRelease(textarea, key = 'Enter', code = 'Enter', keyCode = 13, which = 13);
            clearInterval(welcomeInterval);
        }
    }, 200);
    clearInterval(intervals.openAI);
}

function fillInput(selector, value) {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        simulateMouseEvents(targetElement);
        targetElement.value = value;
        targetElement.setAttribute("value", value);
        let event = new Event('input', { bubbles: true });
        targetElement.dispatchEvent(event);
        return true;
    }
    return false;
}

function handleOpenAIButtons() {
    // Find the Login and Sign Up buttons
    let loginButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Log in");
    let signupButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Sign up");

    // If Login button found, add the event listener
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            browser.runtime.sendMessage({ type: "status", status: "login" });
        });
    }

    // If Sign Up button found, add the event listener
    if (signupButton) {
        signupButton.addEventListener('click', function () {
            browser.runtime.sendMessage({ type: "status", status: "signup" });
        });
    }
}



async function handleOpenAI() {
    let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
    const { autoFillCheckbox = true, autoSmsCheckbox = true, autoClickCheckbox = true, autoCloseTabCheckbox = false, currentUser = undefined, phone_number = undefined, smscode = undefined } =
        await browser.storage.local.get(["autoFillCheckbox", "autoSmsCheckbox", "autoClickCheckbox", "autoCloseTabCheckbox", "currentUser", "phone_number", "smscode"]);

    if (errorElement) {
        if (document.body.textContent.includes("The user already exists")) {
            browser.runtime.sendMessage({ type: "status", status: "user-already-exists", user: currentUser });
            browser.runtime.sendMessage({ type: "closeCurrentTab" });
        }
        return;
    }

    if (autoFillCheckbox && currentUser) {
        const isInputEmail = fillInput('input[name="email"]', currentUser.email);
        if (isInputEmail && document.body.textContent.includes("Create your account")) {
            browser.runtime.sendMessage({ type: "status", status: "signup-e" });
            if (autoClickCheckbox) {
                clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
            }
        }

        const isUserName = fillInput('input[name="username"]', currentUser.email);
        if (isUserName && document.body.textContent.includes("Welcome back")) {
            browser.runtime.sendMessage({ type: "status", status: "login-e" });
            if (autoClickCheckbox) {
                clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
            }
        }

        const isPassword = fillInput('input[name="password"]', currentUser.password);
        if (isPassword) {
            if (document.body.textContent.includes("Create your account")) {
                browser.runtime.sendMessage({ type: "status", status: "signup-p" });
            }
            if (document.body.textContent.includes("Enter your password")) {
                browser.runtime.sendMessage({ type: "status", status: "login-p" });
            }
            if (autoClickCheckbox) {
                clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
            }
        }
        if (document.body.textContent.includes("Verify your email")) {
            browser.runtime.sendMessage({ type: "status", status: "signup-v", user: currentUser });
            if (autoClickCheckbox) {
                clickOnButton('.onb-resend-email-btn', null, autoCloseTabCheckbox);
            }
        }
        if (document.body.textContent.includes("Tell us about you")) {
            fillInput('input[placeholder="First name"]', currentUser.first_name);
            fillInput('input[placeholder="Last name"]', currentUser.last_name);
            fillInput('input[placeholder="MM/DD/YYYY"]', currentUser.birth_date);
            if (autoClickCheckbox) {
                clickOnButton('button[type="submit"]');
            }
        }
    }

    if (autoSmsCheckbox) {
        if (phone_number && document.body.textContent.includes("Verify your phone number")) {
            fillInput(".text-input.text-input-lg.text-input-full", phone_number);
            if (currentUser.status != "number") {
                browser.runtime.sendMessage({ type: "status", status: "number" });
            }
        }

        if (smscode && document.body.textContent.includes("Enter code")) {
            fillInput(".text-input.text-input-lg.text-input-full", smscode);
            if (currentUser.status != "smscode") {
                browser.runtime.sendMessage({ type: "status", status: "smscode" });
            }
        }
    }

    const textarea = document.querySelector(`textarea.m-0.w-full.resize-none.border-0.bg-transparent.p-0.pr-7.focus\\:ring-0.focus-visible\\:ring-0.dark\\:bg-transparent.pl-2.md\\:pl-0`);
    if (textarea) {
        // click on welcome button.
        OpenAILastButton(textarea, currentUser.first_name, autoCloseTabCheckbox);
        browser.runtime.sendMessage({ type: "status", status: "done" });
    };
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

const intervals = {
    openAI: null,
    facebook: null,
    smsActivate: null,
};

function onDocumentLoad() {
    const currentUrl = window.location.href;
    if (currentUrl.includes("openai.com")) {
        intervals.openAI = setInterval(handleOpenAI, 500);
        if (currentUrl.includes("chat.openai.com/auth/login")) {
            handleOpenAIButtons();
        }
    }

    if (currentUrl.includes("facebook.com")) {
        createStyleElement();
        intervals.facebook = setInterval(handleFacebook, 1000);
    }

    if (currentUrl.includes("sms-activate.org")) {
        intervals.smsActivate = setInterval(handleSmsActivate, 500);
    }
}

if (document.readyState === "complete") {
    onDocumentLoad();
} else {
    window.addEventListener("load", onDocumentLoad);
}

browser.runtime.onMessage.addListener(async (message) => {
    const { autoFacebookCheckbox = true } = await browser.storage.local.get(["autoFacebookCheckbox"]);
    try {
        switch (message.type) {
            case 'send-password':
                if (autoFacebookCheckbox) {
                    facebookSendPassword(message);
                }
                break;
            case 'send-user-already-exists':
                if (autoFacebookCheckbox) {
                    facebookUserAlreadyExists(message);
                }
                break;
        }
    } catch (error) {
        console.log(error)
    }
});
