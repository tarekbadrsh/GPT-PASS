function truncate(text, maxLength) {
    if (text.length > maxLength) {
        return text.substr(0, maxLength) + '...';
    }
    return text;
}

browser.storage.local.get("users").then((result) => {
    var users = result.users || [];
    var usersList = document.getElementById("users-list");

    // Reverse the users array to display the users from last to first
    users.reverse();

    users.forEach(function (userData) {
        var li = document.createElement("li");
        var buttonCopyEmail = document.createElement("button");
        var buttonCopyPassword = document.createElement("button");
        var buttonRemove = document.createElement("button");
        var emailContainer = document.createElement("div");
        var passwordContainer = document.createElement("div");

        emailContainer.classList.add("email-container");
        passwordContainer.classList.add("password-container");

        buttonCopyEmail.textContent = truncate(userData.email, 20);
        buttonCopyEmail.setAttribute('data-tooltip', userData.email);

        buttonCopyEmail.addEventListener("click", function () {
            copyToClipboard(userData.email);
        });
        buttonCopyPassword.textContent = truncate(userData.password, 16);
        buttonCopyPassword.setAttribute('data-tooltip', userData.password);
        buttonCopyPassword.addEventListener("click", function () {
            copyToClipboard(userData.password);
        });

        buttonRemove.textContent = "X";
        buttonRemove.classList.add("remove");
        buttonRemove.addEventListener("click", function () {
            removeUserFromList(li, userData);
            console.log("Removed user:", userData);
        });

        emailContainer.appendChild(buttonCopyEmail);
        passwordContainer.appendChild(buttonCopyPassword);
        li.appendChild(emailContainer);
        li.appendChild(passwordContainer);
        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });
}).catch((error) => {
    console.error("Error loading users:", error);
});

function copyToClipboard(input) {
    var textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.value = input;
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

function removeUserFromList(li, userData) {
    browser.storage.local.get("users").then((result) => {
        var users = result.users || [];
        var index = users.findIndex(function (item) {
            return item.password === userData.password && item.email === userData.email;
        });
        if (index !== -1) {
            users.splice(index, 1);
            browser.storage.local.set({ users }, function () {
                li.parentNode.removeChild(li);
            });
        }
    }).catch((error) => {
        console.error("Error removing user:", error);
    });
}

function clearAllUsers() {
    browser.storage.local.set({ users: [] }).catch((error) => {
        console.error("Error removing all users:", error);
    });
}

function clearCurrentUser() {
    browser.storage.local.set({ currentUser: {} }).catch((error) => {
        console.error("Error removing current user:", error);
    });
}

document.getElementById("clear-all-button").addEventListener("click", function () {
    clearAllUsers();
});

document.getElementById("clear-current-button").addEventListener("click", function () {
    clearCurrentUser();
});