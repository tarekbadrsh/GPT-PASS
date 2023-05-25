/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */


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

let sendMessageFacebook = new Set();
let smscodeSet = new Set();

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener(async (message) => {
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
            browser.storage.local.get("currentUser").then(function (result) {
                result.currentUser.phone_number = message.phone_number;
                updateCurrentUser(result.currentUser);
            });
            break;
        case 'smscode':
            browser.storage.local.get("currentUser").then(function (result) {
                if (smscodeSet.has(message.smscode)) {
                    browser.storage.local.set({ smscode: "" });
                    return;
                }
                result.currentUser.smscode = message.smscode;
                updateCurrentUser(result.currentUser);
                smscodeSet.add(message.smscode);
            });
            break;
        case 'status':
            message.user.status = message.status;
            await updateCurrentUser(message.user);
            if (message.status === 'signup-v' && !sendMessageFacebook.has(message.user.email)) {
                browser.windows.getAll({ populate: true }).then(windows => {
                    windows.forEach(window => {
                        window.tabs.forEach(tab => {
                            if (tab.url.includes("facebook.com")) {
                                browser.tabs.sendMessage(tab.id, { type: 'send-password', user: message.user });
                                sendMessageFacebook.add(message.user.email);
                            }
                        });
                    });
                });
            }
            if (message.status === 'user-already-exists' && !sendMessageFacebook.has(message.user.email)) {
                browser.windows.getAll({ populate: true }).then(windows => {
                    windows.forEach(window => {
                        window.tabs.forEach(tab => {
                            if (tab.url.includes("facebook.com")) {
                                browser.tabs.sendMessage(tab.id, { type: 'send-user-already-exists', user: message.user });
                                sendMessageFacebook.add(message.user.email);
                            }
                        });
                    });
                });
            }
            if (message.status === 'done' && !sendMessageFacebook.has(message.user.email)) {
                browser.windows.getAll({ populate: true }).then(windows => {
                    windows.forEach(window => {
                        window.tabs.forEach(tab => {
                            if (tab.url.includes("facebook.com")) {
                                browser.tabs.sendMessage(tab.id, { type: 'send-done-to-user', user: message.user });
                                sendMessageFacebook.add(message.user.email);
                            }
                        });
                    });
                });
            }
            break;
        case 'closeCurrentTab':
            const cur_user = message.user;
            browser.windows.getAll({ populate: true }).then(windows => {
                windows.forEach(window => {
                    window.tabs.forEach(tab => {
                        if (tab.id == cur_user.tabId) {
                            setTimeout(() => {
                                browser.tabs.remove(tab.id);
                            }, 10000);
                        }
                    });
                });
            });
            browser.windows.getAll({ populate: true }).then(windows => {
                windows.forEach(window => {
                    window.tabs.forEach(tab => {
                        if (tab.url.includes("facebook.com")) {
                            browser.windows.update(window.id, { focused: true });
                            browser.tabs.update(tab.id, { active: true });
                        }
                    });
                });
            });
            break;
    }
});
