import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const globalForDb = globalThis as unknown as {
  __postgresClient?: ReturnType<typeof postgres>
}

const client =
  globalForDb.__postgresClient ??
  postgres(connectionString, {
    prepare: false,
    max: 3,
    ssl: 'require',
    connect_timeout: 20,
    idle_timeout: 20,
  })

globalForDb.__postgresClient = client

export const db = drizzle(client, { schema })
