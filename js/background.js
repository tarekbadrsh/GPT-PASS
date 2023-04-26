/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

async function saveUserToList(user) {
    if (!user || !user.email) return;

    try {
        const { users = [] } = await browser.storage.local.get("users");
        const isLastIndex = users.length > 0 && users[users.length - 1].email === user.email;

        if (!isLastIndex) {
            const existingUserIndex = users.findIndex(u => u.email === user.email);

            if (existingUserIndex !== -1) {
                users.splice(existingUserIndex, 1);
            } else {
                user.id = users.length + 1;
            }

            users.push(user);
            await navigator.clipboard.writeText(user.password);
            await browser.storage.local.set({ users });
        }
    } catch (err) {
        console.error(`Error handling users: ${err}`);
    }
}

async function updateCurrentUser(user) {
    try {
        await browser.storage.local.set({ currentUser: user });
        saveUserToList(user);
    } catch (err) {
        console.error(`Error setting current user: ${err}`);
    }
}

async function generateHash(str) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(digest));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.slice(0, 16);
    } catch (err) {
        console.error(`Failed to generate hash: ${err}`);
        return null;
    }
}

async function getClipboardText(callback) {
    try {
        const text = await navigator.clipboard.readText();
        if (text) callback(text);
    } catch (err) {
        console.error(`Failed to read clipboard: ${err}`);
    }
}

function getSelectedText(callback) {
    browser.tabs.executeScript({ code: "window.getSelection().toString();" }, (results) => {
        const text = results[0];

        if (text) {
            callback(text);
        } else {
            getClipboardText(callback);
        }
    });
}

function configureExtension() {
    browser.runtime.openOptionsPage()
        .then(() => console.log("Opened options page"))
        .catch((error) => console.error("Error opening options page:", error));
}

function generateRandomBirthDate() {
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;
    const randomMonth = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const randomDay = (Math.floor(Math.random() * 25) + 1).toString().padStart(2, '0');

    return `${randomMonth}/${randomDay}/${randomYear}`;
}

browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === "user") {
        const user = { ...message.user, birth_date: generateRandomBirthDate() };
        const hash = await generateHash(user.email);
        user.password = hash;
        updateCurrentUser(user);
    }
});
