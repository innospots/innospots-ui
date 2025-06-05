#!/usr/bin/env bash

npm run bootstrap

npm run build

mvn -DskipTests=true clean install
