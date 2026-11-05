import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getCharacterDetail } from './characters'

export const characterRoute = new Hono()

characterRoute.get('/', async (c) => {
  const id = c.req.query('id')

  if (!id) {
    throw new HTTPException(400, { message: 'id is required' })
  }

  return getCharacterDetail(c, id)
})
