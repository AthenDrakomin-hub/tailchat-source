FROM node:18.18.0-alpine

# use with --build-arg VERSION=xxxx
ARG VERSION
ARG NODE_MAX_OLD_SPACE=1536
ARG TAILCHAT_CLI_VERSION=1.5.14
ARG ENABLE_SENTRY_PLUGIN
ARG ENABLE_POSTHOG_PLUGIN
ARG DISABLE_SERVICE_WORKER

# Working directory
WORKDIR /app/tailchat

RUN ulimit -n 10240

RUN apk add --no-cache ffmpeg

# Install dependencies
RUN npm install -g pnpm@8.15.8
RUN npm install -g tailchat-cli@${TAILCHAT_CLI_VERSION}

# Add mc for minio
RUN wget https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
RUN chmod +x /usr/local/bin/mc

# Install plugins and sdk dependency
COPY ./tsconfig.json ./tsconfig.json
COPY ./packages ./packages
COPY ./client ./client
COPY ./server/packages ./server/packages
COPY ./server/plugins ./server/plugins
COPY ./server/admin/package.json ./server/admin/package.json
COPY ./server/package.json ./server/package.json
COPY ./server/tsconfig.json ./server/tsconfig.json
COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./.npmrc ./
COPY ./patches ./patches
RUN pnpm install --frozen-lockfile

# Copy all source
COPY . .

# Build and cleanup (client and server)
ENV NODE_ENV=production
ENV VERSION=$VERSION
ENV NODE_MAX_OLD_SPACE=$NODE_MAX_OLD_SPACE
ENV NODE_OPTIONS="--max-old-space-size=${NODE_MAX_OLD_SPACE}"
ENV ENABLE_SENTRY_PLUGIN=$ENABLE_SENTRY_PLUGIN
ENV ENABLE_POSTHOG_PLUGIN=$ENABLE_POSTHOG_PLUGIN
ENV DISABLE_SERVICE_WORKER=$DISABLE_SERVICE_WORKER

RUN find . -name "*.tsbuildinfo" -type f -delete
RUN pnpm --filter tailchat-types build
RUN pnpm --filter tailchat-server-sdk build
RUN pnpm build
RUN rm -f server/dist/moleculer.config.ts

# Fix missing public files by ensuring client/web/dist is fully copied to server/dist/public
RUN mkdir -p server/dist/public && cp -r client/web/dist/* server/dist/public && mkdir -p server/dist/public/admin && cp -r server/admin/dist/* server/dist/public/admin/

# web static service port
EXPOSE 3000

# Start server, ENV var is necessary
CMD ["pnpm", "start:service"]
