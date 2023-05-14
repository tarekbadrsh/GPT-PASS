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


class Number {
    constructor(phoneNumber, activationId) {
        this.phoneNumber = phoneNumber;
        this.activationId = activationId;
        this.smsCodes = [];
        this.users = [];
    }

    addSmsCode(smsCode) {
        this.smsCodes.push(smsCode);
    }

    removeSmsCode(smsCode) {
        const index = this.smsCodes.indexOf(smsCode);
        if (index > -1) {
            this.smsCodes.splice(index, 1);
        }
    }

    addUser(user) {
        this.users.push(user);
    }

    removeUser(user) {
        const index = this.users.indexOf(user);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }
}




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

/*
// check if user has number
    // check if user waiting for a code
        //- get the user code
// if not
    // get the user number
        // check if there is available number
            //- assign number to user
            //- update local storage for numbers
        // if not request new number
            //- request new number
            //- assign number to user
            //- update local storage for numbers

*/
async function handleUserNumbers(user) {
    const { numbers = [] } = await browser.storage.local.get('numbers');

    // Check if the user is already assigned to a number
    const assignedNumber = numbers.find(number => number.users.some(u => u.email === user.email));

    if (assignedNumber) {
        // User already has a number
        const userIndex = assignedNumber.users.findIndex(u => u.email === user.email);
        const assignedUser = assignedNumber.users[userIndex];

        if (assignedUser.number.smscode === 'NAN') {
            // User is waiting for a code
            // Get the user code
            const code = await requestActivationCode(assignedUser.number.activationId);

            // Check if the code is already assigned to another user
            const isCodeAssigned = numbers.some(number =>
                number.users.some(u => u.number.smscode === code)
            );

            if (!isCodeAssigned) {
                // If the code is not already assigned, assign it to the user
                assignedUser.number.smscode = code;
                user.number.smscode = code;

                // Update the numbers list with the new code for the user
                assignedNumber.users[userIndex] = assignedUser;

                // Update local storage for numbers
                await browser.storage.local.set({ numbers });
            }
        }
    } else {
        // User does not have a number yet

        // Find a number with zero or one users
        const suitableNumber = numbers.find(number => number.users.length <= 1);

        if (suitableNumber) {
            // Assign number to user
            user.number.phone_number = suitableNumber.number;
            user.number.activationId = suitableNumber.activationId;
            suitableNumber.users.push(user);

            // Update local storage for numbers
            await browser.storage.local.set({ numbers });
        } else {
            // Request a new number
            const result = await requestNewNumber();
            user.number.phone_number = result.phoneNumber;
            user.number.activationId = result.activationId;

            // Create a new number object and add the user to its users
            const newNumber = {
                number: result.phoneNumber,
                activationId: result.activationId,
                users: [user],
            };

            // Add the new number to the numbers list and update local storage
            numbers.push(newNumber);
            await browser.storage.local.set({ numbers });
        }
        console.log("numbers ", numbers);
    }
    updateCurrentUser(user);
    console.log("user :", user);
}




//--- sms api 


// Replace these with your own values
const apiKey = '';
const country = 32; // Romania
const service = 'dr'; // OpenAI

// Function to request a number
async function requestNewNumber() {
    // const url = `https://sms-activate.org/stubs/handler_api.php?api_key=${apiKey}&action=getNumber&service=${service}&country=${country}`;
    // const response = await fetch(url);
    // const text = await response.text();
    // if (!text.startsWith('ACCESS_NUMBER')) {
    //     console.error(`Failed to get number: ${text}`);
    //     return
    // }
    // const [, activationId, phoneNumber] = text.split(':');
    // return { activationId, phoneNumber }
    const activationId = "123123123";
    const phoneNumber = "456456456";
    return { activationId, phoneNumber }
}

// Function to request activation code
async function requestActivationCode(activationId) {
    // const url = `https://sms-activate.org/stubs/handler_api.php?api_key=${apiKey}&action=getStatus&id=${activationId}`;
    // let status;
    // do {
    //     const response = await fetch(url);
    //     status = await response.text();
    //     if (status.startsWith('STATUS_OK')) {
    //         const [, code] = status.split(':');
    //         return code;
    //     }

    //     // Wait for 5 seconds before checking the status again
    //     await new Promise(resolve => setTimeout(resolve, 2000));
    // } while (status === 'STATUS_WAIT_CODE');

    // throw new Error(`Failed to get activation code: ${status}`);
    return "123456"
}

// Listen for messages from other parts of the extension
browser.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'user') {
        const user = { ...message.user };
        await browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            user.tabId = tabs[0].id;
        });
        await updateCurrentUser(user);
        await browser.tabs.create({ url: `https://chat.openai.com/auth/login` });
    }
    if (message.type === "closeCurrentTab") {
        browser.tabs.query({}).then((tabs) => {
            for (let tab of tabs) {
                // Check if the URL of the tab includes "openai.com"
                if (tab.active && tab.url.includes("openai.com")) {
                    // Wait for 5 seconds (5000 milliseconds)
                    setTimeout(() => {
                        // Then close the tab
                        browser.tabs.remove(tab.id);
                    }, 15000);
                }
                // Check if the URL of the tab includes "facebook.com"
                if (tab.url.includes("facebook.com")) {
                    setTimeout(() => {
                        // Then close the tab
                        browser.tabs.update(tab.id, { active: true });
                    }, 100);
                }
            }
        });
    }
});