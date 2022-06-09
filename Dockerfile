FROM node:18.3.0-alpine3.16

LABEL maintainer="Ismar Slomic <ismar@slomic.no>"

ENV NODE_ENV production

# Don’t run Node.js apps as root
USER node

# Create config and app directory
WORKDIR /usr/src/config
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node:node package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY --chown=node:node . .

EXPOSE 3005

CMD [ "node", "index.js" ]
