FROM node:lts-alpine as build-stage
WORKDIR /volume2/web/homepageserver
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 2334
CMD [ "node", "dist/main.js", "daemon off;"]