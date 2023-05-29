let user = null;

const sendMessage = async (type, error) => {
    await browser.runtime.sendMessage({ type: type, user: user, error: error });
}

const clickOnButtons = async (selector, text) => {
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
        if (done) break;
    }
    return done
}

const clickOnButton = async (selector, text) => {
    const btn = document.querySelector(selector);
    if (!btn) {
        return false;
    }
    if (text && text !== btn.textContent.trim()) {
        return false;
    }
    await simulateMouseEvents(btn);
    return true;
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
            user.status = "login"
            await sendMessage(type = "update-user");
        });
    }

    // If Sign Up button found, add the event listener
    let signupButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Sign up");
    if (signupButton) {
        signupButton.addEventListener('click', async () => {
            user.status = "signup"
            await sendMessage(type = "update-user");

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
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    user.status = "signup-e";
    await sendMessage(type = "update-user");
    return true;
}

const createYourAccountPassword = async () => {
    if (!document.body.textContent.includes("Create your account")) {
        return true;
    }
    let done = await fillInput('input[name="password"]', user.password);
    if (!done) {
        return false;
    }
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    user.status = "signup-p"
    await sendMessage(type = "update-user");
    return true;
}

const verifyYourEmail = async () => {
    if (!document.body.textContent.includes("Verify your email")) {
        return true;
    }
    let done = false;
    done = await clickOnButtons('.onb-resend-email-btn');
    if (!done) {
        return false;
    }
    user.status = "signup-v"
    await sendMessage(type = "update-user");
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
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    user.status = "login-e"
    await sendMessage(type = "update-user");
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
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
    if (!errorElement) {
        user.status = "login-p"
        await sendMessage(type = "update-user");
        return true;
    }
    if (document.body.textContent.includes("The user already exists")) {
        user.status = "user-already-exists"
        await sendMessage(type = "update-user");
        return false;
    } else if (document.body.textContent.includes("Wrong email or password")) {
        user.status = "wrong-password"
        await sendMessage(type = "update-user");
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
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    user.status = "login-n"
    await sendMessage(type = "update-user");
    return true;
}

const selectPhoneCountry = new Set();
const verifyYourPhoneNumber = async () => {
    if (!document.body.textContent.includes("Verify your phone number")) {
        return true;
    }
    const dropdownCountry = document.querySelector(".select-dropdown-indicator");
    if (!dropdownCountry) {
        return true;
    }
    if (!user.phone_number) {
        return true;
    }
    if (selectPhoneCountry.has(user.email)) {
        return true;
    }
    selectPhoneCountry.add(user.email);
    await simulateMouseEvents(dropdownCountry);
    await sleep(500);
    let countryhtml;
    if (user.country_code == 8) { // kenya 
        countryhtml = "react-select-2-option-115"
    } else if (user.country_code == 32) { // Romania
        countryhtml = "react-select-2-option-181"
    }

    const country = document.getElementById(countryhtml);
    await simulateMouseEvents(country);
    await sleep(500);
    let done = await fillInput('.text-input', user.phone_number);
    if (!done) {
        return false;
    }
    done = await clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    user.status = "phone-nubmer-added"
    await sendMessage(type = "update-user");
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
    user.status = "done"
    await sendMessage(type = "update-user");
}

const openAIWelcomeMessage = async () => {
    await clickOnButtons('.btn.relative.btn-neutral.ml-auto');
    await clickOnButtons('.btn.relative.btn-neutral.ml-auto');
    const done = await clickOnButtons('.btn.relative.btn-primary.ml-auto');
    if (done) {
        clearInterval(openai_intervals.handleOpenAI);
        const textarea = document.querySelector(`textarea.m-0.w-full.resize-none.border-0.bg-transparent.p-0.pr-7.focus\\:ring-0.focus-visible\\:ring-0.dark\\:bg-transparent.pl-2.md\\:pl-0`);
        textarea.value = `Hi ChatGPT my name is ${user.first_name}`;
        await simulateKeyPressAndRelease(textarea, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        await sendMessage(type = "closeCurrentTab");
    }
}

const handleOpenAI = async () => {
    let result = await browser.storage.local.get("automation");
    const automation = result.automation;
    if (!automation) {
        return;
    }
    openAIAddEventListener();
    try {
        let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
        let result = await browser.storage.local.get("currentUser");
        user = result.currentUser;
        if (errorElement) {
            if (document.body.textContent.includes("The user already exists")) {
                user.status = "user-already-exists";
                await sendMessage(type = "update-user");
                await sendMessage(type = "closeCurrentTab");
            }
            return;
        }

        if (!user) {
            return;
        }
        switch (user.status) {
            case "signup":
                if (!createYourAccount()) {
                    await sendMessage(type = "log-error", error = "Could not create account");
                }
                break;
            case "signup-e":
                if (!createYourAccountPassword()) {
                    await sendMessage(type = "log-error", error = "signup-e: Could not enter Your Password");
                }
                break;
            case "signup-p":
                if (!verifyYourEmail()) {
                    await sendMessage(type = "log-error", error = "Could not Verify Your Email");
                }
                break;
            case "password-sent":
                if (automation) {
                    await sendMessage(type = "closeCurrentTab");
                }
                break;
            //----
            case "login":
                if (!loginYourAccount()) {
                    await sendMessage(type = "log-error", error = "Could not create account");
                }
                break;
            case "login-e":
                if (!loginYourAccountPassword()) {
                    await sendMessage(type = "log-error", error = "login-e: Could not enter Your Password");
                }
                break;
            case "login-p":
                if (!tellUsAboutYou()) {
                    await sendMessage(type = "log-error", error = "Could not Tell us about you");
                }
                break;
            case "login-n":
                if (!verifyYourPhoneNumber()) {
                    await sendMessage(type = "log-error", error = "Could not verify user phone number");
                }
                break;
            case "phone-nubmer-added":
                if (!enterCode()) {
                    await sendMessage(type = "log-error", error = "Could not Enter code");
                }
                break;
            case "done":
                if (!openAIWelcomeMessage()) {
                    await sendMessage(type = "log-error", error = "Could not openAI Welcome Message");
                }
                break;
            //----
            default:
                break;
        }
    } catch (error) {
        console.error(error)
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
    try {
        switch (message.type) {
            case 'clear-all-data':
                await clearAllData();
                break;
        }
    } catch (error) {
        console.error(error)
    }
});

