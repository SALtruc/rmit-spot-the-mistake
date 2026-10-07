import puppeteer from 'puppeteer-core'

const widths = [320, 390, 767, 768, 1024, 1280, 1440, 1920]
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--no-sandbox', '--disable-gpu'] })

for (const width of widths) {
  const page = await browser.newPage()
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 })
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle0' })

  const assertNoOverflow = async (screen) => {
    const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }))
    if (dimensions.document > dimensions.viewport) throw new Error(`${screen} overflows at ${width}px: ${JSON.stringify(dimensions)}`)
    if (width >= 768) {
      const screenWidth = await page.$eval('.ref-screen', (element) => element.getBoundingClientRect().width)
      if (Math.abs(screenWidth - width) > 1) throw new Error(`${screen} is still portrait-constrained at ${width}px: ${screenWidth}`)
    }
  }

  await assertNoOverflow('home')
  if (width === 1440 || width === 390) await page.screenshot({ path: `tmp/responsive-home-${width}.png` })
  await page.click('.ref-home-start')
  await assertNoOverflow('verify')
  await page.type('#student-id', 's4123456')
  if (width === 1440) await page.screenshot({ path: 'tmp/responsive-verify-1440.png' })
  await page.click('.verify-next')
  await assertNoOverflow('avatar')
  await page.click('.avatar-choice-grid button:nth-child(4)')
  await page.click('.avatar-next')
  await assertNoOverflow('profile')
  await page.type('.ref-field:nth-child(1) input', 'Year 3')
  await page.type('.ref-field:nth-child(2) input', 'Digital Marketing')
  if (width === 1440) await page.screenshot({ path: 'tmp/responsive-profile-1440.png' })
  await page.click('.info-next')
  await assertNoOverflow('setup')
  if (width === 1440) await page.screenshot({ path: 'tmp/responsive-setup-1440.png' })
  await page.click('.document-options .setup-card:nth-child(3)')
  await page.click('.setup-next')
  await assertNoOverflow('intro')
  await page.close()
}

await browser.close()
console.log(`Responsive overflow check passed at ${widths.join(', ')}px.`)

