import puppeteer from 'puppeteer-core'

const widths = [320, 390, 768, 1280]
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })

for (const width of widths) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle0' })

  const assertNoOverflow = async (screen) => {
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
    if (dimensions.document > dimensions.viewport) throw new Error(`${screen} overflows at ${width}px: ${JSON.stringify(dimensions)}`)
  }

  await assertNoOverflow('home')
  await page.click('.ref-home-start')
  await assertNoOverflow('verify')
  await page.type('#student-id', 's4123456')
  await page.click('.verify-next')
  await assertNoOverflow('avatar')
  await page.click('.avatar-choice-grid button:nth-child(4)')
  await page.click('.avatar-next')
  await assertNoOverflow('profile')
  await page.type('.ref-field:nth-child(1) input', 'Year 3')
  await page.type('.ref-field:nth-child(2) input', 'Digital Marketing')
  await page.click('.info-next')
  await assertNoOverflow('setup')
  await page.click('.document-options .setup-card:nth-child(3)')
  await page.click('.setup-next')
  await assertNoOverflow('intro')
  await page.close()
}

await browser.close()
console.log(`Responsive overflow check passed at ${widths.join(', ')}px.`)
