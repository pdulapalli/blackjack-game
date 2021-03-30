#!/bin/bash

set -e

function start() {
  local envName
  envName="$1"
  validateEnv "$envName"

  ENV_NAME="$envName" docker-compose \
    --env-file "./config/${envName}.env" \
    --file docker-compose.yml up --build --detach
}

function stop() {
  local envName
  envName="$1"
  validateEnv "$envName"

  ENV_NAME="$envName" docker-compose \
    --env-file "./config/${envName}.env" \
    --file docker-compose.yml down
}

function clean() {
  local envName
  envName="$1"
  validateEnv "$envName"

  export ENV_NAME="$envName"

  docker-compose \
    --env-file "./config/${envName}.env" \
    --file docker-compose.yml down --volumes

  unset ENV_NAME
}

function logs() {
  local envName
  envName="$1"
  validateEnv "$envName"

  ENV_NAME="$envName" docker-compose \
    --env-file "./config/${envName}.env" \
    --file docker-compose.yml logs --follow "${@:2}"
}

function validateEnv() {
  local envName
  envName="$1"

  if  [ "$envName" != "dev" ] && [ "$envName" != "production" ]; then
    echo "Supplied environment ($envName) is not valid. Use 'dev' or 'production'" 1>&2
    return 1
  fi
}

case "$1" in
  start) start "$2" ;;
  stop) stop "$2" ;;
  clean) clean "$2" ;;
  logs) logs "$2" "${@:3}" ;;
  *) echo "Unknown directive: $1. Use 'start', 'stop', or 'clean'" ;;
esac