#!/bin/sh

set -x PATH=/root/.local/share/pnpm:$PATH
npm install
exec npm run dev
