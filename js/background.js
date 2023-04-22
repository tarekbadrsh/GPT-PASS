/**
 * GPT-PASS Background Script
 * This file contains the logic for the GPT-PASS extension.
 */

// Function to save a password and email
function saveUserToList(user) {
    if (!user || !user.email) {
        return;
    }
    // Get the list of saved users
    browser.storage.local.get("users").then(function (result) {
        const users = result.users || [];
        const isLastIndex = users.length > 0 && users[users.length - 1].email === user.email;
        if (isLastIndex) {
            return
        }
        // Check if the email already exists in the list of users
        const emailExists = users.some(u => u.email === user.email);
        if (emailExists) {
            // Move the existing user object to the bottom of the list
            const index = users.findIndex(u => u.email === user.email);
            users.splice(index, 1);
            users.push(user);
        } else {
            // Add an ID to the user object
            user.id = users.length + 1;
            // Add the new password and email to the list
            users.push(user);
        }
        navigator.clipboard.writeText(user.password);
        // Save the updated list of passwords
        browser.storage.local.set({ users }).catch(function (err) {
            console.error(`Error saving users: ${err}`);
        });
    }).catch(function (err) {
        console.error(`Error getting users: ${err}`);
    });
}



function updateCurrentUser(user) {
    // Update the local storage with the new user information
    browser.storage.local.get("currentUser").then((result) => {
        let new_user = { email: "", password: "", first_name: "", last_name: "", birth_date: "" };

        if (result && result.currentUser) {
            new_user = result.currentUser
        }

        // Update the existing user
        if (user.email) {
            new_user.email = user.email
        };
        if (user.password) {
            new_user.password = user.password
        };
        if (user.first_name) {
            new_user.first_name = user.first_name
        };
        if (user.last_name) {
            new_user.last_name = user.last_name
        };
        if (user.birth_date) {
            new_user.birth_date = user.birth_date
        };

        // Save the updated user data
        browser.storage.local.set({ currentUser: new_user }).catch((err) => {
            console.error(`Error SET Current user: ${err}`);
        });
        saveUserToList(new_user);
    }).catch((err) => {
        console.error(`Error GET Current user: ${err}`);
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
    let user = { email: "", password: "", first_name: "", last_name: "", birth_date: "" };
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
    updateCurrentUser(user);
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

function getRandomBirthDate() {
    // Generate a random year within the specified range
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;

    // Generate a random month (1 to 12)
    const randomMonth = Math.floor(Math.random() * 12) + 1;

    // Generate a random day, considering the number of days in each month
    const randomDay = Math.floor(Math.random() * 25) + 1;;

    // Return the random birth date as a string in the format 'MM/DD/YYYY'
    return `${randomMonth.toString().padStart(2, '0')}/${randomDay.toString().padStart(2, '0')}/${randomYear}`;
}

function processUsername(username) {
    // Trim the username
    username = username.trim();

    // Split the username into first and last names
    let first_name, last_name;
    const spaceIndex = username.indexOf(" ");
    if (spaceIndex !== -1) {
        first_name = username.slice(0, spaceIndex);
        last_name = username.slice(spaceIndex + 1);
    } else {
        first_name = username;
        last_name = "AI";
    }
    let user = { first_name: first_name, last_name: last_name, birth_date: getRandomBirthDate() };

    updateCurrentUser(user);
}


browser.runtime.onMessage.addListener((message) => {
    if (message.type === "email") {
        // Handle the email as needed
        generatePassword(message.email);
    } else if (message.type === "username") {
        // Handle the username as needed
        processUsername(message.username);
    }
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

