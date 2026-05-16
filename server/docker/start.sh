#!/bin/sh
set -e
pnpm prisma migrate deploy
exec node dist/src/server.js
