# Online library management system

This repository contains the source code for an IT course project focused on project management on software development. The project is an online library management system built with FastAPI, SQLAlchemy. It provides a RESTful API for managing users, books, and authors.

Eric PHILIPPE
Jorgelina LEDESMA

## What's Included

Here you'll find a complete table of content with everything that has been established for better project management and newcome developers to understand the project structure and how to set up the development environment. Everything is ordered in a chronological way to make it easier to follow, following an actual newcome developer would do when joining the project.

### Table of Contents

- [Overview](#overview)
- [Glossary](#glossary)
- [Schemas](#schemas)
- [Projects READMEs](#projects-readmes)
- [Change Log](#change-log)
- [Ansible Setup Instructions](#ansible-setup-instructions)
- [Compose files](#compose-files)
- [Guidelines](#guidelines)
- [IA management](#ia-management)
- [Kanban Board](#kanban-board)
- [GitHub](#github)
  - [Branching Strategy](#branching-strategy)
  - [Commit Message Conventions](#commit-message-conventions)
- [Automated Tests](#automated-tests)
- [Security and Contributing](#security-and-contributing)
- [CI/CD](#cicd)
- [License](#license)

> This document is written in english for wider accessibility. Anybody is welcome to contribute with translations in other languages.

Everything here is made included in order to facilitate the onboarding of new developers, and to provide a clear structure for the project. It is also designed to be a living document that will be updated as the project evolves.

---

A more readable doc is automatically generated from this file and can be found in the `docs` directory. This is done to make it easier for new developers to understand the project structure and how to set up the development environment.

## Overview

Here you can find a general overview of the project, its goals, and the technologies used.

> Why using Python and React ?

Python and react are two of the most popular programming languages in the world, and they are both widely used for web development. Python is a great choice for the backend because it is easy to learn, has a large community, and has many powerful libraries for web development. React is a great choice for the frontend because it is fast, efficient, and has a large ecosystem of tools and libraries.

## Glossary

`GLOSSARY.md` contains definitions of key terms and concepts used throughout the project. This is a living document that will be updated as the project evolves. It can help new developers understand the terminology and concepts used in the project.

## Schemas

Inside the `[SCHEMAS](./SCHEMAS)` directory, you'll find detailed architectural diagrams, database schemas, and API endpoint specifications. This is a crucial resource for understanding the overall structure of the application and how different components interact with each other.

## Projects READMEs

Each subproject (server, client, etc.) has its own `README.md` file that provides specific information about that component, including setup instructions, project structure, and development guidelines.

## Change Log

In order to keep track of all the changes made to the project, we maintain a `[CHANGELOG](./CHANGELOG.md)` file. This file documents all significant changes, including new features, bug fixes, and improvements. It helps developers understand the history of the project and the evolution of its features.

## Ansible Setup Instructions

We provide an Ansible playbook (`[setup-dev-environment.yml](./setup-dev-environment.yml)`) to automate the setup of the development environment. This playbook installs all necessary dependencies, configures the database, and sets up the project structure. It is designed to work on both macOS and Ubuntu/Debian systems (and WSL..). Detailed instructions for running the playbook can be found in the `[ANSIBLE_SETUP.md](./ANSIBLE_SETUP.md)` file.

> It won't work on windows, but you can use WSL to run it on windows.

## Compose files

We use Docker Compose to manage our development environment, including the database and other services. The `docker-compose.yml` file defines the services, networks, and volumes needed for the project. It allows developers to easily start and stop the entire environment with a single command. You'll be able to find a dev and prod docker-compose file.

## Guidelines

A full guideline for contributing to the project, including coding standards, pull request process, and code review guidelines, can be found in the `[GUIDELINES.md](./GUIDELINES.md)` file. This document is essential for maintaining code quality and ensuring a smooth collaboration process among developers.

## IA management

We allow the use of AI tools for code generation and assistance, but we require that all generated code be reviewed and tested by a human developer before being merged into the main codebase. This is to ensure that the code meets our quality standards and does not introduce any security vulnerabilities. It is also prohibited to use AI without the [copilot-instructions](./.github/copilot-instructions.md) file, which provides specific guidelines on how to use AI tools effectively and responsibly in the context of our project.

## Kanban Board

## GitHub

### Branching Strategy

Based on the Kanban issues naming convention, we will adopt a branching strategy that aligns with our workflow. The main branches will be:

- `main`: This branch will always contain the stable, production-ready code. All completed features and bug fixes will be merged into this branch after thorough testing.
- x.x.x: These branches includes specific versions of the project, for example `1.0.0`, `1.1.0`, etc. They will be used to manage releases and hotfixes for specific versions, following semantic versioning principles.
- `feature/issue-number`: These branches will be created for each new feature or bug fix, following the naming convention of the corresponding issue (e.g., `feature/12345-add-user-authentication`). Once the work on the feature is complete and has passed code review and testing, it will be merged into the version branch, then the `main` branch.

### Commit Message Conventions

To maintain a clear and consistent commit history, we will follow the Conventional Commits specification. This includes using specific prefixes for commit messages to indicate the type of change being made. For example:

- `feat`: A new feature is being added
- `fix`: A bug is being fixed
- `docs`: Documentation is being updated
- `style`: Code formatting or styling changes (no functional changes)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (e.g., updating dependencies)

This convention helps in understanding the purpose of each commit at a glance and can also be used to automate release notes generation.

## Automated Tests

All the projects must follow a strict testing strategy, with unit tests, integration tests, and end-to-end tests. The testing framework and guidelines for writing tests can be found in the `[TESTING.md](./TESTING.md)` file inside each project directory. This document will provide instructions on how to run tests, write effective test cases, and maintain a high level of test coverage.

## Security and Contributing

A `[SECURITY.md](./SECURITY.md)` file is included to provide guidelines on how to report security vulnerabilities and best practices for secure coding. This document is crucial for maintaining the security of the application and ensuring that any potential vulnerabilities are addressed promptly.

## CI/CD

A CI/CD pipeline is set up using GitHub Actions to automate the testing and deployment process. The configuration for the pipeline can be found in the `.github/workflows` directory. This pipeline will run tests on every pull request and automatically deploy to production when changes are merged into the `main` branch. Like this, no need to worry about manual deployments or missing tests.

## License

A license file (`LICENSE`) is included in the repository to specify the terms under which the code can be used, modified, and distributed. This is important for open-source projects to clarify the legal aspects of using the code.
