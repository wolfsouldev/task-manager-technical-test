FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci --workspace=@task-manager/api --include-workspace-root
COPY apps/api apps/api
RUN npm run build -w @task-manager/api && npm prune --omit=dev --workspace=@task-manager/api --include-workspace-root

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production DATABASE_URL=file:/app/data/tasks.db PORT=3000
WORKDIR /app/apps/api
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/drizzle ./drizzle
COPY --from=build /app/apps/api/drizzle-postgres ./drizzle-postgres
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["sh", "-c", "node dist/database/migrate.js && exec node dist/main.js"]
