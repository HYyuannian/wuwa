import { chromium } from 'playwright'

const baseUrl =
  process.env.BASE_URL ?? 'https://wuwa-hyyuannian.vercel.app'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
})

const pageErrors = []
let supabaseRequests = 0
let supabaseOk = 0

page.on('pageerror', (error) => pageErrors.push(error.message))
page.on('response', (response) => {
  if (response.url().includes('/rest/v1/')) {
    supabaseRequests += 1
    if (response.ok()) supabaseOk += 1
    console.log(
      '[ui] supabase',
      response.status(),
      response.url().split('?')[0],
    )
  }

  if (response.url().includes('/api/')) {
    console.log('[ui] api', response.status(), response.url())
  }
})

try {
  await page.goto(`${baseUrl}/#/characters`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  })
  await page.waitForSelector('.character-card', { timeout: 30_000 })

  const cardCount = await page.locator('.character-card').count()
  const resultText = await page.locator('.result-count').innerText()
  console.log(`[ui] characters cards=${cardCount} result=${resultText}`)
  console.log(
    `[ui] supabase requests=${supabaseRequests} ok=${supabaseOk}`,
  )

  if (cardCount < 20 || !resultText.includes('60')) {
    throw new Error('角色列表渲染数量不符合预期')
  }

  if (supabaseOk === 0) {
    throw new Error('未检测到成功的 Supabase REST 请求，可能仍在用快照')
  }

  await page.goto(`${baseUrl}/#/characters/1304`, {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  })
  await page.waitForTimeout(5000)
  console.log('[ui] detail url', page.url())
  console.log(
    '[ui] detail body',
    (await page.locator('body').innerText()).slice(0, 1200),
  )
  console.log('[ui] detail errors', pageErrors)
  try {
    await page.waitForSelector('.skill-list__head', { timeout: 15_000 })
  } catch (error) {
    await page.screenshot({ path: 'detail-failure.png' })
    throw error
  }

  const name = await page.locator('h1').first().innerText()
  const skillCount = await page.locator('.skill-list__head').count()
  console.log(`[ui] detail name=${name} skills=${skillCount}`)

  if (!name.includes('今汐') || skillCount < 5) {
    throw new Error('角色详情渲染不符合预期')
  }

  await page.goto(`${baseUrl}/`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  })
  await page.waitForTimeout(2500)

  const chartCount = await page.locator('canvas').count()
  const statValues = await page
    .locator('.stat-card__value')
    .allInnerTexts()
  const sourceNote = await page.locator('.side__note').innerText()
  console.log(`[ui] home charts=${chartCount} stats=${statValues.join(',')}`)
  console.log(`[ui] source note=${sourceNote}`)

  if (chartCount < 3) throw new Error('首页图表未渲染')
  if (!statValues.includes('60') || !statValues.includes('124')) {
    throw new Error('首页统计数字不符合预期')
  }
  if (sourceNote.includes('快照')) {
    throw new Error('仍在使用本地快照，Supabase 未生效')
  }

  if (pageErrors.length) {
    throw new Error(`页面 JS 错误：${pageErrors.join(' | ')}`)
  }

  console.log('[ui] smoke ok')
} finally {
  await browser.close()
}
