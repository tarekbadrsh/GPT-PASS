// Add a listener for the contextmenu event on the document
document.addEventListener("contextmenu", function (event) {
    // Prevent the default context menu from appearing
    event.preventDefault();

    // Create a new context menu element
    var menu = document.createElement("menu");
    menu.setAttribute("type", "context");

    // Create the "My Extension" section
    var myExtensionSection = document.createElement("menu");
    myExtensionSection.setAttribute("label", "My Extension");

    // Create the "My Extension Button" menu item
    var myExtensionButton = document.createElement("menuitem");
    myExtensionButton.setAttribute("label", "My Extension Button");

    // Add the "My Extension Button" menu item to the "My Extension" section
    myExtensionSection.appendChild(myExtensionButton);

    // Create the "Edit" section
    var editSection = document.createElement("menu");
    editSection.setAttribute("label", "Edit");

    // Create the "Cut" menu item
    var cutItem = document.createElement("menuitem");
    cutItem.setAttribute("label", "Cut");

    // Create the "Copy" menu item
    var copyItem = document.createElement("menuitem");
    copyItem.setAttribute("label", "Copy");

    // Create the "Paste" menu item
    var pasteItem = document.createElement("menuitem");
    pasteItem.setAttribute("label", "Paste");

    // Add the "Cut", "Copy", and "Paste" menu items to the "Edit" section
    editSection.appendChild(cutItem);
    editSection.appendChild(copyItem);
    editSection.appendChild(pasteItem);

    // Create the "Take Screenshot" menu item
    var screenshotItem = document.createElement("menuitem");
    screenshotItem.setAttribute("label", "Take Screenshot");

    // Create the "Google Search" menu item
    var searchItem = document.createElement("menuitem");
    searchItem.setAttribute("label", "Google Search");

    // Add the "Take Screenshot" and "Google Search" menu items to the menu
    menu.appendChild(myExtensionSection);
    menu.appendChild(editSection);
    menu.appendChild(screenshotItem);
    menu.appendChild(searchItem);

    // Position the menu at the mouse cursor
    menu.style.left = event.pageX + "px";
    menu.style.top = event.pageY + "px";

    // Append the menu to the document
    document.body.appendChild(menu);

    // Add a click listener to the "My Extension Button" menu item
    myExtensionButton.addEventListener("click", function () {
        // Handle the menu item click event
        console.log("My Extension Button was clicked!");
    });

    // Add click listeners to the "Cut", "Copy", and "Paste" menu items
    cutItem.addEventListener("click", function () {
        document.execCommand("cut");
    });

    copyItem.addEventListener("click", function () {
        document.execCommand("copy");
    });

    pasteItem.addEventListener("click", function () {
        document.execCommand("paste");
    });

    // Add a click listener to the "Take Screenshot" menu item
    screenshotItem.addEventListener("click", function () {
        browser.tabs.captureVisibleTab().then(function (imageUrl) {
            browser.downloads.download({
                url: imageUrl,
                filename: "screenshot.png",
                saveAs: true
            });
        });
    });
});
