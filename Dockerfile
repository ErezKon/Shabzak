### STAGE 1: Build ###
FROM node:hydrogen-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
# FIX: Angular 17 application builder outputs to dist/<project>/browser, not dist/<project>.
COPY --from=build /usr/src/app/dist/shabzak/browser /usr/share/nginx/html