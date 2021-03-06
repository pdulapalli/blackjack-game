# blackjack-game

Provides the necessary interface and core logic to mimic a round of blackjack.

## General Info

More info is [available here](docs/INFO.md)

## Build

### Prerequisites

Please ensure that you have a working installation of Docker. Locate the
relevant instructions for your Operating System at
[the official Docker website](https://docs.docker.com/install).

## Run

### Steps

**NOTE:** This will both build and run the required services.

Please navigate to the root directory of this project.

Replace `<envName>` with `dev` or `production`, as desired. Note that using
`production` will **not** automatically perform database migrations.

In a terminal session, please run:

```
./run start <envName>
```

### Logs

Any execution logs going to `stdout` will be accessible via:
```
docker-compose --file docker-compose.yml logs --follow
```
