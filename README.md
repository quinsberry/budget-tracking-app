Budget tracking app

## Description

The way of tracking your income and expences from different cards and accounts in one app.

## Installation

```bash
$ pnpm install
```

# Development

## Running the db

```bash
$ docker run --name budget-tracking-db -e POSTGRES_PASSWORD=admin -p 6543:5432 -d postgres
```

## Running the app

### In development

docker run --name budget-tracking-db -e POSTGRES_PASSWORD=admin -p 6543:5432 -d postgres

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
