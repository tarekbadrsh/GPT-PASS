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
        await navigator.clipboard.writeText(user.password);
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

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener(async (message) => {
    switch (message.type) {
        case 'user':
            const user = { ...message.user };
            await browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
                user.tabId = tabs[0].id;
            });
            await updateCurrentUser(user);
            let privateWindow = {
                url: "https://chat.openai.com/auth/login",
                incognito: true
            };
            await browser.windows.create(privateWindow);
            break;
        case 'status':
            console.log(message);
            const result = await browser.storage.local.get("currentUser");
            await updateCurrentUser(result.currentUser);
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
            break;
        case 'closeCurrentTab':
            browser.tabs.query({}).then((tabs) => {
                for (let tab of tabs) {
                    if (tab.active && tab.url.includes("openai.com")) {
                        setTimeout(() => {
                            browser.tabs.remove(tab.id);
                        }, 15000);
                    }
                }
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
