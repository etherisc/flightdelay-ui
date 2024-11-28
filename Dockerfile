ARG VARIANT=node:22-alpine
# Install dependencies only when needed
FROM ${VARIANT} AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ git
WORKDIR /app

# ARG FONTAWESOME_NPM_AUTH_TOKEN
# ENV FONTAWESOME_NPM_AUTH_TOKEN=$FONTAWESOME_NPM_AUTH_TOKEN

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
#COPY .npmrc ./
RUN npm install

# Build the webapp code only when needed
FROM ${VARIANT} AS runner


EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLE=1

WORKDIR /app

#ARG INSTANCE=int
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/contracts ./src/contracts
COPY . .

#COPY webapp/.env.$INSTANCE .env
RUN npm run build
CMD ["npm", "run", "start"]
