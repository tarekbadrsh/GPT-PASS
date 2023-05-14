function truncate(text, maxLength) {
    let noSpaces = text.replace(/[\s-]+/g, ',');
    if (noSpaces.length > maxLength) {
        return noSpaces.substr(0, maxLength) + '...';
    }
    return noSpaces;
}

function createButtonContainer(text) {
    if (!text) { return document.createElement("div") }
    const button = document.createElement("button");
    button.textContent = truncate(text, 16);
    button.setAttribute('data-tooltip', text);
    button.addEventListener("click", () => {
        navigator.clipboard.writeText(text);
    });

    const container = document.createElement("div");
    container.classList.add("button-container");
    container.appendChild(button);

    return container;
}

async function setCheckboxStateFromLocalStorage() {
    const autoFillCheckbox = document.getElementById('auto-fill-checkbox');
    if (autoFillCheckbox) {
        await browser.storage.local.get("autoFillCheckbox", (result) => {
            autoFillCheckbox.checked = result.autoFillCheckbox;
        });
    }
    const autoSmsCheckbox = document.getElementById('auto-sms-checkbox');
    if (autoSmsCheckbox) {
        await browser.storage.local.get("autoSmsCheckbox", (result) => {
            autoSmsCheckbox.checked = result.autoSmsCheckbox;
        });
    }
    const autoCloseTab = document.getElementById('auto-close-tab');
    if (autoCloseTab) {
        await browser.storage.local.get("autoCloseTab", (result) => {
            autoCloseTab.checked = result.autoCloseTab;
        });
    }
}

async function display() {
    const { users = [] } = await browser.storage.local.get('users');
    // Reverse the users array to display the users from last to first
    users.reverse();

    console.log("saveUserToList: ", users);
    const usersList = document.getElementById("users-list");

    users.forEach((userData) => {
        const li = document.createElement("li");
        li.appendChild(createButtonContainer(userData.email));
        li.appendChild(createButtonContainer(userData.password));
        li.appendChild(createButtonContainer(userData.first_name));
        li.appendChild(createButtonContainer(userData.last_name));
        li.appendChild(createButtonContainer(userData.birth_date));
        li.appendChild(createButtonContainer(userData.phone_number));
        li.appendChild(createButtonContainer(userData.smscode));
        const buttonRemove = document.createElement("button");
        buttonRemove.textContent = "X";
        buttonRemove.classList.add("remove");
        buttonRemove.addEventListener("click", async () => {
            const index = users.findIndex(u => u.email === userData.email);
            users.splice(index, 1);
            await browser.storage.local.set({ users });
            li.parentNode.removeChild(li);
        });

        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });

    const clearAllButton = document.getElementById("clear-all-button");
    clearAllButton.textContent = `Clear All (${users.length})`;
    clearAllButton.addEventListener("click", async () => {
        await browser.storage.local.set({ users: [] });
        await browser.storage.local.set({ currentUser: {} });
        const usersList = document.getElementById("users-list");
        usersList.innerHTML = "";
        clearAllButton.textContent = `Clear All (0)`;
    });
}


document.getElementById("auto-fill-checkbox").addEventListener("change", async function (event) {
    browser.storage.local.set({ autoFillCheckbox: event.target.checked });
});
document.getElementById("auto-sms-checkbox").addEventListener("change", async function (event) {
    browser.storage.local.set({ autoSmsCheckbox: event.target.checked });
});
document.getElementById("auto-close-tab").addEventListener("change", async function (event) {
    browser.storage.local.set({ autoCloseTab: event.target.checked });
});



display();
setCheckboxStateFromLocalStorage();