✨ Setup Guide — For Anuksha ✨

Everything already works out of the box. These 3 things are optional
personal touches you can add whenever you're ready.

──────────────────────────────
1) REAL BACKGROUND SONG 🎵
──────────────────────────────
Drop any MP3 file into this same folder and rename it exactly:

    song.mp3

That's it — the 🔈 button top-right will now play your real song.
If no song.mp3 is found, it automatically falls back to the built-in
soft piano melody, so nothing breaks either way.

──────────────────────────────
2) PHOTOS (Memory Gallery page) 📸
──────────────────────────────
Inside the "photos" folder, add your images named exactly:

    photos/1.jpg
    photos/2.jpg
    photos/3.jpg
    photos/4.jpg
    photos/5.jpg
    photos/6.jpg

(.jpg, .png, .jpeg all work — just keep the numbers 1–6 and update
the file extension in script.js if you don't use .jpg)

Until you add real photos, cute 🌸 placeholders show up instead —
so the page still looks nice without any images.

Want different captions? Open script.js, find "memoryPhotos" near
the Memory Gallery section, and edit the "caption" text for each photo.

──────────────────────────────
3) DAYS-TOGETHER COUNTER 💫
──────────────────────────────
Open script.js and edit these two lines right at the very top:

    const START_DATE = '2024-01-01';   // the date you two started talking/met
    const START_LABEL = "hum baat karte hain";  // the text after the number

Example: if you started talking on 15 March 2024, set:
    const START_DATE = '2024-03-15';

The badge (top-left, 💫) updates automatically every day.

──────────────────────────────
4) PASSCODE LOCK SCREEN 🔐 (new — first thing she sees)
──────────────────────────────
The page now opens with a heart-photo + numeric keypad lock screen,
just like the reel. Two things you can personalize:

a) The code — open script.js, find this line near the top:
    const PASSCODE = '1122';
   Change '1122' to any 4 digits you like — e.g. an anniversary date
   like '0514' for 14 May.

b) The heart photo — add an image to the photos folder named:
    photos/main.jpg
   If it's missing, a cute 🐾💕 placeholder shows instead automatically.

She enters the 4-digit code on the keypad → correct code unlocks and
smoothly fades into the rest of the surprise (balloons, teddy, etc.)

──────────────────────────────
5) "US IN A FEW FRAMES" carousel photos (optional)
──────────────────────────────
This new page shows 3 flip-through photo cards. Add images named:

    photos/frame1.jpg
    photos/frame2.jpg
    photos/frame3.jpg

Missing photos automatically show a cute emoji instead — nothing breaks.
Want to change the captions? Open script.js, find "framesData" and
edit the "caption" text for each one.

──────────────────────────────
That's all! Just open index.html in any browser to view the page.
