class Number {
    /**
     * Creates a new Number instance.
     * 
     * @param {string} phoneNumber - The phone number.
     * @param {string} countryCode - The country code.
     */
    constructor(phoneNumber, countryCode, smsCode) {
        if (!phoneNumber || !countryCode) {
            throw new Error('Both phoneNumber and countryCode are required.');
        }
        this.phoneNumber = phoneNumber;
        this.countryCode = countryCode;
        this.smsCodes = {};
        if (smsCode) {
            this.smsCodes[smsCode] = true;
        }
        this.expire = false;
    }
}

const isSixDigitNumber = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
};

const remove_number = async (number) => {
    const removeNumberContainer = document.querySelector(".activate-grid-item__controls.mr-3");
    if (!removeNumberContainer) {
        return false;
    }
    const removeButton = removeNumberContainer.querySelectorAll("button")[0]; // title="Confirm"
    if (removeButton) { 
        await simulateMouseEvents(removeButton);
    }
}

const more_sms = async (number) => {
    const numberContainer = document.querySelector(".activate-grid-item__controls.mr-3");
    if (!numberContainer) {
        return false;
    }
    const moresmsButton = numberContainer.querySelectorAll("button")[1]; // title="More sms"
    if (moresmsButton) { 
        await simulateMouseEvents(moresmsButton);
    }
}


// Save number to the list of numbers
const saveNumberToList = async (new_number) => {
    if (!new_number || !new_number.phoneNumber) return;
    try {
        const { numbers = {} } = await browser.storage.local.get('numbers');
        
        // Only add new number if it doesn't already exist
        if(numbers[new_number.phoneNumber]){
            for (let smsCode in new_number.smsCodes) {
                if (!numbers[new_number.phoneNumber].smsCodes[smsCode]) {
                    numbers[new_number.phoneNumber].smsCodes[smsCode] = true;
                    if(Object.keys(numbers[new_number.phoneNumber].smsCodes).length < 2){
                        await more_sms(new_number);
                    }else if(Object.keys(numbers[new_number.phoneNumber].smsCodes).length > 1){
                        numbers[new_number.phoneNumber].expire = true;
                        await remove_number(new_number);
                    }
                }
            }
        } else {
            numbers[new_number.phoneNumber] = new_number;
        }
        await browser.storage.local.set({ numbers });
    } catch (err) {
        console.error(`Error handling users: ${err}`);
    }
}

const handleSmsActivate = async () => {
    let result = await browser.storage.local.get("automation");
    if (!result.automation) {
        return;
    }
    let phoneElement = document.querySelector(".activate-grid-item__numberq");
    if (!phoneElement) {
        return;
    }
    let phone_number = phoneElement.innerText.replace(/\D/g, "");
    if (!phone_number) {
        return;
    }
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
    let smscode = null;
    const smscodeElement = document.querySelector(".underline-orange.cursor-pointer");
    if (smscodeElement && isSixDigitNumber(smscodeElement.textContent)) {
        smscode = smscodeElement.textContent
    }
    let num = new Number(phone_number, country_code, smscode);
    await browser.runtime.sendMessage({ type: "phone_number", phone_number: num});
    await saveNumberToList(num);
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
