const sendMessage = async (type, user) => {
    await browser.runtime.sendMessage({ type: type, user: user });
}


const createStyleElement = async () => {
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
};

const removeLables = async () => {
    var element = document.querySelector('[aria-label="clearLabel"]');
    if (element) {
        await simulateMouseEvents(element);
        await removeLables();
    }
}

const fillFacebookInput = async (selector, value) => {
    const targetElement = document.querySelector(selector);
    if (targetElement && targetElement.value.length < 1) {
        targetElement.value = value;
        let event = new Event('input', { bubbles: true });
        await targetElement.dispatchEvent(event);
        return targetElement;
    }
    return false;
}

const addLabel = async (txt) => {
    let xpath = "//div[contains(text(), 'Add label')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (matchingElement) {
        let addLabelbtn = matchingElement.parentNode.parentNode;
        await simulateMouseEvents(addLabelbtn);
        let inputElement = await fillFacebookInput('input[placeholder="Add label"]', txt);
        await simulateKeyPressAndRelease(inputElement, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        await simulateMouseEvents(addLabelbtn);

    }
}

const clickMoveToDone = async () => {
    let xpath = "//div[contains(text(), 'Move to done')]";
    let doneButton = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (doneButton) {
        let button = doneButton.parentNode.parentNode.parentNode;
        if (button) {
            await sleep(500);
            await simulateMouseEvents(button);
        }
    }
}

const sendFacebookMessage = async (message) => {
    try {
        let fillInputDone = await fillFacebookInput('textarea[placeholder="Reply on Instagram…"]', message)
        if (fillInputDone) {
            const sendbutton = document.querySelector('div[aria-label="Send"][role="button"]');
            await simulateMouseEvents(sendbutton);
            return true;
        }
    } catch (err) {
        console.error(`Send facebook message: ${message}, Error: ${err}`);
        return false;
    }
    return false;
}

const sendMultipleFacebookMessages = async (messages, moveToDone = true, index = 0) => {
    if (index >= messages.length && moveToDone) {
        await sleep(100);
        await clickMoveToDone();
        return true;
    }
    const done = await sendFacebookMessage(messages[index]);
    if (!done) {
        return false;
    }
    await sleep(100);
    await sendMultipleFacebookMessages(messages, moveToDone, index + 1);
}

const addButtonToNotes = async (css_class, text, message, label, click_done) => {
    let xpath = "//div[contains(text(), 'Notes')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (matchingElement) {
        // Check if button with specific class already exists
        let existingButton = matchingElement.querySelector(`button.${css_class}`);
        if (!existingButton) {
            let btn = document.createElement("button");
            btn.innerHTML = text;
            btn.classList.add(css_class); // add the class to the button
            btn.addEventListener('click', async () => {
                const messageSent = await sendFacebookMessage(message);
                if (messageSent) {
                    if (label) {
                        await removeLables();
                        await addLabel(label);
                    }
                    if (click_done) {
                        await clickMoveToDone();
                    }
                }
            });
            matchingElement.appendChild(btn);
        }
    }
}

const addResponseButtons = async () => {
    await addButtonToNotes(
        "euro_btn",
        "🇪🇺فاضل الرقم الاوروبي🇪🇺",
        `تمام جدا!

كده لسه الاكونت مشتغلش
فاضل ان انا احط رقم موبايل اوروبي واشغله
---
ممكن من فضلك تطول بالك عليا فيه رسايل كتير 🙌`,
        "num",
        true);

    await addButtonToNotes("wrong_password_btn",
        "🔴الباسورد غلط🔴",
        `الباسورد غلط ... ممكن من فضلك تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`,
        "--",
        false
    );

    await addButtonToNotes("wrong_password_btn",
        "🔐ايميل تغييرالباسورد🔐",
        `انا بعتلك ايميل تغيير الباسورد .. دور عندك في الرسايل
هما بعتولك ايميل شبه الصورة الي في اللينك او سيرش علي OpenAI وغير الباسورد وابعتلي الجديد
https://imgtr.ee/images/2023/05/21/2fJ0U.png`,
        "--",
        false
    );

    await addButtonToNotes("outlook_btn",
        "outlook",
        "ممكن من فضلك تبعتلي ايميل تاني ال Outlook@ و ال Hotmail@ فيهم مشكلة مش بنقدر نعمل بيهم حسابات",
        "--",
        true
    );

    await addButtonToNotes("frnd_acc_btn",
        "🤎صاحب الميل يبعتلي🤎",
        "أنا اسف جدا ... ممكن من فضلك تخلي صاحب الإيميل يبعتلي عشان جايلي طلبات كتير🙏🏻",
        "done",
        true
    );

    await addButtonToNotes("gpt4_btn",
        "ChatGPT-⓸⓸⓸",
        `للاسف، مش بقدر اساعد في ChatGPT-4 🙏
ممكن تشوف الي كتبته في التويته ديه
https://twitter.com/tarekbadrsh/status/1641394327015370754
`);

    await addButtonToNotes("activate_your_account",
        "🥦🥦اكتف الإيميل بتاعك🥦🥦",
        `من فضلك هما بعتولك ايميل شبه الصورة الي في اللينك
دوس علي الزرار الأخضر عشان تاكتف الاكونت

انت مش محتاج VPN بس علي الاغلب هيقولك غير متوفر في بلدك
خلص وبعدها ابعتلي عشان احط نمرة اوروبي واشغل الاكونت
    
https://imgtr.ee/images/2023/05/18/280Kn.jpg`,
        "--",
        true);
    clearInterval(facebook_intervals.createStyleElement);
}

const sendMessageFacebook_signup_p = new Set();
const facebookSendPassword = async (message) => {
    if (sendMessageFacebook_signup_v.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_signup_v.add(message.user.email);
    await removeLables();
    const messages = [
        message.user.email,
        message.user.password,
        `👆ده الباسورد
معذرة علي التأخير جايلي رسايل كتير جدا!

من فضلك هما بعتولك ايميل شبه الصورة الي في اللينك
دوس علي الزرار الأخضر عشان تاكتف الاكونت

انت مش محتاج VPN بس علي الاغلب هيقولك غير متوفر في بلدك
خلص وبعدها ابعتلي عشان احط نمرة اوروبي واشغل الاكونت
    
https://imgtr.ee/images/2023/05/18/280Kn.jpg
`];
    await addLabel("--");
    await sendMultipleFacebookMessages(messages);
    message.user.status = "password-sent"
    await sendMessage("update-user", message.user);
};

const sendMessageFacebook_signup_v = new Set();
const facebookUserAlreadyExists = async (message) => {
    if (sendMessageFacebook_signup_v.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_signup_v.add(message.user.email);
    await removeLables();
    await addLabel("--");
    const messages = [
        message.user.email,
        `انت عندك اكونت بالفعل ... ممكن تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`
    ];
    await sendMultipleFacebookMessages(messages, true);
    message.user.status = "user-already-exists-sent"
    await sendMessage(type = "update-user", message.user);
};

const sendMessageFacebook_done = new Set();
const userDone = async (message) => {
    if (sendMessageFacebook_done.has(message.user.email)) {
        return;
    }
    sendMessageFacebook_done.add(message.user.email);
    await removeLables();
    await addLabel("done");
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
    await sendMultipleFacebookMessages(messages);
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
const processUserName = async () => {
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

const extractUser = async (text) => {
    const email = extractEmail(text);
    const user_name = await processUserName();
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
            let user = await extractUser(span.textContent);
            if (selectedText) {
                user.password = selectedText;
            }
            await sendMessage("new_user", user);
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
    addGptFacebook: null,
    addResponseButtons: null
};

const onFacebookLoad = async () => {
    await sleep(500);
    await createStyleElement();
    facebook_intervals.addGptFacebook = setInterval(addGptFacebook, 1000);
    facebook_intervals.addResponseButtons = setInterval(addResponseButtons, 1000);
}


if (document.readyState === "complete") {
    onFacebookLoad();
} else {
    window.addEventListener("load", onFacebookLoad);
}

browser.runtime.onMessage.addListener(async (message) => {
    let result = await browser.storage.local.get("automation");
    const automation = result.automation;
    switch (message.type) {
        case 'send-password':
            if (automation) {
                await facebookSendPassword(message);
            }
            break;
        case 'send-user-already-exists':
            if (automation) {
                await facebookUserAlreadyExists(message);
            }
            break;
        case 'send-done-to-user':
            if (automation) {
                await userDone(message)
            }
            break;
        case 'clear-all-data':
            await clearAllData();
            break;
    }
});
