/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

// Function to save a password
function savePassword(password) {
    // Get the list of saved passwords
    browser.storage.local.get("passwords").then(function (result) {
        const passwords = result.passwords || [];
        // Add the new password to the list
        passwords.push(password);

        // Copy the password to the clipboard using the Clipboard API
        navigator.clipboard.writeText(password).then(function () {
            console.log("Password copied to clipboard");
        }, function (err) {
            console.error("Failed to copy password: ", err);
        });

        // Save the updated list of passwords
        browser.storage.local.set({ passwords }).then(function () {
            console.log("Password saved:", password);
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
        // Use options to generate password
        const length = options.passwordLength;
        const charset = getCharset(options);
        let password = "";
        let values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }
        // Save the password to storage
        savePassword(password);
    }, function (error) {
        console.error("Error getting options:", error);
    });
    console.log("Generate Password context menu item clicked END.");
}

// Function to view all passwords
function viewPasswords() {
    console.log("View Passwords context menu item clicked START.");
    // Get the list of saved passwords
    browser.storage.local.get("passwords").then(function (result) {
        const passwords = result.passwords || [];
        // Log the list of passwords to the console
        console.log("Saved passwords:", passwords);
    }, function (error) {
        console.error("Error getting passwords:", error);
    });
    console.log("View Passwords context menu item clicked END.");
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
        id: "view-passwords",
        title: "View All Passwords with GPT-PASS",
        contexts: ["all"],
        method: viewPasswords,
        onclick: function (info, tab) {
            viewPasswords();
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

