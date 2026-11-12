# Android phone se APK build karne ki guide (Hindi)

## Zaroori sachchai
- Android phone par APK compile karne ke liye Android Studio ki zaroorat nahi padegi; GitHub Actions cloud runner build karega.
- Is workflow ko chalane se pehle Express backend ko public HTTPS hosting par deploy karna aur Gemini API key ko hosting ke server-side environment variable me rakhna zaroori hai.
- APK me Gemini/Fal API keys kabhi mat daalein.
- Yeh workflow **debug APK** banata hai. Google Play ke liye baad me signed release AAB, keystore aur Play Console setup alag se karna hoga.

## Phone se shuru karne ke steps
1. Chrome me `github.com/new` kholen aur sign in karein.
2. Repository name `masti-ai-studio-2` rakhein. Private repository chun sakte hain. `Add a README` ko unchecked chhodein aur repository banayein.
3. Is ZIP ko phone me download karke Files app se extract karein.
4. Extracted `masti-ai-studio-2` folder ke andar ki **saari files aur folders** repository ke root me upload karein. ZIP file ko akela upload na karein. `.github/workflows/android-apk.yml` bhi upload hona chahiye.
5. Backend deploy karein: repository ko Render jaise Node hosting provider se connect karein; Build command `npm install`, Start command `npm run server` rakhein. Hosting environment me `GEMINI_API_KEY` set karein. Gemini key sirf server par rahe.
6. Backend deploy hone par uska HTTPS base URL copy karein. Browser me `/api/health` kholkar JSON me `ok: true` verify karein.
7. GitHub repository me Settings → Secrets and variables → Actions → Variables → New repository variable kholen. Name `API_BASE_URL`, Value backend ka HTTPS base URL. Save karein.
8. Actions tab → `Build Android APK` → `Run workflow` → Run workflow.
9. Build green/success hone par run kholen → Artifacts → `masti-ai-studio-debug-apk` download karein. ZIP extract karke `app-debug.apk` install karein.

## Agar error aaye
- `API_BASE_URL is missing`: step 7 poora karein.
- `/api/health` par error: backend deployment/logs check karein.
- `GEMINI_API_KEY` missing: hosting environment me key add karke redeploy karein.
- APK install block: sirf apne banaye hue APK ko install karein; Android ke prompt par is source ke liye temporary permission allow karein. Unknown APK install na karein.

## Current scope
Phase 1 me story-to-script endpoint hai. Image, voice, video generation abhi implemented nahi hain. APK build success hona un features ke ready hone ka proof nahi hai.
