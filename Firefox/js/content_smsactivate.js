
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
//--- sms api 
async function handleUserNumbers(user) {
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
        }
    }
    updateCurrentUser(user);
}

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


const isSixDigitNumber = (value) => {
    const regex = /^\d{6}$/;
    return regex.test(value);
};

const handleSmsActivate = async () => {
    let phoneElement = document.querySelector(".activate-grid-item__numberq");
    let phone_number = ""
    if (!phoneElement) {
        return;
    }
    phone_number = phoneElement.innerText.replace(/\D/g, "");
    if (phone_number) {
        let imgElements = document.querySelectorAll('img.country_img');
        let country_code;
        imgElements.forEach(img => {
            let src = img.getAttribute('src');
            let number = src.match(/(\d+)\.svg$/);
            if (number) {
                country_code = number[1];
            }
        });
        await browser.runtime.sendMessage({ type: "phone_number", phone_number: phone_number, country_code: country_code });
    }
    const smscodeElement = document.querySelector(".underline-orange.cursor-pointer");
    if (!smscodeElement || !isSixDigitNumber(smscodeElement.textContent)) {
        return;
    }
    await browser.runtime.sendMessage({ type: "smscode", smscode: smscodeElement.textContent });
};



const sms_intervals = {
    handleSmsActivate: null
};


function onSmsLoad() {
    sms_intervals.handleSmsActivate = setInterval(handleSmsActivate, 500);
}


if (document.readyState === "complete") {
    onSmsLoad();
} else {
    window.addEventListener("load", onSmsLoad);
}
