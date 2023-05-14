/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

// Save user to the list of users
async function saveUserToList(user) {
    if (!user || !user.email) return;
    try {
        const { users = [] } = await browser.storage.local.get('users');
        const existingUserIndex = users.findIndex((u) => u.email === user.email);

        if (existingUserIndex !== -1) {
            users.splice(existingUserIndex, 1);
        } else {
            user.id = users.length + 1;
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

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'user') {
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
    }
    if (message.type === "closeCurrentTab") {
        browser.tabs.query({}).then((tabs) => {
            for (let tab of tabs) {
                // Check if the URL of the tab includes "openai.com"
                if (tab.active && tab.url.includes("openai.com")) {
                    // Wait for 15 seconds (15000 milliseconds)
                    setTimeout(() => {
                        // Then close the tab
                        browser.tabs.remove(tab.id);
                    }, 15000);
                }
            }
        });
        browser.windows.getAll({ populate: true }).then(windows => {
            windows.forEach(window => {
                window.tabs.forEach(tab => {
                    if (tab.url.includes("facebook.com")) {
                        // Focus this window
                        browser.windows.update(window.id, { focused: true });
                        // And make this tab active in its window
                        browser.tabs.update(tab.id, { active: true });
                    }
                });
            });
        });
    }
});
