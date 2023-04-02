browser.storage.local.get("users").then((result) => {
    var users = result.users || [];
    var usersList = document.getElementById("users-list");

    users.forEach(function (userData) {
        var li = document.createElement("li");
        var buttonCopyEmail = document.createElement("button");
        var buttonCopyPassword = document.createElement("button");
        var buttonRemove = document.createElement("button");

        buttonCopyEmail.textContent = userData.email;
        buttonCopyEmail.addEventListener("click", function () {
            copyToClipboard(userData.email);
            console.log("Copied email to clipboard:", userData.email);
        });
        buttonCopyPassword.textContent = userData.password;
        buttonCopyPassword.addEventListener("click", function () {
            copyToClipboard(userData.password);
            console.log("Copied password to clipboard:", userData.password);
        });
        buttonRemove.textContent = "X";
        buttonRemove.classList.add("remove");
        buttonRemove.addEventListener("click", function () {
            removeUserFromList(li, userData);
            console.log("Removed user:", userData);
        });

        li.appendChild(buttonCopyEmail);
        li.appendChild(buttonCopyPassword);
        li.appendChild(buttonRemove);
        usersList.appendChild(li);
    });

    console.log("Loaded users:", users);
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
