#!/bin/sh

set -x PATH=/root/.local/share/pnpm:$PATH
pnpm install
exec pnpm run dev