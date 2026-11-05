import { chromium } from 'playwright'

const baseUrl =
  process.env.BASE_URL ?? 'https://wuwa-hyyuannian.vercel.app'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
})

const pageErrors = []
page.on('pageerror', (error) => pageErrors.push(error.message))

try {
  await page.goto(`${baseUrl}/#/characters`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  })
  await page.waitForSelector('.character-card', { timeout: 30_000 })

  const cardCount = await page.locator('.character-card').count()
  const resultText = await page.locator('.result-count').innerText()
  console.log(`[ui] characters cards=${cardCount} result=${resultText}`)

  if (cardCount < 20 || !resultText.includes('60')) {
    throw new Error('角色列表渲染数量不符合预期')
  }

  await page.goto(`${baseUrl}/#/characters/1304`, {
    waitUntil: 'networkidle',
    timeout: 45_000,
  })
  await page.waitForSelector('.skill-list__head', { timeout: 30_000 })

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
  console.log(`[ui] home charts=${chartCount} stats=${statValues.join(',')}`)

  if (chartCount < 3) throw new Error('首页图表未渲染')
  if (!statValues.includes('60') || !statValues.includes('124')) {
    throw new Error('首页统计数字不符合预期')
  }

  if (pageErrors.length) {
    throw new Error(`页面 JS 错误：${pageErrors.join(' | ')}`)
  }

  console.log('[ui] smoke ok')
} finally {
  await browser.close()
}
