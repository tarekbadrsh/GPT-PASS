let autoClickOpenAIButton = false;
let user = null;

const sendMessage = async (type, userstatus, error) => {
    if (!userstatus) {
        userstatus = user.status;
    }
    await browser.runtime.sendMessage({ type: type, error: error, status: userstatus, user: user });
}

const simulateMouseEvents = async (targetElement) => {
    const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: targetElement.getBoundingClientRect().x, clientY: targetElement.getBoundingClientRect().y });
    document.dispatchEvent(mouseMoveEvent);
    const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseOverEvent);
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseDownEvent);
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseUpEvent);

    // Simulate click after a small delay to mimic human interaction
    await sleep(100);
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(clickEvent);
}

const clickOnButton = async (selector, text, closetab) => {
    const allBtns = document.querySelectorAll(selector);
    let done = false;
    for (let i = 0; i < allBtns.length; i++) {
        const btn = allBtns[i];
        if (text) {
            const buttonText = btn.textContent.trim();
            if (buttonText === text) {
                await simulateMouseEvents(btn);
                done = true;
            }
        } else {
            await simulateMouseEvents(btn);
            done = true;
        }
        if (closetab && done) {
            await sendMessage(type = "closeCurrentTab");
        }
        if (done) break;
    }
    return done
}


const fillInput = async (selector, value) => {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        targetElement.value = value;
        await sleep(100);
        let event = new Event('input', { bubbles: true });
        targetElement.dispatchEvent(event);
        await sleep(100);
        return targetElement;
    }
    return false;
}

const openAIAddEventListener = async () => {
    // If Login button found, add the event listener
    let loginButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Log in");
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            await sendMessage(type = "status", userstatus = "login");
        });
    }

    // If Sign Up button found, add the event listener
    let signupButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Sign up");
    if (signupButton) {
        signupButton.addEventListener('click', async () => {
            await sendMessage(type = "status", userstatus = "signup");

        });
    }

    const passTxt = document.querySelector('input[name="password"]');
    if (passTxt) {
        passTxt.addEventListener("change", async () => {
            if (user.password == passTxt.value) {
                return;
            }
            user.password = passTxt.value;
            await sendMessage(type = "update-user");
        });
    }
}

const createYourAccount = async () => {
    if (!document.body.textContent.includes("Create your account")) {
        return true;
    }
    var spanElement = document.querySelector('.ulp-authenticator-selector-text');
    if (spanElement && spanElement.textContent.trim() !== "") {
        return true;
    }
    let done = fillInput('input[name="email"]', user.email);
    if (!done) {
        return false;
    }
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "signup-e");
    return true;
}

const createYourAccountPassword = async () => {
    await sleep(500);
    if (!document.body.textContent.includes("Create your account")) {
        return true;
    }
    let done = await fillInput('input[name="password"]', user.password);
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "signup-p");
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    return true;
}

const verifyYourEmail = async () => {
    if (!document.body.textContent.includes("Verify your email")) {
        return true;
    }
    if (!autoClickOpenAIButton) {
        return true;
    }
    let done = await clickOnButton('.onb-resend-email-btn');
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "signup-v");
    return true;
}

const loginYourAccount = async () => {
    if (!document.body.textContent.includes("Welcome back")) {
        return true;
    }
    let done = await fillInput('input[name="username"]', user.email);
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "login-e");
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    return true;
}

const loginYourAccountPassword = async () => {
    if (!document.body.textContent.includes("Enter your password")) {
        return true;
    }
    let done = await fillInput('input[name="password"]', user.password);
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "login-p");
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
    if (!errorElement) {
        return true;
    }
    if (document.body.textContent.includes("The user already exists")) {
        await sendMessage(type = "status", userstatus = "user-already-exists");
        return false;
    } else if (document.body.textContent.includes("Wrong email or password")) {
        await sendMessage(type = "status", userstatus = "wrong-password");
        return false;
    }
    return true;
}

const tellUsAboutYou = async () => {
    if (document.body.textContent.includes("Verify your email")) {
        return verifyYourEmail();
    }
    if (!document.body.textContent.includes("Tell us about you")) {
        return true;
    }
    let done = await fillInput('input[placeholder="First name"]', user.first_name);
    if (!done) {
        return false;
    }
    done = await fillInput('input[placeholder="Last name"]', user.last_name);
    if (!done) {
        return false;
    }
    done = await fillInput('input[placeholder="MM/DD/YYYY"]', user.birth_date);
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "login-n");
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    return true;
}
const requestPhoneNumber = async () => {
    if (!document.body.textContent.includes("Verify your phone number")) {
        return true;
    }
    if (!user.phone_number) {
        await sendMessage(type = "status", userstatus = "request-phone-nubmer");
        return true;
    }
    await sendMessage(type = "status", userstatus = "add-number-to-user");
    return true;
}

const selectPhoneCountry = new Set();
const verifyYourPhoneNumber = async () => {
    if (!document.body.textContent.includes("Verify your phone number")) {
        return true;
    }
    if (!user.phone_number) {
        return true;
    }
    if (!selectPhoneCountry.has(user.email)) {
        const targetElement = document.querySelector(".select-dropdown-indicator");
        await simulateMouseEvents(targetElement);
        const romania = document.getElementById("react-select-2-option-181");
        await simulateMouseEvents(romania);
        selectPhoneCountry.add(user.email);
    }
    await sleep(500);
    let done = await fillInput('.text-input', user.phone_number);
    if (!done) {
        return false;
    }
    if (!autoClickOpenAIButton) {
        return true;
    }
    await sleep(500);
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "phone-nubmer-added");
    return true;

}

const enterCode = async () => {
    if (!document.body.textContent.includes("Enter code")) {
        return true;
    }
    if (!user.smscode) {
        return true;
    }
    let done = await fillInput(".text-input.text-input-lg.text-input-full", user.smscode);
    if (!done) {
        return false;
    }
    await sendMessage(type = "status", userstatus = "done");

    if (!autoClickOpenAIButton) {
        return true;
    }
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    return true;
}

const openAIWelcomeMessage = async () => {
    await clickOnButton('.btn.relative.btn-neutral.ml-auto');
    await clickOnButton('.btn.relative.btn-neutral.ml-auto');
    const done = await clickOnButton('.btn.relative.btn-primary.ml-auto');
    if (done) {
        const textarea = document.querySelector(`textarea.m-0.w-full.resize-none.border-0.bg-transparent.p-0.pr-7.focus\\:ring-0.focus-visible\\:ring-0.dark\\:bg-transparent.pl-2.md\\:pl-0`);
        textarea.value = `Hi ChatGPT my name is ${user.first_name}`;
        simulateKeyPressAndRelease(textarea, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        clearInterval(openai_intervals.handleOpenAI);
        await sendMessage(type = "closeCurrentTab");
    }
}

const handleOpenAI = async () => {
    try {
        let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
        const { autoFillCheckbox = true, autoClickCheckbox = true, autoCloseTabCheckbox = true, currentUser = undefined } = await browser.storage.local.get(["autoFillCheckbox", "autoClickCheckbox", "autoCloseTabCheckbox", "currentUser"]);
        user = currentUser;
        openAIAddEventListener();
        autoClickOpenAIButton = autoClickCheckbox;

        if (errorElement) {
            if (document.body.textContent.includes("The user already exists")) {
                user.status = "user-already-exists";
                await sendMessage(type = "status", userstatus = "user-already-exists");
                await sendMessage(type = "closeCurrentTab");
            }
            return;
        }

        if (!user && !autoFillCheckbox) {
            return;
        }
        switch (user.status) {
            case "signup":
                if (!createYourAccount()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not create account");
                }
                break;
            case "signup-e":
                if (!createYourAccountPassword()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "signup-e: Could not enter Your Password");
                }
                break;
            case "signup-p":
                if (!verifyYourEmail()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not Verify Your Email");
                }
                break;
            case "password-sent":
                if (autoCloseTabCheckbox) {
                    await sendMessage(type = "closeCurrentTab");
                }
                break;
            //----
            case "login":
                if (!loginYourAccount()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not create account");
                }
                break;
            case "login-e":
                if (!loginYourAccountPassword()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "login-e: Could not enter Your Password");
                }
                break;
            case "login-p":
                if (!tellUsAboutYou()) {
                    await sendMessage(type = "log-error", error = "Could not Tell us about you");
                }
                break;
            case "login-n":
                if (!verifyYourPhoneNumber()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not verify user phone number");
                }
                break;
            case "phone-nubmer-added":
                if (!enterCode()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not Enter code");
                }
                break;
            case "done":
                if (!openAIWelcomeMessage()) {
                    await sendMessage(type = "log-error", userstatus = null, error = "Could not openAI Welcome Message");
                }
                break;
            //----
            default:
                break;
        }
    } catch (error) {
        console.log(error)
    }
}

const clearAllData = async () => {
    selectPhoneCountry.clear();
}

const openai_intervals = {
    handleOpenAI: null
};

function onOpenAILoad() {
    openai_intervals.handleOpenAI = setInterval(handleOpenAI, 500);
}

if (document.readyState === "complete") {
    onOpenAILoad();
} else {
    window.addEventListener("load", onOpenAILoad);
}

browser.runtime.onMessage.addListener(async (message) => {
    const { autoFillCheckbox = true } = await browser.storage.local.get(["autoFillCheckbox"]);
    try {
        switch (message.type) {
            case 'get-phone-number':
                if (autoFillCheckbox) {
                    console.log(message);
                }
                break;
            case 'clear-all-data':
                await clearAllData();
                break;
        }
    } catch (error) {
        console.log(error)
    }
});

