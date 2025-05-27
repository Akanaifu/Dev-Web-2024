FROM node:20 as builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN ng build

FROM nginx:1.27.5
COPY --FROM=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]