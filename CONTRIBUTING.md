# Contributiong to the project

We welcome contributions to the online library management system project! Whether you want to report a bug, suggest a new feature, or submit a pull request, your input is valuable to us. Please follow the guidelines below to contribute effectively.

## Reporting Issues

If you encounter any bugs or unexpected behavior, please report them by opening a new issue on our GitHub repository. When reporting an issue, please include the following information:

- A clear and concise description of the problem
- Steps to reproduce the behavior
- Expected behavior
- Screenshots (if applicable)
- Additional details such as website version, timestamp of the issue, and browser/OS details

## Submitting Pull Requests

### Branching

1. Create a new issue under the Spike label describing the feature or bug you want to work on.
2. Create a new branch from the main branch with a descriptive name following the format `[branch-type]/ONLIB-[issue-number]-short-description`. For example: `feature/ONLIB-1234-add-user-authentication`.

Where `branch-type` can be:

- `feature` for new features
- `bugfix` for bug fixes
- `refactor` for code improvements without changing functionality
- `docs` for documentation changes

Where issue-number is the number of the issue you created in step 1, the first two digits corresponding to the current Spike (ONLIB-12XX). The second part of the issue-number should be incremental and unique for each issue created in the current Spike.

Eg. I want to add a new feature for user authentication, I create an issue with the title "Add user authentication" and the description of the feature. The issue is assigned the number 1234. I then create a new branch from main with the name `feature/ONLIB-1234-add-user-authentication`.

### Development

1. Take into consideration the README inside each component (server, client) for development guidelines and best practices.
2. Write clear and concise commit messages that describe the changes you made.

#### Example commit message format:

`[ONLIB-1234] Add user authentication / Implement JWT-based authentication for users`

Where `ONLIB-1234` is the issue number of the feature or bug you are working on, and the rest of the message describes the changes made in that commit from title to details.

---

3. Ensure your code follows the project's coding standards and best practices specified in the README files.
4. Write tests for your changes to ensure they work as expected and do not break existing functionality.

### Pull Request

1. Once you have completed your changes and tested them, push your branch to the remote repository.
2. Open a pull request against the main branch, providing a clear description of the changes you made and referencing the issue number (e.g., "Closes #1234").
3. Request a review from the project maintainers. They will review your code and provide feedback or approve the changes.
4. Address any feedback provided by the reviewers and make necessary changes to your pull request.
5. Once your pull request is approved, it will be merged into the main branch.

Thank you for contributing to the online library management system project! Your efforts help us improve and grow the project for everyone.
