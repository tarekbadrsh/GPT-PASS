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

async function displayUsers() {
    const { users = undefined } = await browser.storage.local.get("users");
    if (!users) {
        return;
    }
    const usersList = document.getElementById("users-list");
    // Reverse the users array to display the users from last to first
    users.reverse();

    const clearAllButton = document.getElementById("clear-all-button");
    clearAllButton.textContent = `Clear All (${users.length})`;

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
        buttonRemove.addEventListener("click", () => {
            removeUserFromList(li, userData);
        });

        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });
}

displayUsers();

async function removeUserFromList(li, user) {
    const { users = undefined } = await browser.storage.local.get("users");
    if (!users) {
        return;
    }
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
        users.splice(index, 1);
        await browser.storage.local.set({ users });
        li.parentNode.removeChild(li);
    }
}

document.getElementById("clear-all-button").addEventListener("click", async () => {
    await browser.storage.local.set({ users: undefined });
    await browser.storage.local.set({ currentUser: undefined });

    const usersList = document.getElementById("users-list");
    usersList.innerHTML = "";
});

document.getElementById("auto-fill-checkbox").addEventListener("change", async function () {
    await browser.storage.local.set({ "autoFillCheckbox": this.checked });
});
