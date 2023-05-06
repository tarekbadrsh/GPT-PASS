function truncate(text, maxLength) {
    if (text.length > maxLength) {
        return text.substr(0, maxLength) + '...';
    }
    return text;
}

function createButtonContainer(text) {
    const button = document.createElement("button");
    button.textContent = truncate(text, 20);
    button.setAttribute('data-tooltip', text);
    button.addEventListener("click", () => {
        navigator.clipboard.writeText(text);
    });

    const container = document.createElement("div");
    container.classList.add("button-container");
    container.appendChild(button);

    return container;
}

function setCheckboxStateFromLocalStorage() {
    const checkbox = document.getElementById('auto-fill-checkbox');
    if (checkbox) {
        browser.storage.local.get("autoFillCheckbox", (result) => {
            checkbox.checked = result.autoFillCheckbox;
        });
    }
}

async function display() {
    const { users = [] } = await browser.storage.local.get("users");

    // Reverse the users array to display the users from last to first
    users.reverse();

    const usersList = document.getElementById("users-list");

    users.forEach((userData) => {
        const li = document.createElement("li");
        li.appendChild(createButtonContainer(userData.email));
        li.appendChild(createButtonContainer(userData.password));
        li.appendChild(createButtonContainer(userData.first_name));
        li.appendChild(createButtonContainer(userData.last_name));
        li.appendChild(createButtonContainer(userData.birth_date));
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


display();
setCheckboxStateFromLocalStorage();