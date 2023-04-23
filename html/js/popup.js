function truncate(text, maxLength) {
    if (text.length > maxLength) {
        return text.substr(0, maxLength) + '...';
    }
    return text;
}

function createButtonContainer(text) {
    var button = document.createElement("button");
    button.textContent = truncate(text, 20);
    button.setAttribute('data-tooltip', text);
    button.addEventListener("click", function () {
        navigator.clipboard.writeText(text);
    });
    var container = document.createElement("div");
    container.classList.add("button-container");
    container.appendChild(button);

    return container;
}

browser.storage.local.get("users").then((result) => {
    var users = result.users || [];
    var usersList = document.getElementById("users-list");

    // Reverse the users array to display the users from last to first
    users.reverse();

    var clearAllButton = document.getElementById("clear-all-button");
    clearAllButton.textContent = `Clear All (${users.length})`;


    users.forEach(function (userData) {
        var li = document.createElement("li");
        li.appendChild(createButtonContainer(userData.email));
        li.appendChild(createButtonContainer(userData.password));
        li.appendChild(createButtonContainer(userData.first_name));
        li.appendChild(createButtonContainer(userData.last_name));
        li.appendChild(createButtonContainer(userData.birth_date));
        var buttonRemove = document.createElement("button");
        buttonRemove.textContent = "X";
        buttonRemove.classList.add("remove");
        buttonRemove.addEventListener("click", function () {
            removeUserFromList(li, userData);
        });
        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });
}).catch(function (err) {
    console.error(`Error loading users: ${err}`);
});


function removeUserFromList(li, user) {
    browser.storage.local.get("users").then((result) => {
        var users = result.users || [];
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users.splice(index, 1);
            browser.storage.local.set({ users }, function () {
                li.parentNode.removeChild(li);
            });
        }
    }).catch((err) => {
        console.error(`Error removing user: ${err}`);
    });
}

document.getElementById("clear-all-button").addEventListener("click", function () {
    browser.storage.local.set({ users: [] }).catch((err) => {
        console.error(`Error removing all users: ${err}`);
    });
    var usersList = document.getElementById("users-list");
    usersList.innerHTML = "";
});

document.getElementById("auto-fill-checkbox").addEventListener("change", function () {
    browser.storage.local.set({ "autoFillCheckbox": this.checked }).catch(function (err) {
        console.error(`Error auto-fill-checkbox: ${err}`);
    });
});
