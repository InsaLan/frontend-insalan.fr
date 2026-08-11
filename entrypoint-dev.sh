#!/bin/sh

set -xe

npm install --legacy-peer-deps
exec npm run dev
