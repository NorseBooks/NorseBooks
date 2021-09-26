<p align="center">
  <img src="https://raw.githubusercontent.com/NorseBooks/NorseBooks/main/app/src/assets/img/logo.png" width="128" alt="NorseBooks logo" />
</p>

<h1 align="center">NorseBooks</h1>

The NorseBooks project seeks to provide Luther College students a place to buy and sell textbooks to each other.

![Coverage lines](./coverage/badge-lines.svg)
![Coverage functions](./coverage/badge-functions.svg)
![Coverage statements](./coverage/badge-statements.svg)
![Coverage branches](./coverage/badge-branches.svg)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Cloning the Project](#cloning-the-project)
- [Local Deployment](#local-deployment)
- [Testing](#testing)
- [Frontend](#frontend)
- [Backend](#backend)
- [Scripts](#scripts)
- [Database](#database)
- [Deployment](#deployment)
- [Coverage](#coverage)
- [Documentation](#documentation)
- [Error Pages](#error-pages)
- [GitHub Actions](#github-actions)
- [License](#license)

### Prerequisites

- [Node.js 14.17.4 and NPM 6.14.14](https://nodejs.org/en/)
- [Python 3.9](https://www.python.org/)
- [The Heroku Command Line Interface](https://devcenter.heroku.com/articles/heroku-cli)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeScript 4.3.5](https://www.typescriptlang.org/)
- [Nest 8.0.0](https://nestjs.com/)
- [Angular 12.0.1](https://angular.io/)
- [Angular Material 12.1.4](https://material.angular.io/)

### Cloning the Project

```bash
$ git clone https://github.com/NorseBooks/NorseBooks.git
```

### Local Deployment

Build the application using NPM:

```bash
# build both the frontend and backend
$ npm run build

# build only the frontend
$ npm run build:frontend

# build only the backend
$ npm run build:backend
```

The application can be run locally with the Heroku CLI:

```bash
$ heroku local web
```

After the local deployment, the built application can be accessed at [localhost:3000](http://localhost:3000/).

### Testing

We primarily use [Jest](https://jestjs.io/) for automated testing. The tests can be run using NPM:

```bash
$ npm run test
```

### Frontend

For frontend, we are using [Angular](https://angular.io/) with [Material](https://material.angular.io/).

### Backend

Our backend uses [Nest](https://nestjs.com/) to expose API endpoints for the frontend to access.

### Scripts

The repository contains a number of Python scripts found in the `scripts` directory. Scripts can be called directly or using one of either a bash or batch script for convenience.

Bash:

```bash
script.sh [script name] [script arguments...]
```

Batch:

```batch
script [script name] [script arguments...]
```

#### Environment Variables

The `env.py` script provides useful functions for acquiring variables from the environment and from `.env` files. It is not meant to be invoked directly, but rather to be used from other scripts.

#### Admin

The `admin.py` script can be used to give and revoke a user's admin privileges, and to list the current admins. Run with the `-h` flag for usage help.

#### Backup

The `backup.py` script is used to create backups of the database in JSON format. Run with the `-h` flag for usage help.

### Database

We are using a [PostgreSQL](https://www.postgresql.org/) database, which is accessible from the application itself and via the Heroku CLI.

### Deployment

The application is deployed to [Heroku](https://heroku.com/). It can be found at [nb-2.herokuapp.com](https://nb-2.herokuapp.com/).

### Coverage

The coverage numbers are shown above. A more detailed coverage report is hosted at [norsebooks.github.io/coverage](https://norsebooks.github.io/coverage/). The coverage report repository exists [here](https://github.com/NorseBooks/coverage). Coverage reports are generated automatically when the tests run.

### Documentation

The [TypeDoc](https://typedoc.org/) package is used to generate the project code documentation. It includes annotations for nearly every significant function, class, etc. Documentation can be generated manually with:

```bash
$ npm run document
```

The documentation is hosted at [norsebooks.github.io/docs](https://norsebooks.github.io/docs/). The documentation repository exists [here](https://github.com/NorseBooks/docs). The documentation is generated automatically when the tests run.

### Error Pages

The error pages are a fallback to account for scenarios in which the application goes down. If the application experiences a fatal error and crashes, the error page will display. If the application is set to maintenance mode in the Heroku control panel, the maintenance page will display. The error pages repository exists [here](https://github.com/NorseBooks/error-pages/).

### GitHub Actions

GitHub Actions runs jobs automatically on any push or pull request to the `main` and `dev` branches. This includes running our automated tests, as well as generating coverage reports and documentation, which are pushed to their respective repositories.

## License

[MIT License](LICENSE)
