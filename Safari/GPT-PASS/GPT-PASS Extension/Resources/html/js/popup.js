const truncate = (text, maxLength) => {
    const noSpaces = text.replace(/[\s-]+/g, ',');
    return noSpaces.length > maxLength ? `${noSpaces.substr(0, maxLength)}...` : noSpaces;
}


const createButtonContainer = (text) => {
    if (!text) { return document.createElement("div") }

    const button = document.createElement("button");
    button.textContent = truncate(text, 16);
    button.setAttribute('data-tooltip', text);
    button.addEventListener("click", () => navigator.clipboard.writeText(text));

    const container = document.createElement("div");
    container.classList.add("button-container");
    container.appendChild(button);

    return container;
}


async function display() {
    const { users: storedUsers = [] } = await browser.storage.local.get('users');
    const users = [...storedUsers].reverse();

    const usersList = document.getElementById("users-list");

    users.forEach((userData) => {
        const li = document.createElement("li");
        ['email', 'password', 'first_name', 'last_name', 'birth_date', 'phone_number', 'smscode'].forEach(field =>
            li.appendChild(createButtonContainer(userData[field]))
        );

        const buttonRemove = document.createElement("button");
        buttonRemove.textContent = "X";
        buttonRemove.classList.add("remove");
        buttonRemove.addEventListener("click", async () => {
            const updatedUsers = users.filter(u => u.email !== userData.email);
            await browser.storage.local.set({ users: updatedUsers });
            li.parentNode.removeChild(li);
        });

        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });

    const clearAllButton = document.getElementById("clear-all-button");
    clearAllButton.textContent = `Clear All (${users.length})`;
    clearAllButton.addEventListener("click", async () => {
        await browser.storage.local.set({ users: [], currentUser: {} });
        usersList.innerHTML = "";
        clearAllButton.textContent = `Clear All (0)`;
    });
}


async function setCheckboxStateFromLocalStorage(id) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
        const result = await browser.storage.local.get(id);
        checkbox.checked = result[id];
    }
}

function addCheckboxListener(id) {
    const checkbox = document.getElementById(id);
    checkbox.addEventListener("change", async function (event) {
        browser.storage.local.set({ [id]: event.target.checked });
    });
}

['autoFillCheckbox', 'autoSmsCheckbox', 'autoCloseTab'].forEach(id => {
    setCheckboxStateFromLocalStorage(id);
    addCheckboxListener(id);
});

display();
