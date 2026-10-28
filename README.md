# Wealthplanner Financial Calculator — Handoff

Isi ZIP:
- `mockup/index.html`: mockup halaman kalkulator, buka langsung di browser.
- `app/`: starter React + TypeScript dengan 9 calculator tiles dan simulasi dasar.
- `calculator-excel/wealthplanner-financial-calculators.xlsx`: workbook 9 worksheet.
- `copywriting/ui-copy.md`: wording UI dan disclaimer.
- `docs/FORMULA-AND-ASSUMPTIONS.md`: formula dan batasan model.

## Jalankan app
Butuh Node.js 18+. Di folder `app`: `npm install`, lalu `npm run dev`.
Paket ini belum mengubah GitHub/Vercel dan bukan deployment otomatis.

## Acuan app saat ini
Repo: `jasminework2023/personal-wealthplanner`
File: `src/pages/FinancialCalculator.tsx`
https://github.com/jasminework2023/personal-wealthplanner/blob/main/src/pages/FinancialCalculator.tsx

Calculator di app acuan: Financial Check-Up, KPR, Dana Pendidikan, Dana Pensiun, Warisan, Haji & Umrah, Zakat & Wakaf, Investasi, Kebutuhan Asuransi.

Catatan: starter code dan workbook ini adalah handoff awal, bukan salinan tersertifikasi dari seluruh logika production. Developer perlu membandingkan formula per calculator dengan source app dan menjalankan regression test sebelum merge/deploy.
