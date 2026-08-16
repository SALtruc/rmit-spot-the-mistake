# Google Sheets result log

The app logs a row only after a player reaches the Result screen. The request is non-blocking, so the game still works if the sheet endpoint is unavailable.

## One-time setup

1. Open the project results sheet and select **Extensions → Apps Script**.
2. Replace the default file with the contents of [`google-apps-script/Code.gs`](../google-apps-script/Code.gs), then save.
3. Select **Deploy → New deployment → Web app**.
4. Set **Execute as** to **Me** and give access to the people who will use the game. For an externally deployed public game, choose **Anyone**. Deploy and copy the URL ending in `/exec`.
5. In the Vercel/Netlify/Cloudflare Pages environment variables, add `VITE_RESULTS_WEBHOOK_URL` with that `/exec` URL. Redeploy the site.

The `Results` tab has these columns: submission time, student ID, game mode, document type, score, completed/total sections, recruiter badge, and source.

## Privacy note

This starter logs the Student ID so results can be traced back to a player. If that is not needed, remove `studentId` from `src/App.jsx` and redeploy. The webhook URL is public-client configuration; do not put Google API credentials or Supabase secret keys in any `VITE_` variable.
