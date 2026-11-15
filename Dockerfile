### STAGE 1: Build ###
# Node 22 (marked needs >= 20); the exact version the UI is built and tested with.
FROM node:22.23.4-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

### STAGE 2: Run ###
# Static files plus the reverse proxy for /api/ (ShabzakAPI) and /agent/ (ShabzakAgent), see nginx.conf.
FROM nginx:1.30.6-alpine
COPY nginx.conf /etc/nginx/nginx.conf
# FIX: Angular 17 application builder outputs to dist/<project>/browser, not dist/<project>.
COPY --from=build /usr/src/app/dist/shabzak/browser /usr/share/nginx/html
