

# 10-Minute Crisis Cooldown Lock

## What it does
After a crisis keyword triggers a redirect, the app locks the user out of the chatbot for 10 minutes. During this time, the Safety Check Screen prominently displays the 988 Lifeline with a live countdown timer, encouraging the user to call a real person instead of returning to AI chat.

## How it works

1. **Store a timestamp instead of a boolean flag**
   - When crisis is detected, store `crisis_redirect_time` in `localStorage` with `Date.now()` instead of just `"true"`
   - Update both `FullScreenChatbot.tsx` and `AIChatbot.tsx` redirect logic

2. **Index.tsx gating logic**
   - On load/focus/pageshow, check if `crisis_redirect_time` exists and if fewer than 10 minutes have elapsed
   - If still within the cooldown, show the Safety Check Screen with the timer
   - If 10 minutes have passed, allow the checklist to be completable

3. **SafetyCheckScreen.tsx changes**
   - Add a countdown timer showing minutes and seconds remaining (e.g., "Please take 10 minutes. You can continue in 7:32")
   - While the timer is active, hide the "Continue to Resources" button entirely — even if they check all boxes and say "Yes, I'm safe"
   - The 988 call/text buttons remain prominent and actionable the entire time
   - Once the timer reaches 0, the existing checklist + safety question flow unlocks

4. **Visual design**
   - Large, calm countdown display near the top of the safety screen
   - Gentle messaging: "Take a moment. A real person is ready to talk." with the 988 number
   - Timer uses `setInterval` updating every second, cleaning up on unmount

## Files to modify
- `src/components/FullScreenChatbot.tsx` — store timestamp instead of boolean
- `src/components/AIChatbot.tsx` — same timestamp change
- `src/pages/Index.tsx` — check timestamp + 10min window
- `src/components/SafetyCheckScreen.tsx` — add countdown timer, disable continue until expired

