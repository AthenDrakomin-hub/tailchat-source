FROM node:18.18.0-alpine

# use with --build-arg VERSION=xxxx
ARG VERSION

# Working directory
WORKDIR /app/tailchat

RUN ulimit -n 10240

RUN apk add --no-cache ffmpeg

# Install dependencies
RUN npm install -g pnpm@8.15.8
RUN npm install -g tailchat-cli@latest

# Add mc for minio
RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
RUN chmod +x /usr/local/bin/mc

# Install plugins and sdk dependency
COPY ./tsconfig.json ./tsconfig.json
COPY ./packages ./packages
COPY ./client ./client
COPY ./server/packages ./server/packages
COPY ./server/plugins ./server/plugins
COPY ./server/package.json ./server/package.json
COPY ./server/tsconfig.json ./server/tsconfig.json
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./.npmrc ./
COPY ./patches ./patches
RUN pnpm install --no-frozen-lockfile

# Copy all source
COPY . .
RUN rm -f pnpm-lock.yaml && pnpm install --no-frozen-lockfile

# Build and cleanup (client and server)
ENV NODE_ENV=production
ENV VERSION=$VERSION
ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN find . -name "*.tsbuildinfo" -type f -delete
RUN sed -i '1s/^import /import type /' server/plugins/com.msgbyte.discover/models/discover.ts
RUN pnpm build

# Fix missing public files by ensuring client/web/dist is fully copied to server/dist/public
RUN mkdir -p server/dist/public && cp -r client/web/dist/* server/dist/public/

# web static service port
EXPOSE 3000

# Start server, ENV var is necessary
CMD ["pnpm", "start:service"]
