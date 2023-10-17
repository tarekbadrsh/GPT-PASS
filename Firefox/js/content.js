/*
 * Optimized content.js for an extension
 */


class User {
    constructor(facebookUrl, instagramUrl, email, first_name, last_name) {
        this.status = "";
        this.chatTabId = "";
        this.facebookWindowId = "";
        this.facebookTabId = "";
        this.facebookUrl = facebookUrl;
        this.instagramUrl = instagramUrl;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.setBirthDate();
        this.phone_number = "";
        this.country_code = "";
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

const generateRandomBirthDate = () => {
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;
    const randomMonth = (Math.floor(Math.random() * 11) + 1).toString().padStart(2, '0');
    const randomDay = (Math.floor(Math.random() * 11) + 1).toString().padStart(2, '0');
    return `${randomMonth}/${randomDay}/${randomYear}`;
}

// Generate a hash for a given string 
const generateHash = async (str) => {
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

const simulateKeyPressAndRelease = async (targetElement, key, code, keyCode, charCode) => {
    const keyDownEvent = new KeyboardEvent('keydown', {
        key: key,
        code: code,
        keyCode: keyCode,
        charCode: charCode,
        bubbles: true
    });
    targetElement.dispatchEvent(keyDownEvent);

    const keyUpEvent = new KeyboardEvent('keyup', {
        key: key,
        code: code,
        keyCode: keyCode,
        charCode: charCode,
        bubbles: true
    });
    targetElement.dispatchEvent(keyUpEvent);
}

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const simulateMouseEvents = async (targetElement) => {
    if (!targetElement) {
        return false;
    }
    const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX: targetElement.getBoundingClientRect().x, clientY: targetElement.getBoundingClientRect().y });
    document.dispatchEvent(mouseMoveEvent);
    const mouseOverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseOverEvent);
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseDownEvent);
    const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
    targetElement.dispatchEvent(mouseUpEvent);

    // Simulate click after a small delay to mimic human interaction 
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    await sleep(100);
    await targetElement.dispatchEvent(clickEvent);
    return targetElement
}