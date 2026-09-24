import puppeteer from 'puppeteer-core'
import path from 'node:path'

const interviewMistakes = [[1], [1], [1], [0], [0]]

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 440, height: 956, deviceScaleFactor: 1 })

const settle = async () => {
  await page.waitForNetworkIdle({ idleTime: 150 })
  await page.evaluate(() => Promise.all(Array.from(document.images, (image) => image.complete ? image.decode().catch(() => undefined) : new Promise((resolve) => image.addEventListener('load', resolve, { once: true })))))
}
const shot = (name) => page.screenshot({ path: path.resolve('tmp', `${name}.png`), fullPage: true })

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
}

await reachSetup()
await page.click('.document-options .setup-card:nth-child(3)')
await page.click('.setup-next')
await page.$eval('.intro-review', (button) => button.click())

for (const [sectionIndex, mistakes] of interviewMistakes.entries()) {
  const sectionSelector = `.interview-section-list button:nth-child(${sectionIndex + 1})`
  await page.waitForSelector(sectionSelector)
  await page.$eval(sectionSelector, (button) => button.scrollIntoView({ block: 'center' }))
  await page.click(sectionSelector)
    await page.click('.game-help')
    await page.click('.hint-dismiss')
  for (const [mistakeIndex, lineIndex] of mistakes.entries()) {
    await page.click(`.answer-line:nth-child(${lineIndex + 1})`)
    await page.click('.section-submit')
    if (mistakeIndex < mistakes.length - 1) await page.click('.feedback-actions button:first-child')
  }
  await page.$eval('.done-button', (button) => button.click())
  await page.waitForSelector('.overview-screen')
}

await page.click('.overview-finish')
await settle()
await shot('result-final')
await page.click('.result-actions button:first-child')
await page.waitForSelector('.corrected-viewer')
await page.click('.save-menu-toggle')
if ((await page.$$('.save-menu-options button')).length !== 2) throw new Error('Corrected viewer must offer Save as PNG / PDF.')
await page.click('.save-menu-toggle')
await page.$eval('.corrected-viewer > img', (image) => image.decode())
await shot('result-corrected-viewer')

await browser.close()
console.log('Solo game flow passed.')
