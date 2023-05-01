# Build the Sidetree project
FROM node:lts-alpine3.14 AS sidetree-builder
WORKDIR /app/sidetree
COPY sidetree/package*.json ./
RUN npm ci
COPY sidetree/. .
RUN npm run build
RUN npm pack
RUN mv *.tgz /tmp/sidetree.tgz

# Build the Ion project
FROM node:lts-alpine3.14 AS ion-builder
WORKDIR /app/ion
COPY ion/package*.json ./
RUN npm ci
COPY --from=sidetree-builder /tmp/sidetree.tgz /tmp/sidetree.tgz
RUN npm install /tmp/sidetree.tgz
COPY ion/. .
RUN npm run build

# Create the final Ion image
FROM node:lts-alpine3.14
COPY --from=ion-builder /app/ion/dist /ion
COPY --from=ion-builder /app/ion/config /config
COPY --from=ion-builder /app/ion/node_modules /node_modules
