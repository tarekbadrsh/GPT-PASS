
class Number {
    constructor(phoneNumber, activationId) {
        this.phoneNumber = phoneNumber;
        this.activationId = activationId;
        this.smsCodes = [];
        this.users = [];
    }

    addSmsCode(smsCode) {
        this.smsCodes.push(smsCode);
    }

    removeSmsCode(smsCode) {
        const index = this.smsCodes.indexOf(smsCode);
        if (index > -1) {
            this.smsCodes.splice(index, 1);
        }
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUser(user) {
        const index = this.users.indexOf(user);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }
}

const isSixDigitNumber = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
};

const handleSmsActivate = async () => {
    let result = await browser.storage.local.get("automation");
    if (!result.automation) {
        return;
    }
    let phoneElement = document.querySelector(".activate-grid-item__numberq");
    let phone_number = ""
    if (!phoneElement) {
        return;
    }
    phone_number = phoneElement.innerText.replace(/\D/g, "");
    if (phone_number) {
        let imgElements = document.querySelectorAll('img.country_img');
        let country_code;
        imgElements.forEach(img => {
            let src = img.getAttribute('src');
            let number = src.match(/(\d+)\.svg$/);
            if (number) {
                country_code = number[1];
            }
        });
        // remove country code from the number
        if(country_code == 16){ // United Kingdom
            phone_number = phone_number.substring(2);
        }
        await browser.runtime.sendMessage({ type: "phone_number", phone_number: phone_number, country_code: country_code });
    }
    const smscodeElement = document.querySelector(".underline-orange.cursor-pointer");
    if (!smscodeElement || !isSixDigitNumber(smscodeElement.textContent)) {
        return;
    }
    await browser.runtime.sendMessage({ type: "smscode", smscode: smscodeElement.textContent });
};



const sms_intervals = {
    handleSmsActivate: null
};


const onSmsLoad = async () => {
    sms_intervals.handleSmsActivate = setInterval(handleSmsActivate, 500);
    setInterval(async function () {
        let result = await browser.storage.local.get("automation");
        let phoneElement = document.querySelector(".activate-grid-item__numberq");
        if (result.automation && phoneElement) {
            location.reload();
        }
    }, 10000); // 1000 milliseconds = 1 second
}


if (document.readyState === "complete") {
    onSmsLoad();
} else {
    window.addEventListener("load", onSmsLoad);
}
