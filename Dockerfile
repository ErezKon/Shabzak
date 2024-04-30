### STAGE 1: Build ###
FROM node:hydrogen-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install -g npm
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/shabzak /usr/share/nginx/html