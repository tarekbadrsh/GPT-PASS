/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

// Function to save a password and email
function savePassword(user) {
    console.log("Password saved:", user.password, "with email:", user.email);
    // Get the list of saved users
    browser.storage.local.get("users").then(function (result) {
        const users = result.users || [];
        // Add the new password and email to the list
        users.push(user);

        // Copy the password to the clipboard using the Clipboard API
        navigator.clipboard.writeText(user.password).then(function () {
            console.log("Password copied to clipboard" + user.password);
        }, function (err) {
            console.error("Failed to copy password: ", err);
        });

        // Save the updated list of passwords
        browser.storage.local.set({ users }).then(function () {
            console.log("Password saved:", user.password, "with email:", user.email);
        }, function (error) {
            console.error("Error saving password:", error);
        });
    }, function (error) {
        console.error("Error getting passwords:", error);
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

function generateHash(str) {
    console.log("generateHash(input) " + str);
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data)
        .then(digest => {
            const hashArray = Array.from(new Uint8Array(digest));
            const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
            const result = hashHex.slice(0, 16);
            console.log("result " + result);
            return result;
        });
}


function validateEmail(email) {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
}

function extractEmail(input) {
    console.log("input: " + input);
    let emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = input.match(emailRegex);
    if (emails && emails.length > 0 && validateEmail(emails[0])) {
        console.log("extracted emails: " + emails);
        return emails[0];
    }
    console.error("Can't find email in the input");
    return "";
}


// Function to generate a new password
function generatePassword() {
    console.log("Generate Password context menu item clicked START.");
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
        let user = { password: "", email: "" };
        // Access the clipboard and get the last copied text
        navigator.clipboard.readText().then((text) => {
            user.email = extractEmail(text);
            generateHash(user.email).then(myHash => {
                user.password = myHash;
            });
            console.log("user: " + user);
            savePassword(user);
        });
        if (user.email) {
            return;
        }
        // Use options to generate password
        const length = options.passwordLength;
        const charset = getCharset(options);
        let new_password = "";
        let values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            new_password += charset[values[i] % charset.length];
        }
        // Save the password to storage
        savePassword({ password: new_password, email: new_password + "@example.com" });
    }, function (error) {
        console.error("Error getting options:", error);
    });

    browser.tabs
        .query({
            currentWindow: true,
            active: true,
        })
        .then(sendMessageToTabs);
    console.log("Generate Password context menu item clicked END.");
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
        title: "Generate New Password with GPT-PASS",
        contexts: ["all"],
        method: generatePassword,
        onclick: function (info, tab) {
            generatePassword();
        }
    },
    {
        id: "configure-extension",
        title: "Configure GPT-PASS",
        contexts: ["all"],
        method: configureExtension,
        onclick: function (info, tab) {
            configureExtension();
        }
    }
];

// Add the context menu items to the browser
browser.runtime.onInstalled.addListener(function () {
    for (var i = 0; i < contextMenus.length; i++) {
        var menu = contextMenus[i];
        browser.contextMenus.create({
            id: menu.id,
            title: menu.title,
            contexts: menu.contexts
        });
        console.log("Context menu item added: " + menu.title);
    }
});

// Listen for a context menu item to be clicked
browser.contextMenus.onClicked.addListener(function (info, tab) {
    for (var i = 0; i < contextMenus.length; i++) {
        if (info.menuItemId === contextMenus[i].id) {
            contextMenus[i].method();
        }
    }
});
