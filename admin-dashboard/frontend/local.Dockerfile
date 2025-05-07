FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV NODE_ENV=local

EXPOSE 3000

CMD ["npm", "run", "dev"]
