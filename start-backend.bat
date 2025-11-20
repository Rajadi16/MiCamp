@echo off
cd backend
node node_modules\.bin\ts-node-dev --respawn --pretty src/index.ts
pause

