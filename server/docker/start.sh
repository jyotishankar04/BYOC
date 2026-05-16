#!/bin/sh
set -e
pnpm dlx prisma migrate deploy
exec node dist/src/server.js
