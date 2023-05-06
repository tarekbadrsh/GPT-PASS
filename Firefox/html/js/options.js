// Function to save options
function saveOptions() {
    const passwordLength = document.getElementById("password-length").value;
    const includeSymbols = document.getElementById("include-symbols").checked;
    const includeNumbers = document.getElementById("include-numbers").checked;
    const includeLowercase = document.getElementById("include-lowercase").checked;
    const includeUppercase = document.getElementById("include-uppercase").checked;
    const excludeSimilar = document.getElementById("exclude-similar").checked;
    const excludeAmbiguous = document.getElementById("exclude-ambiguous").checked;

    // Check for null values before using status
    const status = document.getElementById("status");
    if (status !== null) {
        status.textContent = "Options saved.";
        setTimeout(function () {
            status.textContent = "";
        }, 1000);
    }
    console.log("Options saved.");

    browser.storage.local.set({
        passwordLength: passwordLength,
        includeSymbols: includeSymbols,
        includeNumbers: includeNumbers,
        includeLowercase: includeLowercase,
        includeUppercase: includeUppercase,
        excludeSimilar: excludeSimilar,
        excludeAmbiguous: excludeAmbiguous,
    });
}

// Add event listeners to the options form inputs to save the options whenever they change
document.getElementById("password-length").addEventListener("input", saveOptions);
document.getElementById("include-symbols").addEventListener("change", saveOptions);
document.getElementById("include-numbers").addEventListener("change", saveOptions);
document.getElementById("include-lowercase").addEventListener("change", saveOptions);
document.getElementById("include-uppercase").addEventListener("change", saveOptions);
document.getElementById("exclude-similar").addEventListener("change", saveOptions);
document.getElementById("exclude-ambiguous").addEventListener("change", saveOptions);

// Function to restore options
function restoreOptions() {
    // Get the saved options and update the UI to match
    browser.storage.local.get({
        passwordLength: 16,
        includeSymbols: true,
        includeNumbers: true,
        includeLowercase: true,
        includeUppercase: true,
        excludeSimilar: true,
        excludeAmbiguous: true,
    }).then(function (options) {
        document.getElementById("password-length").value = options.passwordLength;
        document.getElementById("include-symbols").checked = options.includeSymbols;
        document.getElementById("include-numbers").checked = options.includeNumbers;
        document.getElementById("include-lowercase").checked = options.includeLowercase;
        document.getElementById("include-uppercase").checked = options.includeUppercase;
        document.getElementById("exclude-similar").checked = options.excludeSimilar;
        document.getElementById("exclude-ambiguous").checked = options.excludeAmbiguous;
    }, function (error) {
        console.error("Error restoring options:", error);
    });
    console.log("Options restored.");
}

// Attach event listeners to the form elements
document.addEventListener("DOMContentLoaded", restoreOptions);
// document.getElementById("options-form").addEventListener("submit", function (event) {
//     event.preventDefault();
//     saveOptions();
//     console.log("Options submitted.");
// });
