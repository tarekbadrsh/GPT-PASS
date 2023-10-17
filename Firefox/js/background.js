/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Save user to the list of users
async function saveUserToList(user) {
    if (!user || !user.email) return;
    try {
        const { users = [] } = await browser.storage.local.get('users');
        const existingUserIndex = users.findIndex((u) => u.email === user.email);
        if (existingUserIndex !== -1) {
            users.splice(existingUserIndex, 1);
        }
        users.push(user);
        await browser.storage.local.set({ users });
    } catch (err) {
        console.error(`Error handling users: ${err}`);
    }
}

// Update the current user
async function updateCurrentUser(user) {
    await browser.storage.local.set({ currentUser: user });
    await saveUserToList(user);
}

const sendMessageFacebook_signup_v = new Set();
const sendMessageFacebook_user_exists = new Set();
const sendMessageFacebook_done = new Set();
const smscodeSet = new Set();

const clearAllData = async () => {
    sendMessageFacebook_signup_v.clear();
    sendMessageFacebook_user_exists.clear();
    sendMessageFacebook_done.clear();
    smscodeSet.clear();
    await browser.storage.local.set({ users: [], currentUser: {} });
}


// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener(async (message) => {
    let user;
    if (message.user) {
        user = message.user;
    } else {
        const result = await browser.storage.local.get("currentUser");
        user = result.currentUser;
    }
    switch (message.type) {
        case 'log-error':
            console.error(message.error, user);
            break;
        case 'new_user':
            const facebookWindow = await browser.windows.getCurrent();
            user.facebookWindowId = facebookWindow.id;
            const [facebookTab] = await browser.tabs.query({ active: true, windowId: facebookWindow.id });
            user.facebookTabId = facebookTab.id;
            const chatWindow = await browser.windows.create({
                url: "https://chat.openai.com/auth/login",
                incognito: true
            });
            sleep(100);
            const [chatTab] = await browser.tabs.query({ windowId: chatWindow.id });
            user.chatTabId = chatTab.id;
            await updateCurrentUser(user);
            break;
        case 'update-user-status':
            user.status = message.status;
            await updateCurrentUser(user);
            break;
        case 'update-user':
            await updateCurrentUser(user);
            switch (user.status) {
                case 'signup-v':
                    if (sendMessageFacebook_signup_v.has(user.email)) {
                        return;
                    }
                    sendMessageFacebook_signup_v.add(user.email);
                    await browser.tabs.sendMessage(user.facebookTabId, { type: 'send-password', user: user });
                    break;
                case 'user-already-exists':
                    if (sendMessageFacebook_user_exists.has(user.email)) {
                        return;
                    }
                    sendMessageFacebook_user_exists.add(user.email);
                    await browser.tabs.sendMessage(user.facebookTabId, { type: 'send-user-already-exists', user: user });
                    break;
                case 'done':
                    if (sendMessageFacebook_done.has(user.email)) {
                        return;
                    }
                    sendMessageFacebook_done.add(user.email);
                    await browser.tabs.sendMessage(user.facebookTabId, { type: 'send-done-to-user', user: user });
                    break;
                default:
                    break;
            }
            break;
        case 'phone_number':
            user.phone_number = message.phone_number.phoneNumber;
            user.country_code = message.phone_number.countryCode;
            if(Object.values(message.phone_number.smsCodes)[0]){
                const sms = Object.keys(message.phone_number.smsCodes)[0];
                if (!smscodeSet.has(sms)) {
                    smscodeSet.add(sms)
                    user.smscode = sms
                 }
            }
            await updateCurrentUser(user);
            break;
        case 'clear-all-data':
            await clearAllData();
            await browser.tabs.sendMessage(user.facebookTabId, { type: 'clear-all-data' });
            break;
        case 'closeCurrentTab':
            await browser.windows.update(user.facebookWindowId, { focused: true });
            await browser.tabs.update(user.facebookTabId, { active: true });
            await sleep(message.duration);
            await browser.tabs.remove(user.chatTabId);
            break;
    }
});
