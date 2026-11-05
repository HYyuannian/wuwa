import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { adminRoute } from './routes/admin'
import { charactersRoute } from './routes/characters'
import { echoesRoute } from './routes/echoes'
import { metaRoute } from './routes/meta'
import { statsRoute } from './routes/stats'
import { weaponsRoute } from './routes/weapons'

const app = new Hono().basePath('/api')

const origins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  '*',
  cors({
    origin: origins?.length ? origins : '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

app.get('/health', (c) => c.json({ ok: true }))

app.route('/characters', charactersRoute)
app.route('/weapons', weaponsRoute)
app.route('/echoes', echoesRoute)
app.route('/stats', statsRoute)
app.route('/meta', metaRoute)
app.route('/admin', adminRoute)

app.notFound((c) => c.json({ error: 'Not Found' }, 404))

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status)
  }

  console.error('[api] unhandled error', error)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export { app }
