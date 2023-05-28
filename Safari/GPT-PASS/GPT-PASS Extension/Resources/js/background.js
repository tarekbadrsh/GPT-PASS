/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Open extension options page
function configureExtension() {
    browser.runtime.openOptionsPage()
        .then(() => console.log('Opened options page'))
        .catch((error) => console.error('Error opening options page:', error));
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
    console.log(message)
    const windows = await browser.windows.getAll({ populate: true });
    let facebookWindow;
    let facebookTab;
    let openAIWindow;
    let openAITab;
    for (const window of windows) {
        for (const tab of window.tabs) {
            if (tab.url.includes("facebook.com")) {
                facebookWindow = window;
                facebookTab = tab;
            }
            if (tab.url.includes("openai.com")) {
                openAIWindow = window;
                openAITab = tab;
            }
        }
    }
    switch (message.type) {
        case 'log-error':
            console.error(message.error, message.user);
            break;
        case 'new_user':
            const user = message.user;
            const tab = await browser.tabs.create({ url: `https://chat.openai.com/auth/login` });
            user.tabId = tab.id;
            await updateCurrentUser(user);
            break;
        case 'update-user':
            const update_user = message.user;
            await updateCurrentUser(update_user);
            break;
        case 'phone_number':
            let currentUser = await browser.storage.local.get("currentUser");
            currentUser.currentUser.phone_number = message.phone_number;
            await updateCurrentUser(currentUser.currentUser);
            break;
        case 'smscode':
            let currentUserSms = await browser.storage.local.get("currentUser");
            if (smscodeSet.has(message.smscode)) {
                await browser.storage.local.set({ smscode: "" });
                break;
            }
            currentUserSms.currentUser.smscode = message.smscode;
            await updateCurrentUser(currentUserSms.currentUser);
            smscodeSet.add(message.smscode);
            break;
        case 'clear-all-data':
            await clearAllData();
            await browser.tabs.sendMessage(facebookTab.id, { type: 'clear-all-data' });
            await browser.tabs.sendMessage(openAITab.id, { type: 'clear-all-data' });
            break;
        case 'status':
            message.user.status = message.status;
            await updateCurrentUser(message.user);
            switch (message.status) {
                case 'signup-v':
                    if (sendMessageFacebook_signup_v.has(message.user.email)) {
                        break;
                    }
                    sendMessageFacebook_signup_v.add(message.user.email);
                    await browser.tabs.sendMessage(facebookTab.id, { type: 'send-password', user: message.user });
                    break;
                case 'user-already-exists':
                    if (sendMessageFacebook_user_exists.has(message.user.email)) {
                        break;
                    }
                    sendMessageFacebook_user_exists.add(message.user.email);
                    await browser.tabs.sendMessage(facebookTab.id, { type: 'send-user-already-exists', user: message.user });
                    break;
                case 'done':
                    if (sendMessageFacebook_done.has(message.user.email)) {
                        break;
                    }
                    sendMessageFacebook_done.add(message.user.email);
                    await browser.tabs.sendMessage(facebookTab.id, { type: 'send-done-to-user', user: message.user });
                    break;
                default:
                    break;
            }
            break;
        case 'closeCurrentTab':
            const cur_user = message.user;
            const windows = await browser.windows.getAll({ populate: true });
            for (const window of windows) {
                for (const tab of window.tabs) {
                    if (tab.id == cur_user.tabId) {
                        await sleep(5000);
                        await browser.tabs.remove(tab.id);
                    }
                }
            }
            await browser.windows.update(facebookWindow.id, { focused: true });
            await browser.tabs.update(facebookTab.id, { active: true });
            break;
    }
});
