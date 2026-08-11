#!/bin/sh

set -xe

npm ci --legacy-peer-deps
npm run build
