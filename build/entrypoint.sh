#!/bin/bash

node_modules/.bin/gulp config

exec httpd-foreground
