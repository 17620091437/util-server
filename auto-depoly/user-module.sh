#!/bin/bash -l

cd "/root/crazyball/source_code/Go-project/src/user-module" && git checkout . && git pull &&go build -o user-module main.go && pm2 reload user-module