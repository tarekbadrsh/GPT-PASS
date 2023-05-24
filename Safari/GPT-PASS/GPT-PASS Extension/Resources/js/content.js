/*
 * Optimized content.js for an extension
 */

class User {
    constructor(facebookUrl, instagramUrl, email, first_name, last_name) {
        this.status = "";
        this.tabId = "";
        this.facebookUrl = facebookUrl;
        this.instagramUrl = instagramUrl;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.setBirthDate();
        this.phone_number = "";
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

function simulateKeyPressAndRelease(targetElement, key, code, keyCode, charCode) {
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
