# blackjack-game

## Build

### Prerequisites

Please ensure that you have a working installation of Docker. Locate the
relevant instructions for your Operating System at
[the official Docker website](https://docs.docker.com/install).

## Run

### Steps

**NOTE:** This will both build and run the required services.

Please navigate to the root directory of this project.

Replace `<envName>` with `dev` or `production`, as desired.

In a terminal session, please run:

```
export ENV_NAME=<envName>
docker-compose --env-file "./config/${ENV_NAME}.env" --file docker-compose.yml up --build --detach
```

### Logs

Any execution logs going to `stdout` will be accessible via:
```
docker-compose --file docker-compose.yml logs --follow
```