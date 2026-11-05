import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const tables = [
  'characters',
  'character_stats',
  'character_skills',
  'character_roles',
  'weapons',
  'echo_sets',
  'sync_runs',
]

const sql = postgres(connectionString, {
  prepare: false,
  max: 1,
  ssl: 'require',
  connect_timeout: 20,
})

try {
  for (const table of tables) {
    const policy = `public_read_${table}`
    await sql.unsafe(
      `alter table public.${table} enable row level security`,
    )
    await sql.unsafe(
      `drop policy if exists "${policy}" on public.${table}`,
    )
    await sql.unsafe(
      `create policy "${policy}" on public.${table} for select to anon, authenticated using (true)`,
    )
  }

  await sql.unsafe('grant usage on schema public to anon, authenticated')
  await sql.unsafe(
    `grant select on ${tables
      .map((table) => `public.${table}`)
      .join(', ')} to anon, authenticated`,
  )
  await sql.unsafe("notify pgrst, 'reload schema'")

  console.log('[rls] select-only public access configured')
} finally {
  await sql.end({ timeout: 5 })
}
