import puppeteer from 'puppeteer-core'
import path from 'node:path'

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 440, height: 956, deviceScaleFactor: 1 })

async function reachSetup() {
  await page.goto('http://127.0.0.1:4174', { waitUntil: 'networkidle0' })
  await page.click('.ref-home-start')
  await page.type('#student-id', 's4123456')
  await page.click('.verify-next')
  await page.click('.avatar-choice-grid button:nth-child(4)')
  await page.click('.avatar-next')
  await page.type('.ref-field:nth-child(1) input', 'Year 3')
  await page.type('.ref-field:nth-child(2) input', 'Digital Marketing')
  await page.click('.info-next')
  await page.click('.play-mode-options .setup-card:nth-child(1)')
}

for (const [modeIndex, name] of ['cv', 'linkedin'].entries()) {
  await reachSetup()
  await page.click(`.document-options .setup-card:nth-child(${modeIndex + 1})`)
  await page.click('.setup-next')
  await page.click('.intro-review')
  await page.waitForSelector('.interactive-document')
  await page.waitForFunction(() => { const image = document.querySelector('.interactive-document > img'); return image?.complete && image.naturalWidth > 0 })
  await page.$eval('.interactive-document > img', (image) => image.decode())
  await new Promise((resolve) => setTimeout(resolve, 250))
  const metrics = await page.$eval('.interactive-document > img', (image) => ({ src: image.currentSrc, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, rect: image.getBoundingClientRect().toJSON(), display: getComputedStyle(image).display, opacity: getComputedStyle(image).opacity, visibility: getComputedStyle(image).visibility }))
  console.log(name, metrics)
  await page.screenshot({ path: path.resolve('tmp', `overview-${name}.png`), fullPage: true })
}

await browser.close()
console.log('CV and LinkedIn overview checks passed.')
