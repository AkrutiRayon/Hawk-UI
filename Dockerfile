FROM node:20-alpine AS builder

WORKDIR /app

# install build dependencies
COPY package*.json ./
RUN npm ci --production

# copy source
COPY . .

# runtime image
FROM node:20-alpine AS runtime
WORKDIR /app

# create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# copy installed modules and source
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

USER appuser

CMD ["node", "app.js"]