const webhookUrl = import.meta.env.VITE_RESULTS_WEBHOOK_URL?.trim()

export const isResultLoggingConfigured = Boolean(webhookUrl)

// Google Apps Script web apps accept a cross-origin text POST. Result logging
// is intentionally best-effort: game completion never waits on this request.
export async function logGameResult(result) {
  if (!webhookUrl) return { skipped: true }

  const payload = JSON.stringify({
    source: 'rmit-spot-the-mistake',
    submittedAt: new Date().toISOString(),
    ...result,
  })

  await fetch(webhookUrl, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: payload,
  })

  return { queued: true }
}
