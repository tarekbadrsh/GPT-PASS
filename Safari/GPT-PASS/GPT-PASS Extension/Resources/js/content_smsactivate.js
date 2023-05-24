
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
        browser.runtime.sendMessage({ type: "phone_number", phone_number: phone_number });
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



const sms_intervals = {
    handleSmsActivate: null
};


function onSmsLoad() {
    sms_intervals.handleSmsActivate = setInterval(handleSmsActivate, 500);
}


if (document.readyState === "complete") {
    onSmsLoad();
} else {
    window.addEventListener("load", onSmsLoad);
}
