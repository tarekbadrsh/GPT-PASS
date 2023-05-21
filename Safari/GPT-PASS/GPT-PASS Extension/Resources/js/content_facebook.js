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

function removeLable() {
    var element = document.querySelector('[aria-label="clearLabel"]');
    if (element) {
        element.click();
        removeLable();
    }
}
function addLabel(txt) {
    let xpath = "//div[contains(text(), 'Add label')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (matchingElement) {
        // clear all labels
        removeLable();

        let addLabelbtn = matchingElement.parentNode.parentNode;
        if (addLabelbtn) {
            addLabelbtn.click();
        }
        let inputElement = fillInput('input[placeholder="Add label"]', txt);
        simulateKeyPressAndRelease(inputElement, key = 'Enter', code = 'Enter', keyCode = 13, charCode = 13);
        if (addLabelbtn) {
            addLabelbtn.click();
        }
    }
}



function addButtonToNotes(css_class, text, message, label, click_done) {

    let xpath = "//div[contains(text(), 'Notes')]";
    let matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (matchingElement) {
        // Check if button with specific class already exists
        let existingButton = matchingElement.querySelector(`button.${css_class}`);

        // If the button doesn't exist, create it
        if (!existingButton) {
            let btn = document.createElement("button");
            btn.innerHTML = text;
            btn.classList.add(css_class); // add the class to the button
            btn.addEventListener('click', function () {
                const filltextdone = fillInput('textarea[placeholder="Reply on Instagram…"]', message);
                if (filltextdone) {
                    const clickbuttondone = clickOnButton('div[aria-label="Send"][role="button"]');
                    if (clickbuttondone && label) {
                        addLabel(label);
                    }
                    if (clickbuttondone && click_done) {
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
                }
            });
            matchingElement.appendChild(btn);
        }
    } else {
        console.log('No element with "Notes" found');
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
        "🔴 الباسورد غلط 🔴",
        "الباسورد غلط ... ممكن من فضلك تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!",
        "--",
        true
    );

    addButtonToNotes("gpt4_btn",
        "ChatGPT-⓸⓸⓸",
        `للاسف، مش بقدر اساعد في ChatGPT-4 🙏
ممكن تشوف الي كتبته في التويته ديه
https://twitter.com/tarekbadrsh/status/1641394327015370754
`);

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

}

const facebookSendPassword = (message) => {
    if (message.user.facebookUrl === window.location.href) {
        addLabel("--");
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

        message.user.status = "password-sent";
        browser.runtime.sendMessage({ type: "status", status: "password-sent", user: message.user });
    }
};


const facebookUserAlreadyExists = (message) => {
    if (message.user.facebookUrl === window.location.href) {
        fillInput('textarea[placeholder="Reply on Instagram…"]', `
انت عندك اكونت بالفعل ... ممكن تبعتلي الإيميل والباسورد الصح في رسايل منفصلة عشان احط رقم اوروبي واشغلهولك!
وممكن تتأكد بنفسك لو عملت تسجيل دخول من اللينك ده وتقدر كمان تغير الباسورد

https://chat.openai.com/auth/login`);
        clickOnButton('div[aria-label="Send"][role="button"]');
        addLabel("--");
        message.user.status = "user-already-exists-sent";
        browser.runtime.sendMessage({ type: "status", status: "user-already-exists-sent", user: message.user });
    }
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
                    addLabel("done");
                }
                break;
        }
    } catch (error) {
        console.log(error)
    }
});
