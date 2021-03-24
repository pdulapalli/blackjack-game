FROM node:14-alpine AS base
WORKDIR /workspace
COPY ./*.json ./
COPY ./.* ./
COPY ./prisma ./
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm ci
EXPOSE 3000

FROM base AS dev
ENV NODE_ENV=dev
CMD [ "npm", "run", "start:dev" ]

FROM base as production
ENV NODE_ENV=production
COPY ./src ./src
RUN npm run build
RUN npm prune --production
CMD [ "npm", "run", "start:prod" ]