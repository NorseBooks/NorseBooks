<p align="center">
  <img src="app/src/assets/img/logo.png" width="128" alt="NorseBooks logo" />
</p>

<h1 align="center">NorseBooks</h1>

<p align="center">The NorseBooks project seeks to provide Luther College students a place to buy and sell textbooks to each other.</p>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Cloning the Project](#cloning-the-project)
- [Local Deployment](#local-deployment)
- [Frontend](#frontend)
- [Backend](#backend)
- [Database](#database)
- [Deployment](#deployment)
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

### Frontend

For frontend, we are using [Angular](https://angular.io/) with [Material](https://material.angular.io/).

### Backend

Our backend uses [Nest](https://nestjs.com/) to expose API endpoints for the frontend to access.

### Database

We are using a [PostgreSQL](https://www.postgresql.org/) database, which is accessible from the application itself and via the Heroku CLI.

### Deployment

The application is deployed to [Heroku](https://heroku.com/). It can be found at [nb-2.herokuapp.com](https://nb-2.herokuapp.com/).

## License

[MIT License](LICENSE)
