FROM node:20-alpine

RUN apk --no-cache add \
    curl \
    python3 \
    make \
    g++ \
    git \
    && ln -sf python3 /usr/bin/python

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn

RUN yarn install

COPY . .

ENV NODE_ENV=development
ENV PORT=9000

RUN yarn medusa build

EXPOSE 9000

CMD ["yarn", "medusa", "start"]