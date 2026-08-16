const RESULTS_SHEET_NAME = 'Results'
const RESULTS_HEADERS = [
  'submitted_at',
  'student_id',
  'play_mode',
  'document_mode',
  'score',
  'sections_completed',
  'sections_total',
  'recruiter_badge',
  'source',
]

function doPost(event) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(RESULTS_SHEET_NAME) || spreadsheet.getActiveSheet()

  if (sheet.getLastRow() === 0) sheet.appendRow(RESULTS_HEADERS)

  const payload = JSON.parse(event?.postData?.contents || '{}')
  sheet.appendRow([
    payload.submittedAt || new Date().toISOString(),
    payload.studentId || '',
    payload.playMode || '',
    payload.documentMode || '',
    Number(payload.score) || 0,
    Number(payload.sectionsCompleted) || 0,
    Number(payload.sectionsTotal) || 0,
    payload.recruiterBadge || '',
    payload.source || 'rmit-spot-the-mistake',
  ])

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
