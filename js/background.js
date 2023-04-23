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
    // Save the updated user data
    browser.storage.local.set({ currentUser: user }).catch((err) => {
        console.error(`Error SET Current user: ${err}`);
    });
    saveUserToList(user);
    console.log("user :", user);
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

function generateRandomBirthDate() {
    // Generate a random year within the specified range
    const randomYear = Math.floor(Math.random() * (1995 - 1970 + 1)) + 1970;

    // Generate a random month (1 to 12)
    const randomMonth = Math.floor(Math.random() * 12) + 1;

    // Generate a random day, considering the number of days in each month
    const randomDay = Math.floor(Math.random() * 25) + 1;;

    // Return the random birth date as a string in the format 'MM/DD/YYYY'
    return `${randomMonth.toString().padStart(2, '0')}/${randomDay.toString().padStart(2, '0')}/${randomYear}`;
}

browser.runtime.onMessage.addListener((message) => {
    // Handle user
    if (message.type === "user") {
        let user = message.user
        user.birth_date = generateRandomBirthDate()
        generateHash(user.email).then(hash => {
            user.password = hash;
            updateCurrentUser(user);
        });
    }
});

