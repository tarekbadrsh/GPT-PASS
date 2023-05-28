const createStyleElement = () => {
    const style = document.createElement("style");
    style.textContent = `
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

      .gpt-pass-button button:active {
        background-color: green;
      }

      .gpt-pass-button button:focus {
        outline: none;
      }
  
    `;
    document.head.appendChild(style);
    clearInterval(facebook_intervals.createStyleElement);
};

function removeLables() {
    var element = document.querySelector('[aria-label="clearLabel"]');
    if (element) {
        element.click();
        removeLables();
    }
}

function addLabel(txt) {
    let xpath = "//div[contains(text(), 'Add label')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (matchingElement) {
        let addLabelbtn = matchingElement.parentNode.parentNode;
        if (addLabelbtn) {
            addLabelbtn.click();
        }
        let inputElement = fillFacebookInput('input[placeholder="Add label"]', txt);
        simulateKeyPressAndRelease(inputElement, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        if (addLabelbtn) {
            addLabelbtn.click();
        }
    }
}

function clickMoveToDone() {
    let xpath = "//div[contains(text(), 'Move to done')]";
    let doneButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (doneButton) {
        let button = doneButton.parentNode.parentNode.parentNode;
        if (button) {
            setTimeout(() => {
                button.click();
            }, 1000);
        }
    }
}

function fillFacebookInput(selector, value) {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        targetElement.value = value;
        let event = new Event('input', { bubbles: true });
        targetElement.dispatchEvent(event);
        return targetElement;
    }
    return false;
}


function sendFacebookMessage(message) {
    try {
        let fillInputDone = fillFacebookInput('textarea[placeholder="Reply on Instagram…"]', message)
        const sendbutton = document.querySelector('div[aria-label="Send"][role="button"]');

        if (fillInputDone && sendbutton) {
            sendbutton.click();
            return true;
        }
    } catch (err) {
        console.error(`Send facebook message: ${message}, Error: ${err}`);
        return false;
    }
    return false;
}


function sendMultipleFacebookMessages(messages, moveToDone = true, index = 0) {
    if (index >= messages.length && moveToDone) {
        setTimeout(clickMoveToDone, 100);
        return true;
    }

    const done = sendFacebookMessage(messages[index]);

    if (!done) {
        return false;
    }

    setTimeout(() => sendMultipleFacebookMessages(messages, moveToDone, index + 1), 100);
}

function addButtonToNotes(css_class, text, message, label, click_done) {
    let xpath = "//div[contains(text(), 'Notes')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (matchingElement) {
        // Check if button with specific class already exists
        let existingButton = matchingElement.querySelector(`button.${css_class}`);
        if (!existingButton) {
            let btn = document.createElement("button");
            btn.innerHTML = text;
            btn.classList.add(css_class); // add the class to the button
            btn.addEventListener('click', function () {
                const messageSent = sendFacebookMessage(message);
                if (messageSent && label) {
                    removeLables();
                    setTimeout(() => {
                        addLabel(label);
                    }, 1000);
                }
                if (messageSent && click_done) {
                    setTimeout(() => {
                        clickMoveToDone();
                    }, 2000);
                }
            });
            matchingElement.appendChild(btn);
        }
    }
}

function addResponseButtons() {
    addButtonToNotes(
        "euro_btn",
        "🇪🇺فاضل الرقم الاوروبي🇪🇺",
        `تمام جدا!

كده لسه الاكونت مشتغلش
فاضل ان انا احط رقم موبايل اوروبي واشغله
---
ممكن من فضلك تطول بالك عليا عشان فيه مشكلة في الارقام وبنحاول نحلها 🙌`,
        "num",
        true);

    addButtonToNotes("wrong_password_btn",
        "🔴الباسورد غلط🔴",
        `الباسورد غلط ... ممكن من فضلك تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`,
        "--",
        false
    );

    addButtonToNotes("wrong_password_btn",
        "🔐ايميل تغييرالباسورد🔐",
        `انا بعتلك ايميل تغيير الباسورد .. دور عندك في الرسايل
هما بعتولك ايميل شبه الصورة الي في اللينك او سيرش علي OpenAI وغير الباسورد وابعتلي الجديد
https://imgtr.ee/images/2023/05/21/2fJ0U.png`,
        "--",
        false
    );

    addButtonToNotes("outlook_btn",
        "outlook",
        "ممكن من فضلك تبعتلي ايميل تاني ال Outlook@ و ال Hotmail@ فيهم مشكلة مش بنقدر نعمل بيهم حسابات",
        "--",
        true
    );

    addButtonToNotes("frnd_acc_btn",
        "🤎صاحب الميل يبعتلي🤎",
        "أنا اسف جدا ... ممكن من فضلك تخلي صاحب الإيميل يبعتلي عشان جايلي طلبات كتير🙏🏻",
        "done",
        true
    );

    addButtonToNotes("gpt4_btn",
        "ChatGPT-⓸⓸⓸",
        `للاسف، مش بقدر اساعد في ChatGPT-4 🙏
ممكن تشوف الي كتبته في التويته ديه
https://twitter.com/tarekbadrsh/status/1641394327015370754
`);

    addButtonToNotes("activate_your_account",
        "🥦🥦اكتف الإيميل بتاعك🥦🥦",
        `من فضلك هما بعتولك ايميل شبه الصورة الي في اللينك
دوس علي الزرار الأخضر عشان تاكتف الاكونت

انت مش محتاج VPN بس علي الاغلب هيقولك غير متوفر في بلدك
خلص وبعدها ابعتلي عشان احط نمرة اوروبي واشغل الاكونت
    
https://imgtr.ee/images/2023/05/18/280Kn.jpg`,
        "--",
        true);

}

const sendMessageFacebook_signup_p = new Set();
const facebookSendPassword = (message) => {
    if (sendMessageFacebook_signup_v.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_signup_v.add(message.user.email);
    removeLables();
    const messages = [
        message.user.email,
        message.user.password, `👆ده الباسورد
معذرة علي التأخير جايلي رسايل كتير جدا!

من فضلك هما بعتولك ايميل شبه الصورة الي في اللينك
دوس علي الزرار الأخضر عشان تاكتف الاكونت

انت مش محتاج VPN بس علي الاغلب هيقولك غير متوفر في بلدك
خلص وبعدها ابعتلي عشان احط نمرة اوروبي واشغل الاكونت
    
https://imgtr.ee/images/2023/05/18/280Kn.jpg
`];
    addLabel("--");
    sendMultipleFacebookMessages(messages);
    browser.runtime.sendMessage({ type: "status", status: "password-sent", user: message.user });
};

const sendMessageFacebook_signup_v = new Set();
const facebookUserAlreadyExists = (message) => {
    if (sendMessageFacebook_signup_v.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_signup_v.add(message.user.email);
    removeLables();
    const messages = [
        message.user.email,
        `انت عندك اكونت بالفعل ... ممكن تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`
    ];
    addLabel("--");
    sendMultipleFacebookMessages(messages, true);
    browser.runtime.sendMessage({ type: "status", status: "user-already-exists-sent", user: message.user });
};

const sendMessageFacebook_done = new Set();
const userDone = (message) => {
    if (sendMessageFacebook_done.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_done.add(message.user.email);
    removeLables();
    addLabel("done");
    const messages = [
        message.user.email,
        message.user.password,
        "https://chat.openai.com/chat",
        `- انا شغلت ليك الاكونت🤟🎉🎊

- ديه فيدوهات عن الشات في قناة اليوتوب 🎥 

ازاي بعمل حسابات للناس بسرعه!؟
https://youtu.be/JKbIstFXB1Y

ازاي تستعمله | 🤖ChatGPT
https://youtu.be/OKCMfCdLqXA


- انت هتحتاج تغير الباسورد ... بص علي التويته ديه عشان تعرف ازاي 🔐
https://twitter.com/tarekbadrsh/status/1619418114340585472

- انا هبقي شاكر جدا لو تقدر تنزل استوري علي الانستجرام او تكتب تويته ان اي حد محتاج اكونت ChatGPT يبعتلي اهلا وسهلا
انا بحاول اعمل حسابات لأكبر قدر ممكن من الناس دلوقتي🙏`];
    sendMultipleFacebookMessages(messages);
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

const findParentDiv = (element) => {
    while (element.parentElement) {
        element = element.parentElement;
        if (element.tagName.toLowerCase() === "div") {
            return element;
        }
    }
    return null;
};

// Generate a random birth date
function generateRandomBirthDate() {
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;
    const randomMonth = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const randomDay = (Math.floor(Math.random() * 25) + 1).toString().padStart(2, '0');
    return `${randomMonth}/${randomDay}/${randomYear}`;
}

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
    user.status = "new_user";
    return user;
};

const addGptPassButton = async (span) => {
    try {
        span.classList.add("gpt-pass-spen");
        const button = document.createElement("button");
        button.classList.add("gpt-pass-button");

        button.addEventListener("click", async (e) => {
            const selectedText = window.getSelection().toString();
            const user = await extractUser(span.textContent);
            if (selectedText) {
                user.password = selectedText;
            }
            await browser.runtime.sendMessage({ type: "new_user", user: user });
        });
        span.appendChild(button);
    } catch (err) {
        console.error(`Error sending user: ${err}`);
    }
};

const addGptFacebook = async () => {
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

const clearAllData = async () => {
    sendMessageFacebook_signup_p.clear();
    sendMessageFacebook_signup_v.clear();
    sendMessageFacebook_done.clear();
}

const facebook_intervals = {
    createStyleElement: null,
    addResponseButtons: null,
    addGptFacebook: null
};


function onFacebookLoad() {
    facebook_intervals.createStyleElement = setInterval(createStyleElement, 500);
    facebook_intervals.addGptFacebook = setInterval(addGptFacebook, 1000);
    facebook_intervals.addResponseButtons = setInterval(addResponseButtons, 1000);
}


if (document.readyState === "complete") {
    onFacebookLoad();
} else {
    window.addEventListener("load", onFacebookLoad);
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
            case 'send-done-to-user':
                if (autoFacebookCheckbox) {
                    userDone(message)
                }
                break;
            case 'clear-all-data':
                await clearAllData();
                break;
        }
    } catch (error) {
        console.error(error)
    }
});
