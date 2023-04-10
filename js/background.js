/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

// Function to save a password and email
function saveUser(user) {
    // Get the list of saved users
    browser.storage.local.get("users").then(function (result) {
        const users = result.users || [];
        // Add an ID to the user object
        user.id = users.length + 1;
        // Add the new password and email to the list
        users.push(user);
        // Save the updated list of passwords
        browser.storage.local.set({ users }).catch(function (err) {
            console.error(`Error saving password: ${err}`);
        });
        navigator.clipboard.writeText(user.password);
    }).catch(function (err) {
        console.error(`Error getting passwords: ${err}`);
    });
    browser.storage.local.set({ currentUser: user }).catch(function (err) {
        console.error(`Error SET Current user: ${err}`);
    });
}

function getCharset(options) {
    let charset = "";
    if (options.includeLowercase) {
        charset += "abcdefghijklmnopqrstuvwxyz";
    }
    if (options.includeUppercase) {
        charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (options.includeNumbers) {
        charset += "0123456789";
    }
    if (options.includeSymbols) {
        charset += "!@#$%^&*()_+{}[];:<>,.?/";
    }
    if (options.excludeSimilar) {
        charset = charset.replace(/[iloIO01]/g, "");
    }
    if (options.excludeAmbiguous) {
        charset = charset.replace(/[\{\}\[\]\(\)\|\\\~\^:,\;\.<>\?"'`\/]/g, "");
    }
    return charset;
}

function generateHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data)
        .then(digest => {
            const hashArray = Array.from(new Uint8Array(digest));
            const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
            const result = hashHex.slice(0, 16);
            return result;
        }).catch((err) => { // Catch any errors
            console.error(`Failed to read clipboard: ${err}`);
            return null;
        });
}


function validateEmail(email) {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
}

function extractEmail(input) {
    let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = input.match(emailRegex);
    if (emails && emails.length > 0 && validateEmail(emails[0])) {
        return emails[0];
    }
    console.error(`Can't find email in the input`);
    return "";
}

/**
 * Extracts the text from the clipboard
 * @returns {string} The text from the clipboard
 */
function getclipboardText(callback) {
    navigator.clipboard.readText().then((text) => {
        if (text) {
            callback(text);
        }
    });
}

function getSelectedText(callback) {
    browser.tabs.executeScript({ code: "window.getSelection().toString();" }, function (results) {
        let text = results[0];
        if (text) {
            callback(text);
        } else {
            getclipboardText(callback);
        }
    });
}

function generatePassword(selectedText) {
    let user = { email: "", password: "" };
    if (selectedText) {
        user.email = extractEmail(selectedText);
        generateHash(user.email).then(myHash => {
            user.password = myHash;
        });
    }
    if (!user.email) {
        // Retrieve options from storage
        browser.storage.local.get({
            passwordLength: 16,
            includeSymbols: true,
            includeNumbers: true,
            includeLowercase: true,
            includeUppercase: true,
            excludeSimilar: true,
            excludeAmbiguous: true,
        }).then(function (options) {
            // Use options to generate password
            const length = options.passwordLength;
            const charset = getCharset(options);
            let values = new Uint32Array(length);
            window.crypto.getRandomValues(values);
            for (let i = 0; i < length; i++) {
                user.password += charset[values[i] % charset.length];
            }
            user.email = "tmp@tmp.com"
        }).catch((err) => { // Catch any errors
            console.error(`Failed to read clipboard: ${err}`);
            return null;
        });
    }
    // Save the user to storage
    saveUser(user);
}

// Function to configure the extension
function configureExtension() {
    console.log("Configure Extension context menu item clicked START.");
    // Open the options page for the extension
    browser.runtime.openOptionsPage().then(function () {
        console.log("Opened options page");
    }, function (error) {
        console.error("Error opening options page:", error);
    });
    console.log("Configure Extension context menu item clicked END.");
}

// Array of context menu items
var contextMenus = [
    {
        id: "generate-password",
        title: "GPT-PASS",
        contexts: ["all"],
        parentId: null,
        method: generatePassword,
        icons: {
            "16": "icons/icon48.png",
            "32": "icons/icon48.png"
        }
    },

];

browser.runtime.onInstalled.addListener(function () {
    console.log("GPT-PASS START");
    for (var i = 0; i < contextMenus.length; i++) {
        var menu = contextMenus[i];
        browser.contextMenus.create({
            id: menu.id,
            title: menu.title,
            contexts: menu.contexts,
            parentId: menu.parentId,
            icons: menu.icons
        });
        console.log("Context menu item added: " + menu.title);
    }
});

// Handle click event on the context menu item
browser.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "generate-password") {
        // Call your internalGeneratePassword function here
        getSelectedText(generatePassword);
    }
});

browser.runtime.onMessage.addListener((message) => {
    // Handle the email as needed
    generatePassword(message.email)
});


function sendMessageToTabs(tabs) {
    for (const tab of tabs) {
        browser.tabs
            .sendMessage(tab.id, { greeting: "Hi from background script" })
            .then((response) => {
                console.log("Message from the content script:");
                console.log(response.response);
            });
    }
}

