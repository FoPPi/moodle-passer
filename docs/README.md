## Moodle Passer Extension 

This browser extension for Chrome and Firefox automates Moodle test-taking using AI technology. It interacts with Moodle's user interface to automatically select and submit answers, and to navigate through tests.

![moodle preview with extension expanding buttons](./img/content.png)

### Extension Features:

1. **Question Handling:** The extension reads question texts and answer options on Moodle pages.
2. **AI Integration:** It sends this data to a server where AI suggests probable correct answers.
3. **Automatic Answer Selection:** Answers are automatically selected based on AI suggestions.
4. **Test Navigation:** It manages moving to the next question after selecting answers.
5. **Question Text Copying** This feature allows users to quickly copy the text of a question and its answers.

### Popup:

![Popup preview](./img/popup.png)

The popup script provides an interface for managing the API key used for AI interactions:

## How to Build the Browser Extension

To build and install the extension in your browser, follow the detailed instructions provided in the [Extension Builder Guide](../Extension/Extension_Builder.md) located in the `Extension` folder of the project repository.

## How to Start the FastAPI Server

For instructions on how to start the FastAPI server, including setting up your environment and running the server, refer to the [API Runner Guide](../API/Api_Runner.md) found in the `API` folder.




