# GPT-PASS

GPT-PASS is a browser extension that allows users to generate strong and secure passwords easily. The extension uses the GPT-3.5 language model to generate passwords that are both difficult to guess and easy to remember. The passwords are generated based on the user's preferred length, character set, and other options.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [Contact Information](#contact-information)
- [Acknowledgements](#acknowledgements)
- [License](#license)


## Installation

1. Clone the repository: `git clone https://github.com/tarekbadrshalaan/GPT-PASS.git`
2. Navigate to the project directory: `cd GPT-PASS`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Open your browser and go to `chrome://extensions` (for Google Chrome) or `about:addons` (for Mozilla Firefox).
6. Enable Developer Mode.
7. Click on "Load unpacked extension".
8. Select the "dist" directory in the project directory.
9. The extension is now installed and ready to use.

## Usage

To use GPT-PASS, simply right-click on any input field on a website and select "Generate New Password with GPT-PASS" from the context menu. This will generate a strong and secure password and automatically copy it to your clipboard. The password will also be inserted into the input field automatically.

You can configure the password generation options by clicking on the GPT-PASS icon in the browser toolbar and selecting "Options". Here, you can customize the length of the password, as well as choose whether to include symbols, numbers, lowercase letters, and/or uppercase letters.

You can also view all of your saved passwords by clicking on the GPT-PASS icon in the browser toolbar and selecting "View Passwords". This will display a list of all passwords that you have generated using GPT-PASS.

To remove GPT-PASS from your browser, simply right-click on the GPT-PASS icon in the browser toolbar and select "Remove from Chrome" or "Remove from Firefox", depending on your browser.

## Technologies Used

* HTML
* CSS
* JavaScript
* Browser APIs
* OpenAI GPT-3.5

## Contributing

Thank you for your interest in contributing to GPT-PASS! Here are some guidelines to follow:

1. Fork the repository and create a new branch.
2. Make your changes and commit them with a clear commit message.
3. Push your changes to your forked repository.
4. Submit a pull request with a clear description of your changes.

### Code Guidelines

- Follow the existing code style and naming conventions.
- Write clear and concise comments.
- Use descriptive function and variable names.

### Bug Reports and Feature Requests

- If you encounter a bug, please create a new issue with a clear description of the problem and steps to reproduce it.
- If you have a feature request, please create a new issue with a clear description of the feature and why it would be useful.

### Testing

- Test your changes thoroughly before submitting a pull request.
- Write unit tests for new functionality.
- Make sure all existing tests pass before submitting a pull request.

We appreciate all contributions, big or small!

## Contact Information
For any questions, concerns or suggestions about GPT-PASS, please feel free to contact me at:

- GitHub: [github.com/tarekbadrshalaan](https://github.com/tarekbadrshalaan)

## Acknowledgements

This project was made possible thanks to the following resources:

- [OpenAI GPT-3.5 Language Model](https://openai.com/blog/gpt-3-ai-language-model/)
- [GitHub](https://github.com/)
- [Mozilla Developer Network](https://developer.mozilla.org/en-US/)
- [Stack Overflow](https://stackoverflow.com/)
- [Mozilla Community Discord](https://discord.gg/6HD5u5Y)
- [Mozilla Add-ons Community](https://discourse.mozilla.org/c/add-ons)

## To execlude .DS_Store and __MACOSX from zip file use:
> zip -r archive.zip . -x '**/.*' -x '**/__MACOSX'

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.