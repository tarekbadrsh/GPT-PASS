# GPT-PASS

GPT-PASS is a browser extension that assists users in managing their account information and auto-filling forms while registering on websites. The extension extracts user information from the input fields, generates a unique password based on the user's email, and saves the user's credentials for future use.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [Contact Information](#contact-information)
- [License](#license)

## Installation
1. Clone the repository: `git clone https://github.com/tarekbadrshalaan/GPT-PASS.git`
2. Navigate to the project directory: `cd GPT-PASS`
3. Load the extension in your browser by following the appropriate steps for your browser.
    - Mozilla Firefox:
        1. Go to `about:debugging`
        2. Click "This Firefox"
        3. Click "Load Temporary Add-on"
        4. Select any file in the project directory.

## Usage
The GPT-PASS extension automatically processes user information and fills forms on websites such as OpenAI, Facebook, and sms-activate.org. The user information is extracted, and a secure password is generated based on the user's email. The extension also offers a popup for viewing and managing saved user information.

### Options
Customize the extension behavior by clicking on the GPT-PASS icon in the browser toolbar and selecting "Options". Here, you can enable or disable the auto-fill feature.

### Saved Users
View a list of all saved users by clicking on the GPT-PASS icon in the browser toolbar and selecting "View Passwords". This will display a list of all users that you have saved using GPT-PASS. You can copy their information to the clipboard or remove them from the list.

## Technologies Used
* HTML
* CSS
* JavaScript
* Browser APIs

## Contributing
Thank you for your interest in contributing to GPT-PASS! To contribute, please follow these steps:
1. Fork the repository and create a new branch.
2. Make your changes and commit them with a clear commit message.
3. Push your changes to your forked repository.
4. Submit a pull request with a clear description of your changes.

### Bug Reports and Feature Requests
- If you encounter a bug, please create a new issue with a clear description of the problem and steps to reproduce it.
- If you have a feature request, please create a new issue with a clear description of the feature and why it would be useful.

## Contact Information
For any questions, concerns or suggestions about GPT-PASS, please feel free to contact me at:

- GitHub: [github.com/tarekbadrshalaan](https://github.com/tarekbadrshalaan)

## To execlude .DS_Store and __MACOSX from zip file use:
> zip -r archive.zip . -x '**/.*' -x '**/__MACOSX'

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.