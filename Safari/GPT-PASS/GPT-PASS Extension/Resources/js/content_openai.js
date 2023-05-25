
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

function clickOnButton(selector, text, closetab, user) {
    const allBtns = document.querySelectorAll(selector);
    let done = false;
    allBtns.forEach((btn) => {
        if (text) {
            const buttonText = btn.textContent.trim();
            if (buttonText === text) {
                simulateMouseEvents(btn);
                done = true;
            }
        } else {
            simulateMouseEvents(btn);
            done = true;
        }
        if (closetab && done) {
            browser.runtime.sendMessage({ type: "closeCurrentTab", user: user });
        }
    });
    return done
}

function fillInput(selector, value) {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        targetElement.value = value;
        let event = new Event('input', { bubbles: true });
        targetElement.dispatchEvent(event);
        return targetElement;
    }
    return false;
}

function openAIAddEventListener(user) {
    // If Login button found, add the event listener
    let loginButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Log in");
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            browser.runtime.sendMessage({ type: "status", status: "login", user: user });
        });
    }

    // If Sign Up button found, add the event listener
    let signupButton = Array.from(document.getElementsByClassName('btn relative btn-primary')).find(button => button.textContent === "Sign up");
    if (signupButton) {
        signupButton.addEventListener('click', function () {
            browser.runtime.sendMessage({ type: "status", status: "signup", user: user });
        });
    }

    const passTxt = document.querySelector('input[name="password"]');
    if (passTxt) {
        passTxt.addEventListener("change", function (event) {
            if (user.password == passTxt.value) {
                return;
            }
            user.password = passTxt.value;
            browser.runtime.sendMessage({ type: "update-user", user: user });
        });
    }
}

function createYourAccount(user, autoClickOpenAIButton) {
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
    browser.runtime.sendMessage({ type: "status", status: "signup-e", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    return true;
}

function createYourAccountPassword(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Create your account")) {
        return true;
    }
    let done = fillInput('input[name="password"]', user.password);
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "signup-p", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    return true;
}

function verifyYourEmail(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Verify your email")) {
        return true;
    }
    if (!autoClickOpenAIButton) {
        return true;
    }
    let done = clickOnButton('.onb-resend-email-btn');
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "signup-v", user: user });
    return true;
}

function loginYourAccount(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Welcome back")) {
        return true;
    }
    let done = fillInput('input[name="username"]', user.email);
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "login-e", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    return true;
}

function loginYourAccountPassword(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Enter your password")) {
        return true;
    }
    let done = fillInput('input[name="password"]', user.password);
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "login-p", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"][name="action"][value="default"][data-action-button-primary="true"]', "Continue");
    if (!done) {
        return false;
    }
    let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
    if (!errorElement) {
        return true;
    }
    if (document.body.textContent.includes("The user already exists")) {
        browser.runtime.sendMessage({ type: "status", status: "user-already-exists", user: user });
        return false;
    } else if (document.body.textContent.includes("Wrong email or password")) {
        browser.runtime.sendMessage({ type: "status", status: "wrong-password", user: user });
        return false;
    }
    return true;
}

function tellUsAboutYou(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Tell us about you")) {
        return true;
    }
    let done = fillInput('input[placeholder="First name"]', user.first_name);
    if (!done) {
        return false;
    }
    done = fillInput('input[placeholder="Last name"]', user.last_name);
    if (!done) {
        return false;
    }
    done = fillInput('input[placeholder="MM/DD/YYYY"]', user.birth_date);
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "login-n", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    return true;
}

function requestPhoneNumber(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Verify your phone number")) {
        return true;
    }
    if (!user.phone_number) {
        browser.runtime.sendMessage({ type: "status", status: "request-phone-nubmer", user: user });
        return true;
    }
    browser.runtime.sendMessage({ type: "status", status: "add-number-to-user", user: user });
    return true;
}

let selectPhoneCountry = new Set();
function verifyYourPhoneNumber(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Verify your phone number")) {
        return true;
    }
    if (!user.phone_number) {
        return true;
    }
    if (!selectPhoneCountry.has(user.email)) {
        const targetElement = document.querySelector(".select-dropdown-indicator");
        simulateMouseEvents(targetElement);
        const romania = document.getElementById("react-select-2-option-181");
        simulateMouseEvents(romania);
        selectPhoneCountry.add(user.email);
    }
    setTimeout(() => {
        let done = fillInput('.text-input', user.phone_number);
        if (!done) {
            return false;
        }
        if (!autoClickOpenAIButton) {
            return true;
        }
        done = clickOnButton('button[type="submit"]');
        if (!done) {
            return false;
        }
        browser.runtime.sendMessage({ type: "status", status: "phone-nubmer-added", user: user });
        return true;
    }, 1000);
}

function enterCode(user, autoClickOpenAIButton) {
    if (!document.body.textContent.includes("Enter code")) {
        return true;
    }
    if (!user.smscode) {
        return true;
    }
    let done = fillInput(".text-input.text-input-lg.text-input-full", user.smscode);
    if (!done) {
        return false;
    }
    browser.runtime.sendMessage({ type: "status", status: "done", user: user });
    if (!autoClickOpenAIButton) {
        return true;
    }
    done = clickOnButton('button[type="submit"]');
    if (!done) {
        return false;
    }
    return true;
}

function openAIWelcomeMessage(user, autoCloseTabCheckbox) {
    clickOnButton('.btn.relative.btn-neutral.ml-auto');
    clickOnButton('.btn.relative.btn-neutral.ml-auto');
    const done = clickOnButton('.btn.relative.btn-primary.ml-auto');
    if (done) {
        const textarea = document.querySelector(`textarea.m-0.w-full.resize-none.border-0.bg-transparent.p-0.pr-7.focus\\:ring-0.focus-visible\\:ring-0.dark\\:bg-transparent.pl-2.md\\:pl-0`);
        textarea.value = `Hi ChatGPT my name is ${user.first_name}`;
        simulateKeyPressAndRelease(textarea, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        clearInterval(openai_intervals.handleOpenAI);
    }
}

async function handleOpenAI() {
    console.log("handleOpenAI");
    let errorElement = document.querySelector('[class*="error"], [data-error-code*="blocked"]');
    const { autoFillCheckbox = true, autoSmsCheckbox = true, autoClickCheckbox = true, autoCloseTabCheckbox = true, currentUser = undefined, phone_number = undefined, smscode = undefined } =
        await browser.storage.local.get(["autoFillCheckbox", "autoSmsCheckbox", "autoClickCheckbox", "autoCloseTabCheckbox", "currentUser", "phone_number", "smscode"]);
    let user = currentUser;
    openAIAddEventListener(user);

    if (errorElement) {
        if (document.body.textContent.includes("The user already exists")) {
            user.status = "user-already-exists";
            browser.runtime.sendMessage({ type: "status", status: "user-already-exists", user: user });
            browser.runtime.sendMessage({ type: "closeCurrentTab", user: user });
        }
        return;
    }

    if (!user && !autoFillCheckbox) {
        return;
    }
    switch (user.status) {
        case "signup":
            if (!createYourAccount(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not create account", user: user });
            }
            break;
        case "signup-e":
            if (!createYourAccountPassword(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not enter Your Password", user: user });
            }
            break;
        case "signup-p":
            if (!verifyYourEmail(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not Verify Your Email", user: user });
            }
            break;
        case "password-sent":
            if (autoCloseTabCheckbox) {
                browser.runtime.sendMessage({ type: "closeCurrentTab", user: user });
            }
            break;
        //----
        case "login":
            if (!loginYourAccount(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not create account", user: user });
            }
            break;
        case "login-e":
            if (!loginYourAccountPassword(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not enter Your Password", user: user });
            }
            break;
        case "login-p":
            if (!tellUsAboutYou(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not Tell us about you", user: user });
            }
            break;
        case "login-n":
            if (!verifyYourPhoneNumber(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not verify user phone number", user: user });
            }
            break;
        case "phone-nubmer-added":
            if (!enterCode(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not Enter code", user: user });
            }
            break;
        case "done":
            if (!openAIWelcomeMessage(user, autoClickCheckbox)) {
                browser.runtime.sendMessage({ type: "log-error", error: "Could not openAI Welcome Message", user: user });
            }
            break;
        //----
        default:
            break;
    }
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

        }
    } catch (error) {
        console.log(error)
    }
});

