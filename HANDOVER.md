# HANDOVER — Portfolio 3D (Kevin Mahardika)

> **Cara pakai file ini:** Dokumen ini adalah titik serah-terima pekerjaan untuk AI penerus.
> AI yang menerima file ini harus membacanya **sampai habis sebelum melakukan apa pun**.
> Setiap kali ada perubahan pada proyek, **perbarui bagian yang relevan dan Log Perubahan** di bagian 9.

---

## 1. Ringkasan Proyek

| Item | Keterangan |
|---|---|
| Nama proyek | Portfolio 3D — Renaissance Gallery |
| Tujuan | Portofolio pribadi Kevin Mahardika Kumaeni: galeri editorial "putty paper" dengan scene WebGL 3D, smooth scroll (Lenis), dan curtain loader |
| Teknologi / stack | React 19 + Vite 8 + Tailwind 4 + three.js + Lenis + framer-motion |
| Lokasi kerja | `/home/kei/Documents/portfolio-3d` |
| Status keseluruhan | Aktif dikembangkan |
| Terakhir diperbarui | 18 Oktober 2026 |

Deskripsi singkat:
Satu halaman scroll-driven dengan 6 section (hero, about, skills, certificates, projects, contact).
Aesthetic: "Renaissance gallery on putty paper" — kanvas putty `#c4c3b6`, tinta `#000000`, tanpa
gradient, tanpa shadow. Font: Playfair Display (display serif), Inter (grotesk), Cormorant (editorial italic), Cinzel (classical), Space Grotesk.

---

## 2. Konteks & Keputusan Penting

- **Desain sistem:** ikuti `/home/kei/Downloads/DESIGN(1).md` ("Structured"). Aturan keras:
  tanpa gradient, tanpa shadow, tanpa hairline divider, tanpa backdrop-blur, warna hanya monokrom
  (putty/ink/bone/graphite/paper), foto owner dinonaktifkan warnanya agar menyatu (`portrait-desat`).
  **Pengecualian yang disetujui user:** gambar **sertifikat TIDAK di-desaturasi** — user minta
  warnanya dipertahankan karena sertifikat dipresentasikan sebagai lukisan di dalam bingkai museum,
  dan dokumen asli memang berwarna. Foto owner tetap `portrait-desat`.
- **Loader menunggu kesiapan sungguhan, bukan timer mati:** `document.fonts.ready` +
  `window.__sceneReady` (dikirim `Scene3D` saat frame pertama tergambar). Floor 3s, cap 7.5s
  (naik dari 650ms/4s karena feedback "jangan cepet-cepet"). Loader tampil sebagai **ruang
  depan museum**: dinding putty, poster "Now showing", dua karya berbingkai, plinth objek
  (bertali "Please do not touch"), penunjuk arah "Galleries I–VI", wall label di bawah nama,
  dan sticky note kurator; **tanpa** stroke di belakang nama, **tanpa** counter di bawah nama.
  **Keluar lewat dua gerakan:** (1) *the flush* — ruangan berputar & memanjang lalu tersedot
  ke satu titik di tengah (2.4s, easing lambat-cepat, seperti air masuk plughole), dan **tiap
  item tersedot SENDIRI-SENDIRI** (per-item `--d` delay, arah `--tx`/`--ty` diukur ke pusat
  layar oleh `armFlush()` sebelum animasi jalan) — ruangan kosong dari pinggir ke dalam dan nama
  di tengah disedot **terakhir** (`data-flush-last`); (2) *the doors* — tersisa pintu masuk
  galeri dua daun yang terbuka menjauh (`rotateY`, perspective) dari tengah, menyingkap situs.
  `src/index.css`: `.loader-flush`, `.loader-flush-wall`, `.loader-door`, `.loader-door-right`,
  `.loader-hang`, `.loader-label`.
  **Definisi pintu diperkuat (revisi terakhir):** tiap daun kini punya **panel menjorok** yang
  lebih gelap (`#a9a89b`) di atas dasar `#b6b5a8`, **band seam** `#8f8e84` di tepi tengah, dan
  **handle** lebih tebal `#4c4b47`, sehingga saat tertutup dua daun terbaca sebagai *sepasang
  pintu* (bukan dinding rata) dan saat terbuka gerakannya jelas. Semua flat plane — tanpa
  border (menghindari FAIL `outlined-box` & `shadow`).
- **Scroll diperhalus + seluruh porto dibikin "lorong museum" (revisi terbaru).** User:
  "coba dibuat lebih halus saat di scroll dan di dalam portofolionya kamu buat serasa sedang di
  museum". Dua pekerjaan:
  **(1) Scroll lebih halus & lebih lambat** (`src/main.jsx`): `lerp` 0.09 → **0.07** (glide
  bertahan lebih lama setelah roda berhenti — seperti lantai museum di kaki),
  `wheelMultiplier` 1.0 → **0.85** (satu notch roda bergerak lebih sedikit, jadi tiap section
  *didatangi*, bukan dilewati), `touchMultiplier` 1.6 → **1.25**. Semua lompatan section
  (`App.navigateTo`, `Navbar.scrollTo`) kini `duration: 1.6` + easing `1-(1-t)^3` (jalan ke
  ruangan, bukan teleport).
  **(2) Nuansa lorong galeri.** Komponen baru **`src/components/MuseumSpine.jsx`**: rail
  wayfinding fixed di sisi kiri (hanya ≥1536px, `2xl`, tempat gutter cukup lebar — di 1440 rail
  menabrak kolom teks, terverifikasi `railRight:120` vs `innerLeft:200` di 1680). Isinya
  "Now in / Room N / <nama>" untuk ruangan yang sedang dibuka + **denah titik** satu per ruangan
  (titik terisi = ruangan yang sudah dilewati, titik besar = ruangan aktif; nama muncul saat
  hover). **Sengaja titik, bukan angka ordinal** ("01/02") karena numbering dilarang. Warna
  flip ikut `isDark`. **Plaque nomor ruangan** ditambahkan ke keenam section
  (I Lobby, II The Maker, III The Craft, IV Accolades, V Exhibition, VI Reception) — pelat bone
  bertuliskan nama ruangan, **dipasang DI BAWAH judul** (bukan di atasnya), jadi terbaca seperti
  plakat galeri di dinding dan **tidak kena FAIL `eyebrow`** (checker menandai label yang berada
  di atas heading).
  **(3) Perabot museum di dalam porto (revisi terbaru).** User: "di dalam portofolio nya dibuat
  seperti museum juga coba dan perbagus lagi". Komponen baru **`src/components/MuseumRoom.jsx`**
  berisi perabot flat bersama: `Cornice`, `Skirting`, `Floor` (pesawat lantai → karya berdiri,
  bukan melayang), `Vitrine` (lemari kaca dengan cast panel flat, bukan blur), `Stanchion`
  (tiang + tali pembatas), `WallLabel` (plakat karya). Dipakai di **Skills, Certificates,
  Projects, Contact** — keempat ruangan gelap kini bersal dinding sama (`#1a1a21` + surface stock
  + cornice/foot) sehingga berpindah ruangan terasa menyusuri koridor. **About** dirombak:
  kutipan jadi *wall quote* dengan batang tinta, biografi jadi *wall text* di dinding polos
  (bukan kartu rounded), disiplin jadi **satu pelat bone** "Practice & media" (bukan pill), dan
  **Core Capabilities** jadi **empat lemari pajang** berdiri di atas kaki plinth (bukan 4 kartu
  identik). Potret owner kini **karya berbingkai bertingkat** (cast flat → moulding `#08080b` →
  liner `#2b2b30` → mat bone → foto) + label dinding di bawahnya; di layar kecil narasi
  didahulukan (`order-1`/`order-2`) supaya label tidak terbaca sebagai eyebrow. **`WallBand`**
  (frieze) dicoba lalu **dihapus** karena kena FAIL `eyebrow` + `micro-label`.
  **(4) Koleksi tetap museum — lukisan & patung asli (revisi terbaru).** User: "coba ditambahkan
  lagi di background nya kaya pameran lukisan terkenal lah patung lah atau apa gitu dan buat lebih
  bagus lagi". Diambil **6 karya asli dari open-access The Metropolitan Museum of Art (lisensi
  CC0)** lewat `scripts/assets.mjs`, di-resize ke WebP di `public/exhibits/` (tot. ~730 KB):
  4 lukisan Eropa (*Portrait of a Man* ca. 1618, *Portrait of a Woman* ca. 1520, *Portrait of a
  Young Woman* ca. 1490–1500, *A Renaissance Portico with Elegant Figures* ca. 1615) + 2 marmer
  klasik (*Marble statue of Aphrodite*, *Marble statue of Herakles*). Dideklarasikan sekali di
  **`src/data/collection.js`**, digantung lewat komponen baru **`HungWork`** (bingkai bertingkat +
  label dinding + kredit) dan **`Sculpture`** (objek bulat di atas plinth flat) di `MuseumRoom.jsx`.
  Penempatan: Accolades — satu lukisan besar di kanan kepala ruangan (terlihat sejak `lg`) + 3 di
  margin lebar (`2xl`); Exhibition — satu di kanan kepala + 2 di margin `2xl`; Craft — 2 marmer
  berdiri di lantai margin; Reception — 1 lukisan. **Kredit koleksi dicetak di Footer** (panel
  tone-step, bukan hairline). Gambar **tidak di-lazy** (kecil, hanya 6) supaya benar-benar ada di
  halaman. Terverifikasi: keenam section punya "Room N", inspector **2 FAIL** (`covered-text` +
  `pinned-over-picture` — keduanya dari lukisan latar hero yang memang di belakang headline,
  pre-existing), **lint 0 FAIL**.
- **Hiasan museum di slide lain (revisi terbaru):** **Projects** ("Featured Exhibition") ikut
  memakai bahasa Certificates — karya **digantung dalam bingkai** (moulding → liner → mat bone
  → karya + pelat label) di **dinding gelap bertekstur** `#1a1a21` yang sama, bukan lagi kartu
  `notched-card` polos. Jadi dua section gelap terbaca sebagai dua ruangan museum yang sama.
  **Foto owner di About** sekarang **di tengah secara vertikal** terhadap kolom narasi
  (`items-center` pada grid 5+7), tidak lagi menempel di atas.
- **three.js di-lazy-load:** `Scene3D` dibungkus `React.lazy` + `Suspense` sehingga bundle awal
  tidak mengandung three.js (initial JS turun dari ~875 kB menjadi ~307 kB).
- **Gambar dioptimasi ke WebP** (q82); asli disimpan di `public/_originals/` (jangan dihapus).
- **Foto pemilik** ✅ **sudah terpasang**. Sumber: `public/_originals/Kepin.jpg` (2818×4227).
  Diproses dua crop dengan ImageMagick:
  - `public/owner.jpg` (1067×1600) — potret untuk section About (wadahnya 4:5).
  - `public/owner-square.jpg` (900×900) — crop persegi berpusat di wajah, untuk avatar bulat
    Navbar (36px) dan chip Loader (40px), supaya wajah tidak terpotong di lingkaran kecil.
  Dipakai di About, Navbar, dan Loader (+ di kartu ID pengunjung). Diberi filter `portrait-desat`
  (monokrom) — sesuai aturan desain, hanya foto owner yang di-desaturasi.
  Fallback monogram "KM" tetap ada bila gambar gagal dimuat.
- Batasan / larangan: jangan tambah layanan eksternal berbayar tanpa konfirmasi user.

---

## 3. Kondisi Pekerjaan Saat Ini

### ✅ Sudah selesai
- Curtain loader v3 dengan signature move: **vertical stroke yang tergambar mengikuti
  progress** (hand-off ke scroll journey line di halaman), **name reveal berlapis
  (masked line reveal)** untuk "Kevin Mahardika" + role, ghost wordmark "MAHARDIKA",
  grain kertas (SVG turbulence), marquee kredit, ink band di kaki, counter + 12 tone blocks.
- **Pacing loader diperlambat (revisi terbaru).** Feedback user: loader terlalu cepat
  ("jangan cepet cepet banget"). Floor dinaikkan 650ms → 2400ms → **3000ms**, cap 4s → **7.5s**.
  Counter juga dibetulkan: dulu meng-ease ke progress (nyangkut di "004%" selama ~1 detik),
  sekarang **mengikuti waktu secara langsung** sampai 88%, sisa 12% ditahan sampai kedua
  sinyal (fonts + scene) benar-benar siap. Curtain kini berdiam ±3-5 detik dan terbaca
  sebagai opening, bukan kedipan.
- **Background Scene3D: tetap utuh (dikembalikan).** Sempat dipangkas (aurora, 3 shooting
  star, 750 partikel debu dihapus) karena feedback "jangan terlalu banyak". User lalu minta
  **semuanya dikembalikan** — jadi aurora shader (2 ribbon), 3 shooting star, starfield 1400
  bintang, dan field debu 750 partikel **semuanya aktif kembali**, persis seperti semula
  (direstore dari `.taste-skill/backup-17okt/Scene3D.jsx`). Objek `window.__sceneObjects`
  diekspos read-only untuk QA (satu-satunya tambahan yang tersisa di file ini).
- **ScrollPath = garis meliuk yang menggambar diri (revisi terbaru, sesuai referensi).**
  User menyuruh buka `zxx.c8nayrntn2.qzz.io` dan scroll; DOM situs itu dibedah dan tekniknya
  dipakai persis: **tiga jalur bezier meliuk** dalam kotak 12×414 — (1) guide penuh yang
  tipis & berkelok, (2) jalur utama `stroke-width 3` yang digambar turun lewat
  `stroke-dasharray` + `stroke-dashoffset` (offset penuh → 0 mengikuti scroll), (3) jalur
  `echo` offset tipis yang menyusul sedikit di belakang, plus **circle marker** yang duduk
  di kepala garis yang sudah tergambar. Fixed di `right-3 xl:right-5`, tinggi `46vh`,
  vertikal tengah — **di landing page, bukan loading page**. Warna flip ikut `isDark`
  (putty → garis hitam, ink → garis putih) karena `mix-blend: difference` terbukti
  merender tak terlihat di stack ini. `isDark` sekarang dioper dari App ke ScrollPath.
  Mati di bawah 1024px & `prefers-reduced-motion`. Terverifikasi: `dashoffset` turun
  408 → 204 → 0, marker `x` bergoyang 5 → 4.4 → 4.7 → 5.1 → 4 dan `y` turun 3 → 411.
- **Cursor push-away — sekarang HANYA di foto owner.** Permintaan user (revisi): "id yang saya
  maksud tuh yang untuk poto saya aja" — jadi push di kartu Projects/Certificates/Skills
  **dihapus**, sisanya cuma satu elemen: `<figure data-push>` di `OwnerPortrait`
  (AboutSlide.jsx). Karena target tinggal satu, parameternya dinaikkan supaya gerakannya
  terasa sengaja: radius **260px** (dulu 190), maksimum **34px** (dulu 26), falloff
  smoothstep. Ditulis langsung ke `element.style.transform` di satu tick rAF per frame,
  reset begitu cursor keluar radius. Dilewati untuk pointer kasar (touch) &
  `prefers-reduced-motion`. Terverifikasi: `translate3d(-6.66px, 1.45px, 0)` saat cursor di
  radius, reset ke `''` saat cursor jauh. `grep -rn data-push src/` → hanya 1 kemunculan
  (di AboutSlide.jsx).
- **Background hero: lukisan lanskap Renaissance (baru).** Permintaan user: prompt gambar
  lanskap 18th-century Renaissance (hills, lake, trees, moody sky, putty paper, dark vignette,
  museum aesthetic) dipakai sebagai **background hero**. Karena tidak ada tool generatif di
  environment ini, user memilih "coba tarik dari web" → diambil karya **domain publik asli**
  dari Met Open Access: *William Gilpin, "Landscape with hills and a lake", ca. 1772*
  (https://images.metmuseum.org/CRDImages/dp/original/DP833811.jpg). Ini kebetulan **cocok
  sekali** dengan brief: perbukitan, danau, pohon, langit murung, vignette gelap, kertas buff
  hangat. Di proses dengan ImageMagick: crop 16:9, resize 1920×1080 + versi 960×540 untuk
  `srcSet`, grayscale, level 4–96%. Disimpan sebagai `public/hero-renaissance.jpg` (288 kB)
  dan `public/hero-renaissance-sm.jpg` (59 kB). Dipasang di `HeroSlide.jsx` sebagai layer
  `absolute inset-0 z-0` dengan `<img srcSet>` + veil putty seragam `bg-[#c4c3b6]/55`
  (veil seragam, BUKAN scrim keras di satu sisi — scrim keras bikin seam vertikal kelihatan).
  Credit karya ditulis sebagai caption editorial di kaki hero. Scene 3D tetap jalan di
  atasnya (user pilih "gambar jadi background, scene tetap").
- **PALETTE FIX di Scene3D: semua aksen biru/indigo dihapus.** Waktu gambar hero masuk,
  ketahuan ada 8 warna non-monokrom di scene (`0x4338ca` indigo, `0x0891b2` cyan,
  `0x818cf8` periwinkle, `0x1a1a2e` navy, `0xa5b4fc` light blue) — sebelumnya tersamarkan
  oleh background putty polos, tapi begitu ada lukisan di belakang, cincin biru di sekitar
  sculpture langsung menonjol dan melanggar aturan monokrom. Semua dipetakan ke tone abu
  dalam sistem: indigo → `0x6b6a66` (graphite), cyan → `0x8a8985` (ash), periwinkle →
  `0x9a998f`, navy → `0x1a1a1a`, light blue → `0xd8d6cf`. `grep` konfirmasi 0 sisa.
- **Skills grid: footprint bervariasi (revisi).** Permintaan user: "kotak nya lebih dibuat
  bervariasi, cari contoh dari web web lain asalkan jangan ai slop". Riset ke situs nyata
  (Apple/Linear/Vercel bento teardowns, Nicolas Bussière, Koto, Kalok Yeung) → dipakai
  **Scheme A: satu hero cell + satelit**, family footprint yang terukur (Apple/Linear/Vercel
  semuanya punya tepat satu 2×2 dan sisanya 2×1 / 1×1). Hasil akhir di lg (12 kolom):
  baris 1 = hero `col-span-6` (inverted, bone `#e7e5e4` + teks hitam) + dua kotak
  `col-span-3`; baris 2 = tiga kartu `col-span-4`. Footprint terverifikasi via CDP:
  **628×531 / 302×531 / 302×531 / 411×344 / 411×344 / 411×344** — 2 footprint berbeda, 3 baris
  penuh tanpa orphan. Di tablet (md, 6 kolom) grid sengaja **seragam 2-up**, karena memaksa
  ritme desktop ke 6 kolom bikin sel kotak jadi 208px lebar × 538px tinggi (lebih buruk
  daripada tanpa variasi) — variasi adalah fitur desktop. Hero cell juga dapat sub-list
  `focus` (4 poin) supaya sel tinggi terisi konten, bukan ruang kosong.
  **Catatan penting:** percobaan pertama pakai ordinal mono `01`–`06` + kicker "PROFICIENCY"
  + dash mono — tapi inspector melempar 4 FAIL baru (`mono`, `numbering`, `eyebrow`,
  `micro-label`). Semua itu dibuang; variasi sekarang murni dari **footprint**, bukan dari
  hiasan. Hasil: FAIL turun dari 7 → 5, dan `headline-lines` juga hilang setelah ukuran
  judul kartu diturunkan di tablet.
- **`few-pictures` akhirnya bergerak**: baseline 0 gambar → sekarang 1 (lukisan hero).
  Inspector masih FAIL karena ambangnya >1, tapi ini kemajuan nyata — situs tadinya nol
  gambar raster sama sekali.
- **Portrait About di-reposition**: sekarang flat photo card bone (bukan notch card),
  caption di kaki foto + ID line "FOTO PROFIL / ID", layout 5+7 kolom (portrait | narrative)
  dengan grid capabilities 4-kolom di bawah — lebih natural, tidak "dipaksakan".
- **Background plate kedua di About + batas run lukisan (baru).** User: "untuk background nya
  tambahkan lagi di slide selanjutnya tapi jangan lewat dari yang background item". Jadi
  lukisan kedua dipasang di **About** — *Richard Wilson, "Lake Nemi and Genzano from the
  Terrace of the Capuchin Monastery", 1756–57* (Met, public domain, **oil on canvas** — jadi
  akhirnya cocok dengan kata "oil painting" di prompt asli user). Diproses sama: crop 16:9,
  grayscale, 2 ukuran, veil `bg-[#c4c3b6]/72` (lebih tipis dari hero supaya lukisannya
  benar-benar terbaca), credit caption di kaki slide.
  **Batasnya diverifikasi via CDP:** `hero:PLATE about:PLATE skills:- certificates:-
  projects:- contact:-` — run lukisan hanya menutup 2 slide putty dan **berhenti tepat di
  batas slide gelap**. Tidak ada plate yang bocor ke section ink (Skills/Certificates/
  Projects/Contact), persis seperti yang diminta.
- **Sertifikat jadi museum plate + frame 2 sudut (SUPERSEDED — diganti oleh gaya "lukisan di
  museum" di bawah; disimpan hanya sebagai riwayat).** User: "relative inline-block untuk
  membungkus samping-samping card di sertifikat" → diklarifikasi: memakai bingkai, **tapi
  inline-nya hanya di ujung bawah-kiri dan ujung kanan-atas**. User juga pilih gaya "pigura
  museum". Implementasi: tiap kartu jadi `article relative inline-block` berisi (a) mat bone
  `bg-[#e7e5e4] p-3` dengan gambar di dalamnya (`rounded-[5px]`), (b) **dua L-mark sudut** —
  `absolute -bottom-1.5 -left-1.5 border-b-2 border-l-2` dan `-top-1.5 -right-1.5 border-t-2
  border-r-2` — di `border-white/25`, menyala jadi putih penuh saat hover, dan (c) caption
  gaya label galeri di bawah plate. Pasangan diagonal itu dibaca sebagai *registration mark*
  di sekitar gambar, bukan border tertutup, jadi mata tetap jalan antar kartu.
  Judul/issuer/tag/tanggal turun ke bawah plate. Terverifikasi CDP: mark di `l:-6,t:357`
  (bawah-kiri) dan `l:282,t:-6` (kanan-atas) pada kartu 296×371.
  **Gambar sertifikat diberi `portrait-desat`** (user pilih "grayscale penuh") supaya tidak
  bertabrakan dengan palet monokrom, terutama setelah duduk di atas mat bone. Lightbox
  (`CertificateModal.jsx`) **tidak** di-desaturasi — jadi dokumen asli tetap terlihat
  berwarna saat diklik. Grid cert: 4 kolom @1440, 3 @1024, 2 @768, 1 @390.
- **SERTIFIKAT = LUKISAN DI MUSEUM, WARNA DIPERTAHANKAN (revisi terbaru, ganti gaya frame).**
  User: "sertifikat apakah bisa dibuat seperti menaruh lukisan di museum gitu jadi ada
  bingkainya, dan **warnanya tetep adain jangan dihilangkan**, background dibuat seperti
  museum". Perubahan dari versi L-mark: (1) **Warna sertifikat TIDAK lagi di-desaturasi** —
  `portrait-desat` dilepas dari gambar; dokumen berwarna penuh di dalam mat bone. Ini
  kebalikan dari keputusan sebelumnya, jadi jangan dikembalikan. (2) **Frame jadi profil
  moulding bertingkat** tiga lapis: `moulding` (band terluar, gelap/terang) → `liner`
  (bandtipis kontras) → mat bone dalam (`p-6`/`p-4`/`p-3` per profil) → karya. Terbaca
  sebagai pigura asli, bukan strip. Tiga `FRAMES` profile disiklus: heavy (moulding gelap
  `#08080b` + liner `#2b2b30` + mat 24px), gold (moulding bone + liner `#8a8985` + mat 16px),
  putty (moulding `#595855` + liner putty + mat 12px). Tiap frame tetap punya `drop`,
  `dropPanel` (panel gelap flat offset, bukan blur), dan `drop` kecil supaya dinding terasa
  "digantung tangan". (3) **Label galeri pindah ke DALAM `<article>`** (dulu grid terpisah di
  bawah) — jadi judul/issuer/tahun tidak bisa lepas dari karyanya saat wall difilter. (4)
  Background dinding tetap `#1a1a21` (warna item) + banding diagonal + shade atas/bawah.
  Terverifikasi CDP: kartu 296×311, gambar 220×165 di dalam mat (~25px mat tiap sisi).
  Build bersih, 0 console error.
- **Skills jadi STICKY LEDGER (revisi besar, ganti total bento).** User minta cari contoh
  lain lagi. Riset round-2 ke sumber **berbeda** dari round-1: Order, Studio Dumbar,
  Pentagram, The First The Last, Swiss Brut, Typewolf top-40 studio list. User pilih
  **Sticky ledger**: kolom kiri `lg:sticky lg:top-28` (judul + copy + filter + legenda meter)
  menahan di tempat sementara kolom kanan (6 baris skill) lewat di sampingnya. Ini variasi
  dari **axis & alignment**, bukan dari ukuran kartu seperti bento sebelumnya.
  Yang membawa minat visual tanpa warna/gradient/shadow: kolom yang diam vs bergerak,
  padding vertikal besar (whitespace sebagai pemisah, **tanpa divider rule**), lompatan
  skala serif display vs grotesk body, dan **satu baris terakhir inverted bone** sebagai
  penutup. Verifikasi CDP: `position: sticky`, `top: 112px`, tetap terpin di ujung section
  (`leftTop:112` saat `secTop:-1193`), 6 baris, baris terakhir `rgb(231,229,228)`.
  Sticky **mati di bawah 1024px** (fallback statis) karena kolom sticky tanpa ruang gerak
  lebih buruk daripada tidak ada.
  **Level skill diganti dari angka persen ke METER 10 BLOK** (`LevelMeter`): `Math.round(level/10)`
  blok terisi, murni geometri, `role="img"` + `aria-label` untuk aksesibilitas. Ini
  menghindari angka/ordinal/mono yang dilarang. Legenda "Setiap blok mewakili 10%
  penguasaan." ditampilkan di kolom sticky (desktop) dan di bawah ledger (<1024px).
  **Wordmark MAHARDIKA di hero DIHAPUS** (user minta) — ini juga menghilangkan temuan
  `pinned-over-picture`.
  **Hasil inspector: 7 FAIL → 1 FAIL** (dari baseline awal 3). Satu-satunya sisa adalah
  `covered-text` yang menunjuk wordmark di **Loader** (pre-existing, bukan hero).
- Foto owner di 3 tempat: About (photo card), Navbar (avatar dalam logo mark), Loader (chip).
  Semua memakai `public/owner.jpg` dengan fallback monogram.
- WebP optimization semua aset gambar; originals diarsipkan ke `public/_originals/`.
- Bundle split: `Scene3D` terpisah jadi chunk lazy (557 kB / gzip 140 kB), initial JS ~314 kB (gzip 96 kB).
- Google Fonts dipangkas ke weight yang benar-benar dipakai.

### 🚧 Sedang berjalan
- Review user untuk loader museum (dinding + karya gantung + sticky note, tanpa stroke/counter)
  & gaya sertifikat "lukisan berbingkai" — perlu dicek user.
- Meja resepsionis (kartu ID pengunjung) + efek **siram cat** pada foto About — perlu dicek user.
  Kartu ID kini **nama pengunjung saja** (foto owner dihapus dari kartu maupun dari ruang depan
  loader); foto owner tetap di About + avatar Navbar.

### ❌ Belum dimulai
- (Tidak ada backlog lain saat ini selain di atas.)

### ⚠️ Masalah yang diketahui
- Foto owner **sudah ada** (`public/owner.jpg` + `owner-square.jpg` dari `_originals/Kepin.jpg`),
  dipakai di **dua tempat saja**: potret About (`owner.jpg`) dan avatar Navbar (`owner-square.jpg`).
  **Ruang depan loader TIDAK lagi memuat foto owner** (chip bulat di baris "Front room, open daily"
  dihapus atas permintaan user: "hapus foto di sebelah id orang yang memasukan nama nya").
  Fallback monogram "KM" hanya tampil bila gambar gagal dimuat.
- **Kartu ID pengunjung tidak memuat potret siapa pun.** Ia membawa nama pengunjung sebagai satu-satunya
  identitas, dengan monogram "KM" sebagai *counter-mark* institusi di tempat foto (seperti pass asli).
  `owner-square.jpg` tidak pernah dirender di kartu ini.
- **Warna adalah pilhan pengunjung, bukan default.** Satu-satunya tempat berwarna di situs adalah
  efek **siram cat** di potret About, dan itu harus **ditekan** dulu. Default tetap monokrom.
- **Animasi ditulis ke DOM, bukan lewat React state.** `CustomCursor.jsx` dan `ScrollPath.jsx` menulis
  `style.transform` / atribut SVG langsung dari loop rAF. **Jangan kembalikan ke `useState` per-frame** —
  itu me-render ulang seluruh aplikasi 60×/detik dan itulah sumber lag yang sudah diperbaiki.
  `CustomCursor` juga dipasang **sekali** (`[]` deps); jangan kembalikan `[visible]` (dulu listener
  dilepas-pasang tiap kali kursor muncul).
- **Hindari `transition-all`.** Semua sudah dipersempit ke properti nyata (`transition-colors`,
  `transition-[height,width,background-color]`, dst). `transition-all` pada `<input>` menganimasikan
  `box-shadow` tiap ketikan dan terasa lag. `lint.mjs` juga menandai pola ini.
- Loading page kini **menunggu nama pengunjung**: bila tidak diisi, ia tetap membuka sendiri
  setelah `DESK_GRACE_MS` (6s di atas floor) sebagai "Guest", jadi pengunjung tidak pernah terjebak.
- **Jangan ganti gerbang rilis / tahap keluar loader kembali ke `setTimeout` berantai.** Timer
  di-clamp saat tab tidak fokus; lihat catatan di bagian "Kartu ID pengunjung".
- Dev server harus dijalankan manual (`npm run dev`); kadang port 3000/3001 dipakai → Vite
  fallback ke 3002.
- `inspect.mjs` melaporkan **2 FAIL** (tidak ada dari perubahan terakhir): `covered-text` dan
  `pinned-over-picture`. Keduanya berasal dari **lukisan latar hero** yang memang diletakkan di
  belakang headline ("Digital Artifacts & Spatial Code.") — itu keputusan desain, bukan tabrakan
  layout. `font-count` sudah hilang setelah gambar koleksi ditambahkan (aturan `few-pictures` juga
  lolos). **`lint.mjs` sekarang 0 FAIL** (2 FAIL `gradient` lama ternyata positif
  palsu: `repeating-linear-gradient` dipakai sebagai **pola hairline stok dinding**, bukan
  gradasi warna; sudah ditandai `// taste-skill-ignore gradient` di baris yang sama).

### 🖼️ Koleksi tetap (karya asli The Met, CC0)

Semua gambar di `public/exhibits/` adalah karya open-access The Metropolitan Museum of Art,
lisensi **CC0** (public domain, tanpa kewajiban atribusi — tetap dikreditkan di Footer).
Metadata lengkap ada di `src/data/collection.js`.

| Berkas | Judul | Tahun | Halaman sumber |
|---|---|---|---|
| `portrait-man.webp` | Portrait of a Man | ca. 1618 | https://www.metmuseum.org/art/collection/search/436254 |
| `portrait-woman.webp` | Portrait of a Woman | ca. 1520 | https://www.metmuseum.org/art/collection/search/436986 |
| `portrait-young-woman.webp` | Portrait of a Young Woman | ca. 1490–1500 | https://www.metmuseum.org/art/collection/search/436910 |
| `portico.webp` | A Renaissance Portico with Elegant Figures | ca. 1615 | https://www.metmuseum.org/art/collection/search/437750 |
| `aphrodite.webp` | Marble statue of Aphrodite | 1st–2nd c. CE | https://www.metmuseum.org/art/collection/search/251115 |
| `herakles.webp` | Marble statue of Herakles | 1st c. CE | https://www.metmuseum.org/art/collection/search/254608 |

Karya-karya ini ditampilkan sebagai *koleksi tetap* yang dipamerkan di dinding porto — **bukan**
klaim karya milik owner. File asli sebelum resize ada di `assets/` (dengan `credits.json`).

### 🎫 Kartu ID pengunjung (meja resepsionis di loading page)

Loading page bukan sekadar menunggu — ia **menyambut**. Sebelum nama diisi, dinding tengah
memajang plat kecil: **"Visitor's name, for the day pass"** dengan input dan tombol Enter.
Begitu nama dikirim, plat itu berganti jadi **kartu "MUSEUM PASS" yang digantung tali lanyard**
persis seperti tanda pengunjung museum:

```
   │        │        ← dua tali lanyard turun dari atas viewport
   └──▭─────┘        ← klip
 ┌──────────────────┐
 │ MUSEUM PASS  ROOM I │  ← band kepala ink
 │ ▢   Admitted        │  ← counter-mark "KM" institusi (BUKAN foto owner)
 │     Budi Santoso    │  ← nama pengunjung, display serif
 │     Valid today · one visit
 ├──────────────────┤
 │ Digital Artifacts & Spatial Code · Collection of…
 └──────────────────┘
```

**Kartu ini tidak memuat potret siapa pun — sengaja.** Pemilik porto pernah meminta agar kartu itu
berisi fotonya, lalu mengoreksinya: *"hapus foto di sebelah id orang yang memasukan nama nya karna
disitu foto saya yang muncul harusnya buatkan id nya nama saja untuk mereka."* Yang benar adalah
kartu terbitan museum: yang tampil identitas **pengunjung**, dan di slot tempat foto biasanya
duduk **monogram penerbit** ("KM") sebagai *counter-mark* — sama seperti pass asli yang mencetak
lambang museum, bukan wajah pemegangnya. Jangan tambahkan `owner-square.jpg` kembali ke kartu ini.

Begitu pula **ruang depan loader**: chip foto bulat di baris "Front room, open daily" sudah dihapus,
jadi tidak ada wajah owner sama sekali di layar pembuka.

Aturannya:
- **Kartu ditahan `CARD_DWELL_MS` (1.2s)** setelah nama masuk, supaya pengunjung sempat melihat
  kartunya lahir sebelum ruangan disedot.
- **Menunggu maks `DESK_GRACE_MS` (6s) DI ATAS floor** (bukan 11s terpisah) — kalau meja
  diabaikan, loader tetap membuka sebagai **"Guest"**; pengunjung tidak pernah terjebak.
- Pengunjung yang **sudah** mengisi nama dilepas lebih awal (`named` dianggap "cukup siap"),
  jadi tidak perlu menunggu frame pertama WebGL — mereka sudah berinteraksi dengan halaman.
- Judul & byline **diredupkan ke 45%** begitu kartu keluar, jadi kartu yang jadi fokus.
- Catatan kurator berubah: *"Welcome, {nama}. The galleries are yours — take your time."*
- `prefers-reduced-motion`: semua jeda jadi 0, kartu langsung muncul lalu langsung lanjut.

**Catatan penting soal timer (jangan diubah tanpa paham).** Gerbang rilis dan tiga tahap keluar
**tidak** memakai `setTimeout` berantai. Timer di-clamp keras saat tab tidak fokus (atau di
headless), dan setiap tahap berantai akan menambah penalti keterlambatan tahap sebelumnya —
keluar bisa jadi 2× lebih lama. Karena itu:
- Gerbang rilis: `requestAnimationFrame` (responsif saat terlihat) + `setInterval(120)` sebagai
  cadangan (untuk tab background yang membekukan rAF).
- Tiga tahap keluar (pintu 2250ms → leaving 3250ms → `onDone` 3700ms): satu loop yang
  membandingkan **waktu dinding absolut**, sehingga satu tick yang telat tetap menjalankan semua
  tahap yang sudah jatuh tempo, dengan urutan benar.
- `useEffect` sengaja `[]` (sekali jalan); `onDone` disimpan di `onDoneRef` supaya parent yang
  mengirim closure baru tidak membongkar efek dan me-reset jam di tengah jalan.
- Meja memanggil `gateRef.current()` saat submit supaya gerbang langsung dievaluasi,
  tidak menunggu tick berikutnya.

Untuk mengganti foto: timpa `public/owner.jpg` (potret, untuk About) dan
`public/owner-square.jpg` (persegi, untuk avatar Navbar). Sumber asli user:
`public/_originals/Kepin.jpg`.

### 🎨 Efek "siram cat" pada potret About

Satu-satunya warna di situs, dan **opt-in**. Di sisi kanan bingkai potret About ada tombol
bertanda **ember cat** (`PaintBucket`). Menekannya:

1. Menuangkan **lembar cat berwarna-warni** yang mengalir turun menutupi bingkai (`.portrait-pour`,
   1.05s) — SVG inline berisi bidang merah/ungu/oranye/kuning/biru/hijau dengan tepi bawah bergelombang
   supaya terbaca sebagai cat basah, bukan wipe.
2. Setelah siraman lewat, **fotonya sendiri berdiri berwarna penuh** (`.portrait-photo.is-painted`,
   transisi `filter` 620ms). Ikon berganti jadi `Contrast`.

Menekan lagi → menyiram balik ke monokrom. `aria-pressed` mengikuti keadaan; label tombol
berubah antara *Pour colour over the portrait* dan *Drain the colour from the portrait*.

Cara kerjanya, dan kenapa dibuat begitu:
- Semua properti yang dianimasikan adalah `opacity`, `transform`, dan `filter` — semuanya
  dikomposit GPU. Tidak ada yang memicu layout/paint di main thread, jadi menekan tombol tidak
  pernah tersendat.
- Warna foto digerakkan `filter`, **bukan** menukar `src` — tidak ada unduhan gambar kedua dan
  tidak ada kedipan frame yang belum termuat.
- `will-change` hanya dipasang selama siraman berjalan, lalu dilepas, supaya layer tidak ditahan
  di memori seumur halaman.
- Kelas siraman dibersihkan pakai timer (1150ms), **bukan** `animationend`, supaya penekanan
  ganda cepat tidak meninggalkan layer tersangkut (saat animasi dibatalkan, `animationend`
  juga ikut terpanggil).

### ✅ Sudah selesai — revisi lanjutan (ruang depan museum)

- **LOADER = RUANG DEPAN MUSEUM, keluar dengan DRAIN + DOORS (revisi terbaru).** User:
  "kesedotnya lebih halus lagi jadi kaya pas nyiram wc, porto lebih museum lagi, tambah efek
  pintu kebuka pas udah kesedot, banyakin item di loading page". Hasil: (1) **Drain lebih
  halus** — dulu `loader-vortex` 1.15s scale→0 rotate 420° dengan easing simetris (terasa
  seperti putaran lalu *snap*). Sekarang `loader-drain` **2.1s** dengan easing
  `cubic-bezier(0.4,0,0.9,0.6)` (lambat dulu lalu mempercepat) dan **scaleY tertinggal di
  belakang scaleX** (0.52×0.6 → 0.18×0.26), jadi dinding **memanjang ke arah plughole** —
  persis corong air masuk saluran. Rotasi dinaikkan ke 540°. (2) **Pintu terbuka** — setelah
  ruangan kosong, tersisa **dua daun pintu** galeri (masing-masing ber-`wallPlate` + recess
  tone + handle) yang `rotateY(-86°)`/`rotateY(86°)` dengan `perspective(1700px)`, dibuka dari
  tengah ke pinggir (`.loader-door`, `.loader-door-right`, 1.05s). Di belakang pintu ada
  **ambang gelap** `#09090e` → terasa "melangkah masuk". Timeline: drain 2.1s → pintu mulai
  1900ms, selesai ±2950ms → curtain fade 3050ms → `onDone` 3550ms. (3) **Item ditambah
  banyak**: poster "Now showing / Digital Artifacts / Room I, putty wing / Through 2026",
  **plinth** batu dengan objek bone + tali "Please do not touch", penunjuk arah
  "→ Galleries I–VI", **wall label** "Portrait of the maker / Kevin Mahardika Kumaeni /
  WebGL, React, three.js · 2026", dua karya berbingkai kiri-kanan nama, meta row
  "Front room, open daily", plus sticky note kurator. Tiap item muncul **berurutan**
  (`.loader-hang` + delay bertingkat 0.5→0.94s) supaya ruangan terasa "terisi", bukan pop.
  (4) **Foto profil About diturunkan ke tengah** — grid portrait/narasi `items-start` →
  `items-center` (`AboutSlide.jsx`), kartu foto kini di tengah kolom, tidak menggantung di atas.
  (5) **Projects jadi museum juga** — `ProjectsSlide.jsx` mengganti `notched-card` polos
  dengan **karya berbingkai** (moulding `#08080b` → liner `#2b2b30` → mat bone → gambar) +
  pelat label + dinding gelap bertekstur `#1a1a21` sama seperti Certificates. **Inspector tetap
  3 FAIL** (pre-existing: `font-count`, `covered-text`, `pinned-over-picture`); label mikro &
  outlined-box yang sempat muncul **sudah dibersihkan** (label uppercase kecil → sentence case
  ≥13px, border pintu → tone panel). **Lint: 0 FAIL.** Build bersih, 0 console error.
- **LOADER = RUANG DEPAN MUSEUM (revisi sebelumnya — disimpan sebagai riwayat).** User: "loading page dibuat sama seperti
  lagi di museum, **hapus inline di belakang tulisan nama**, buat **sticky note muncul
  tiba-tiba**, bikin **semua diaduk ke tengah kayak tersedot**, dan **hapus yang di bawah
  tulisan nama**". Hasil: (1) **Garis vertikal (stroke SVG) di belakang nama DIHAPUS** —
  dulu ada `line` + `circle` yang menggambar turun lalu menutup jadi ring, tepat di belakang
  wordmark; itu yang dibaca sebagai "inline" yang membelah nama. Sekarang nama duduk di
  dinding polos. (2) **Seluruh kaki loader DIHAPUS** — caption "Preparing the exhibition",
  counter `000%`, dan 12 tone block. Tidak ada apa pun di bawah nama. (3) **Sticky note**
  (kurator) tetap: muncul mendadak lewat `.loader-note` (drop + overshoot, bukan fade),
  delay 1.15s. (4) **Vortex** tetap: `.loader-vortex` (konten, scale→0 + rotate 420°) dan
  `.loader-vortex-slow` (dinding + grain) jalan bareng → seluruh ruangan "tersedot ke
  tengah". Grain sekarang ikut ikut vortex supaya tak ada tekstur yang tertinggal. (5)
  **Dinding museum**: putty + `repeating-linear-gradient` halus + band atas (`#cfcec2`) dan
  kaki (`#bcbbae`) sebagai cahaya jatuh. **Tanpa hairline rule** (dihapus — inspector melempar
  FAIL `hairline`). **Tanpa pool cahaya persegi** (dicoba lalu dibuang: panel flat di dinding
  flat memperlihatkan tepinya sebagai *seam*). (6) **Dua karya kecil tergantung** di kiri &
  kanan nama (`hidden lg:block`) — moulding gelap + liner + mat bone + plate abu, sebagai
  "glimpse ruangan lain". Terverifikasi: loader hadir >3000ms, hilang <4500ms (floor 3s tetap);
  tablet 768 bersih tanpa karya gantung (memang `lg` ke atas saja). Build bersih, 0 console
  error, FAIL `hairline` hilang.
- **Catatan `progress` di Loader**: karena counter sudah tidak dirender, state `progress`
  diubah jadi `progressRef` supaya tick 50ms tidak memicu re-render dinding yang statis.
  Logika rilis (floor 3s / cap 7.5s / gate fonts+scene) tidak berubah.

---

## 4. Struktur File & Titik Penting

```
/home/kei/Documents/portfolio-3d
├── index.html              # Google Fonts (weight sudah dipangkas)
├── package.json
├── vite.config.js
├── public/
│   ├── *.webp              # aset gambar teroptimasi (dipakai slides)
│   ├── exhibits/           # WebP karya koleksi The Met (CC0): aphrodite, herakles, portrait-*, portico
│   └── _originals/         # arsip PNG/JPEG asli — JANGAN DIHAPUS
├── src/
│   ├── main.jsx            # React root + Lenis (smooth scroll)
│   ├── index.css           # tokens, font helpers, .portrait-desat, animasi loader
│   ├── App.jsx             # komposisi slide, lazy Scene3D, activeSection/isDark
│   ├── data/
│   │   └── collection.js   # 6 karya asli The Met (CC0): 4 lukisan + 2 marmer, dipakai HungWork/Sculpture
│   └── components/
│       ├── Loader.jsx      # museum front room; exit = flush per-item + doors
│       ├── MuseumSpine.jsx # wayfinding rail kiri: "Now in / Room N" + denah titik
│       ├── MuseumRoom.jsx  # perabot museum flat: Floor, Vitrine, Stanchion, WallLabel, HungWork, Sculpture
│       ├── ScrollPath.jsx  # garis meliuk di tepi kanan: dashoffset ikut scroll + marker (tulis DOM, bukan state)
│       ├── CustomCursor.jsx# cursor dot+ring + push-away elemen [data-push] (tulis DOM, mount sekali)
│       ├── Scene3D.jsx     # WebGL (three.js) — aurora, shooting star, debu, starfield
│       ├── AboutSlide.jsx  # owner portrait + tombol "siram cat" + narrative + capabilities
│       ├── Navbar.jsx      # logo mark = avatar foto owner
│       ├── HeroSlide.jsx / SkillsSlide.jsx / CertificatesSlide.jsx /
│       ├── ProjectsSlide.jsx / ContactSlide.jsx / Footer.jsx /
│       ├── HexNav.jsx / CustomCursor.jsx / CertificateModal.jsx / Icons.jsx
│       └── audio.js
```

| File / Folder | Fungsi | Status |
|---|---|---|
| `src/components/Loader.jsx` | Opening curtain: museum front room (wall, poster, framed works — 2 karya asli Met, plinth, wayfinding, curator note — **tanpa foto owner**) + **meja resepsionis**: pengunjung mengisi nama → dicetak jadi **kartu ID "MUSEUM PASS" bertali lanyard** berisi nama pengunjung saja, ditahan 1.2s, lalu **flush** (2.4s, tiap item tersedot sendiri) + dua pintu terbuka. Menunggu nama maks 6s di atas floor lalu membuka sebagai "Guest". Gerbang & tahap keluar pakai rAF + deadline waktu dinding (bukan setTimeout berantai) | Direvisi — perlu review user |
| `src/components/ScrollPath.jsx` | Garis meliuk tepi kanan: 3 bezier + dashoffset ikut scroll + marker. **Loop rAF menulis atribut SVG langsung**, bukan `setState` per frame | Dioptimalkan |
| `src/components/CustomCursor.jsx` | Cursor dot+ring + push-away foto owner (`data-push`), radius 260 / max 34. **Dipasang sekali (`[]` deps)**, posisi & hover ditulis ke DOM/class | Dioptimalkan |
| `src/components/Scene3D.jsx` | Scene WebGL; aurora/stars/debu + **semua aksen biru → abu monokrom** | Aman |
| `src/components/SkillsSlide.jsx` | Sticky ledger: kolom kiri pin, 6 baris kanan, meter 10 blok | Perlu review user |
| `src/components/CertificatesSlide.jsx` | **Lukisan di museum**: 3 profil moulding bertingkat (moulding→liner→mat bone→karya), sertifikat **tetap berwarna**, label galeri di dalam tiap article | Direvisi — perlu review user |
| `src/components/HeroSlide.jsx` | Background lukisan Gilpin (Met, PD) + veil putty; wordmark dihapus | Fitur baru — perlu review user |
| `src/components/AboutSlide.jsx` | Background lukisan Wilson (Met, PD) + veil; `data-push` di portrait; **portrait di tengah vertikal** terhadap narasi (`items-center`); **tombol ember "siram cat"** di sisi kanan bingkai → klik = foto berwarna, klik lagi = monokrom | Diubah — perlu review user |
| `src/components/ProjectsSlide.jsx` | **Karya digantung berbingkai** (moulding→liner→mat→karya + pelat label) di dinding gelap `#1a1a21`, bukan kartu polos | Direvisi — perlu review user |
| `public/hero-renaissance.jpg` (+`-sm`) | Gilpin 1772, grayscale, 16:9, srcSet | Aset baru |
| `public/about-renaissance.jpg` (+`-sm`) | Wilson 1756–57 (oil), grayscale, 16:9, srcSet | Aset baru |
| `src/components/MuseumRoom.jsx` | Perabot museum flat bersama (Floor, Vitrine, Stanchion, WallLabel) + **HungWork** (lukisan berbingkai bertingkat + label) & **Sculpture** (marmer di plinth) | Fitur baru — perlu review user |
| `src/data/collection.js` | 6 karya asli The Met (CC0): 4 lukisan Eropa + 2 marmer klasik; satu sumber kebenaran judul/kredit/tahun | Aset baru |
| `public/exhibits/*.webp` | Karya koleksi di-resize (x1200–x1400, q82, total ~730 KB) | Aset baru |
| `public/owner.jpg` | Potret owner (1067×1600) dari `_originals/Kepin.jpg` — dipakai di section About | Aset baru |
| `public/owner-square.jpg` | Crop persegi owner (900×900) — dipakai **hanya** sebagai avatar Navbar (bukan lagi di loader/kartu ID) | Aset baru |
| `src/App.jsx` | Komposisi & lazy-load + mount ScrollPath | Aman |
| `src/index.css` | Desain sistem + animasi loader (rise, line-mask, marquee) + `.portrait-photo`/`.portrait-pour` (siram cat) + `.cursor-ring` | Diubah |

---

## 5. Aturan Kerja untuk AI Penerus

1. **Baca dulu, ubah kemudian.** Pahami file dan konteks sebelum menulis kode.
2. **Jaga konsistensi.** Ikuti gaya, penamaan, dan struktur yang sudah ada.
3. **Jangan hapus pekerjaan yang tidak dipahami.** Tanyakan ke user sebelum menghapus.
4. **Satu langkah, satu verifikasi.** Setelah tiap perubahan, cek hasilnya (`npm run build`).
5. **Catat keputusan baru.** Setiap keputusan penting ditambahkan ke file ini.
6. **Jangan ganti arah tanpa konfirmasi.** Laporkan opsi ke user.
7. **Desain sistem wajib:** tanpa gradient, tanpa shadow, tanpa hairline, monokrom, `portrait-desat`
   untuk semua foto owner. Ikuti `DESIGN(1).md`.
8. **Setiap perubahan → perbarui file ini** (terutama bagian 1, 3, 4, dan Log di bagian 9).

---

## 6. Langkah Lanjutan (Next Steps)

Kerjakan sesuai urutan prioritas berikut:

1. **[Perlu review user]** Perasaan museum keseluruhan: rail "Now in / Room N" (hanya ≥1536px) +
   plakat nomor ruangan di tiap section + **perabot ruangan** (lantai, lemari kaca, tali pembatas)
   di Skills/Certificates/Projects/Contact + **koleksi tetap** (6 karya asli The Met di dinding
   Accolades/Exhibition/Craft/Reception) — cek apakah sudah "serasa di museum" dan apakah
   penempatan lukisan/patungnya sudah pas.
2. **[Perlu review user]** Scroll lebih halus/lambat (`lerp 0.07`, wheel 0.85) — cek apakah
   pas atau perlu lebih lambat/halus lagi.
3. **[Perlu review user]** Loader: **desk nama → kartu ID museum di lanyard** lalu **flush**
   (tiap item tersedot sendiri) + **dua pintu terbuka** — cek apakah alurnya terasa seperti
   disambut di meja resepsionis museum, dan apakah kartunya sudah pas.
4. **[Perlu review user]** About: wall quote + wall text, Core Capabilities sebagai lemari pajang,
   potret berbingkai — cek apakah bahasanya sudah konsisten dengan ruangan lain.
5. **[Selesai]** Foto owner terpasang di About/Navbar/Loader + kartu ID.
   Untuk mengganti foto: timpa `public/owner.jpg` (potret) & `public/owner-square.jpg` (persegi).

Definisi selesai (acceptance criteria):
- `npm run build` sukses tanpa error.
- Loader & ScrollPath berfungsi dengan `prefers-reduced-motion` yang menghormati aksesibilitas.
- Foto owner tampil benar di About, Navbar, Loader (setelah `owner.jpg` tersedia).
- Sertifikat tampil berwarna di dalam bingkai museum (jangan di-desaturasi lagi).
- Tidak ada perubahan yang melanggar aturan desain sistem (bagian 2 & 5).

---

## 7. Cara Menjalankan / Menguji

```bash
cd /home/kei/Documents/portfolio-3d
npm install          # install dependensi (playwright TIDAK dipakai — jangan install ulang)
npm run dev          # dev server → http://localhost:3000/ (fallback 3001 jika 3000 dipakai)
npm run build        # build produksi ke dist/
npm run preview      # preview build
```

Hasil yang diharapkan: dev server berjalan di localhost, loader terbuka lalu mengangkat, scroll
halus dengan Lenis, journey line tergambar membungkus Projects, semua section tampil.

Catatan: untuk QA visual bisa dipakai `node <skill>/scripts/inspect.mjs <url>` dari skill
design-taste-frontend (base: `/home/kei/.agents/skills/design-taste-frontend`).

---

## 8. Kontak & Referensi

- Pertanyaan untuk: pemilik proyek (user).
- Referensi: `/home/kei/Downloads/DESIGN(1).md` (desain sistem "Structured"); dokumentasi
  three.js, Lenis, Vite, Tailwind 4; skill `design-taste-frontend` (lint/inspect/gate).

---

## 9. Log Perubahan Handover

| Tanggal | Diubah oleh | Ringkasan perubahan |
|---|---|---|
| 17 Okt 2026 | Agent 1 | Handover pertama dibuat. Dokumentasi awal: loader real-readiness, WebP assets, lazy Scene3D, font trimming, foto owner (circular vignette + navbar avatar + loader chip), scroll-journey line (ScrollPath) baru dibuat, foto belum diisi user |
| 17 Okt 2026 | Agent 1 | Rombak besar: (1) Loader v3 — vertical stroke mengikuti progress + masked line reveal nama; (2) ScrollPath dibungkus ke `#projects-grid`, z-index 14; (3) Portrait About diletakkan ulang jadi flat photo card layout 5+7 dengan capabilities 4-kolom (feedback "terasa dipaksakan"); (4) HANDOVER.md dibuat & di-update tiap perubahan |
| 18 Okt 2026 | Agent 2 | **Tiga permintaan user.** (1) *Scroll line*: `ScrollPath.jsx` ditulis ulang — garis tunggal turun di **margin kiri (x=26)** dan **melingkari `#projects-grid`** di section Projects (radius maks 220px agar tidak bocor ke section tetangga), marker mengendarai garis dan diposisikan dari posisi scroll pembaca (bukan fraksi path — loop membuat path lebih panjang dari dokumen dan menyetrandakan marker off-screen). Percobaan pertama (ring di gutter kanan untuk 6 section) dibuang karena bertabrakan dengan kartu & hex-nav yang full-width. Readout `01/06 · Section · NN%` di margin kiri. (2) *Loader*: floor 650ms → 3000ms, cap → 7.5s, counter diubah dari ease (nyangkut di 004%) jadi mengikuti waktu langsung sampai 88% lalu gate readiness; stroke tengah sekarang menggambar garis + menutup jadi ring. (3) *Background*: `Scene3D.jsx` dipangkas — aurora shader, 3 shooting star, dan 750 partikel debu dihapus; tersisa starfield 900 bintang monokrom. Verifikasi via CDP probe (marker x=21→787 saat Projects) + screenshot tiap section. Build bersih. |
| 18 Okt 2026 | Agent 2 | **Koreksi sesuai feedback user.** (1) *Aurora dikembalikan*: semua yang dihapus dari `Scene3D.jsx` (aurora 2 ribbon, 3 shooting star, starfield 1400, 750 partikel debu) **direstore penuh** dari backup `.taste-skill/backup-17okt/` — hanya `window.__sceneObjects` (read-only QA handle) yang ditambahkan. (2) *Readout dihapus*: panel `01/06 · Section · NN%` di margin kiri dibuang dari ScrollPath. (3) *ScrollPath diganti total*: acuan baru dari user `zxx.c8nayrntn2.qzz.io` — garis progres di **tepi kanan landing page** (bukan loading page) yang terisi ke bawah mengikuti scroll dengan marker kecil di kepala isian. Implementasi: rail penuh opacity 0.28 di `right:18px` inset 28px, segmen solid putih sepanjang `progress × railLen`, marker kotak 7px di ujungnya. Semua konsep lama (kotak projects, loop melingkari grid, ring per section) dihapus. Verifikasi CDP: fill tumbuh 0→844px linear terhadap scroll, marker ikut. Build bersih. |
| 18 Okt 2026 | Agent 2 | **Garis meliuk + cursor push (revisi terbaru).** (1) User menyuruh buka `zxx.c8nayrntn2.qzz.io` & scroll; DOM-nya dibedah: garis itu ternyata **3 bezier meliuk** di kotak 12×414 dengan `stroke-dasharray`/`dashoffset` (digambar turun mengikuti scroll) + circle marker di kepala. `ScrollPath.jsx` ditulis ulang persis mengikuti teknik itu (guide tipis + jalur utama sw3 + echo sw1.5 + marker). Warna flip ikut `isDark` (App sekarang mengoper `isDark`), karena `mix-blend: difference` terbukti tak terlihat. Fixed `right-3 xl:right-5`, `46vh`, tengah vertikal — di landing page. Terverifikasi: dashoffset 408→204→0, marker meander x 5→4.4→4.7→5.1→4, y 3→411. (2) **Cursor push-away**: `CustomCursor.jsx` sekarang mendorong elemen `[data-push]` menjauh dari cursor dalam radius 190px (max 26px, falloff smoothstep), ditulis ke `style.transform` di satu tick rAF; dipasang di kartu Projects/Certificates/Skills; reset saat cursor jauh; dilewati di touch & reduced-motion. Terverifikasi: `translate3d(-7.73px,0,0)` → `''`. Build bersih. Rekomendasi fitur tambahan sudah disampaikan ke user. |
| 18 Okt 2026 | Agent 2 | **Tiga revisi: hero image, skills varied, push pindah ke foto.** (1) **Hero background**: user minta prompt lanskap Renaissance jadi background hero. Tidak ada tool generatif → user pilih tarik dari web → diambil karya **domain publik asli** Met Open Access: William Gilpin, *"Landscape with hills and a lake"*, ca. 1772 (kebetulan sangat cocok: bukit, danau, pohon, langit murung, vignette, kertas buff). Diproses ImageMagick: crop 16:9, grayscale, 2 ukuran untuk `srcSet`, ditaruh di `public/`. Dipasang di `HeroSlide.jsx` sebagai layer `z-0` + veil putty seragam 55% (bukan scrim satu sisi — itu bikin seam vertikal). Credit sebagai caption editorial. (2) **Palette fix**: masuknya gambar membongkar 8 warna non-monokrom di `Scene3D.jsx` (indigo `0x4338ca`, cyan, periwinkle, navy) yang sebelumnya tersamarkan background polos — cincin biru di sculpture langsung menonjol. Semua dipetakan ke abu: 0x6b6a66 / 0x8a8985 / 0x9a998f / 0x1a1a1a / 0xd8d6cf. `grep` konfirmasi 0 sisa. (3) **Skills varied**: riset ke Apple/Linear/Vercel bento teardown + Bussière/Koto/Kalok Yeung → Scheme A (satu hero + satelit). Di lg: hero 6 + 2 squares 3 + 3 wide 4. Footprint CDP: 628/302/302/411/411 × tinggi 531/344 — 3 baris penuh, 2 footprint. Tablet sengaja seragam 2-up (variasi = fitur desktop). Percobaan ordinal mono + kicker "PROFICIENCY" **dibuang** karena inspector melempar 4 FAIL baru (`mono`/`numbering`/`eyebrow`/`micro-label`); variasi akhirnya murni dari footprint. FAIL 7 → 5. (4) **Push pindah**: hapus `data-push` dari Projects/Certificates/Skills, sisa 1 di `OwnerPortrait`; radius 190→260, max 26→34. Verifikasi: `translate3d(-6.66px,1.45px,0)` → `''`. **`few-pictures` 0 → 1 gambar.** Build bersih, 0 console error. |
| 18 Okt 2026 | Agent 2 | **Revisi ronde-3: plate kedua, sertifikat pigura, skills sticky ledger.** (1) **Wordmark MAHARDIKA di hero dihapus** (permintaan user) — sekaligus menghilangkan temuan `pinned-over-picture` & `covered-text` untuk hero. (2) **Plate About**: lukisan kedua *Richard Wilson, "Lake Nemi and Genzano…", 1756–57* (Met, PD, **oil on canvas** — cocok kata "oil painting" di prompt awal), veil 72%, credit caption. **Batas run diverifikasi:** `hero:PLATE about:PLATE skills:- certificates:- projects:- contact:-` — lukisan hanya di slide putty, **tidak lewat ke slide item**, persis permintaan user. (3) **Sertifikat museum plate**: tiap kartu `relative inline-block` + mat bone + **L-mark hanya di bawah-kiri & kanan-atas** (`border-b-2 border-l-2` / `border-t-2 border-r-2`, `white/25` → putih saat hover) + caption gaya label galeri. Terverifikasi CDP: mark di `l:-6,t:357` & `l:282,t:-6` (kartu 296×371). Gambar sertifikat di-`portrait-desat` (user pilih grayscale penuh); **lightbox tetap berwarna** jadi dokumen asli masih bisa diperiksa. (4) **Skills → sticky ledger**: riset round-2 ke Order/Studio Dumbar/Pentagram/The First The Last/Swiss Brut/Typewolf; user pilih sticky ledger. Kolom kiri `lg:sticky lg:top-28` + kolom kanan 6 baris; baris terakhir inverted bone; **level diganti meter 10 blok** (`LevelMeter`) menggantikan angka persen. Verifikasi: `position:sticky, top:112px`, tetap terpin di ujung section (`leftTop:112` saat `secTop:-1193`), sticky mati <1024px. Responsif: cert 4/3/2/1 kolom; skills sticky 1440/1024, statis 768/390. **Inspector: 7 FAIL → 1 FAIL** (sisa cuma `covered-text` di wordmark Loader, pre-existing). Build bersih, 0 console error. |
| 18 Okt 2026 | Agent 3 | **Sertifikat = lukisan museum (warna dijaga) + loader jadi ruang depan museum.** (1) **CertificatesSlide**: gaya L-mark diganti **profil moulding bertingkat** — `moulding → liner → mat bone → karya` (3 profil disiklus: heavy/gold/putty dengan mat 24/16/12px). **Warna sertifikat TIDAK lagi di-desaturasi** (`portrait-desat` dilepas dari gambar) sesuai permintaan user "warnanya tetep adain jangan dihilangkan" — dokumen berwarna penuh di dalam mat, di dinding gelap `#1a1a21`. **Label galeri dipindah ke dalam `<article>`** supaya tidak lepas dari karyanya saat wall difilter. Verifikasi CDP: kartu 296×311, gambar 220×165 (~25px mat tiap sisi). (2) **Loader museum**: **stroke vertikal di belakang nama DIHAPUS** (itu "inline" yang dimaksud user); **seluruh kaki loader DIHAPUS** (caption "Preparing the exhibition", counter `000%`, 12 tone block); **sticky note kurator tetap** (muncul mendadak, delay 1.15s); **vortex tetap** (konten scale→0 rotate 420°, dinding+grain ikut `loader-vortex-slow`; grain kini ikut vortex agar tak ada tekstur tertinggal); dinding museum = putty + band atas/kaki sebagai cahaya jatuh + **2 karya kecil tergantung** kiri/kanan nama (`hidden lg:block`). **Hairline rule & pool cahaya persegi dibuang** (hairline melanggar desain sistem → FAIL; panel flat di dinding flat memperlihatkan seam). `progress` state → `progressRef` (counter tak lagi dirender). Verifikasi: loader hadir >3000ms & hilang <4500ms, tablet 768 bersih, **FAIL `hairline` hilang**. Build bersih, 0 console error. |
| 18 Okt 2026 | Agent 3 | **Pembersihan komentar + lint.** Komentar lama di `CertificatesSlide.jsx` masih menyebut `wallShadow` (fitur yang sudah tidak ada) dan style frame `light/heavy/bone` (sudah diganti `heavy/gold/putty`) — diperbarui agar cocok dengan kode. Dua FAIL `gradient` dari `lint.mjs` ternyata **positif palsu**: `repeating-linear-gradient` dipakai sebagai **pola hairline stok dinding** (dua stop tidak saling memudar → tidak ada ramp warna), bukan gradasi. Keduanya ditandai `// taste-skill-ignore gradient` di baris yang sama → **`lint.mjs`: 0 FAIL**. `inspect.mjs` stabil di 3 FAIL (semua pre-existing: `font-count`, `covered-text` saat curtain terbuka). Build bersih. |
| 18 Okt 2026 | Agent 3 | **Definisi pintu diperkuat + lint bersih kembali.** Saat tertutup, bidang pintu sebelumnya terlalu rata sehingga dua daun tidak terbaca. Kini tiap daun: dasar `#b6b5a8`, **panel menjorok** `#a9a89b` (kiri `left-10 right-6 top-14 bottom-20`, kanan cermin), **band seam** `#8f8e84` lebar 2.5 di tepi tengah, dan **handle** `#4c4b47` `h-20 w-2`. Semua flat plane, tanpa border/outline. Sebuah FRESH FAIL `shadow` sempat muncul hanya karena kata "shadow" ada di komentar — dikomentari ulang. **Lint kembali 0 FAIL**, inspector tetap 3 FAIL pre-existing, build bersih, 0 console error; diverifikasi di 1440/768/390. |
| 18 Okt 2026 | Agent 3 | **Scroll lebih halus + porto jadi lorong museum.** Permintaan: "coba dibuat lebih halus saat di scroll dan di dalam portofolionya kamu buat serasa sedang di museum". (1) `main.jsx`: `lerp` 0.09→**0.07**, `wheelMultiplier` 1.0→**0.85**, `touchMultiplier` 1.6→**1.25**; lompatan section jadi `duration:1.6` + easing kubik (`App.navigateTo`, `Navbar.scrollTo`). Terverifikasi lewat CDP: setelah roda berhenti halaman masih meluncur (2460→2508) lalu tenang. (2) Komponen baru **`MuseumSpine.jsx`**: rail wayfinding fixed kiri (≥1536px/`2xl` saja), berisi "Now in / Room N / nama" + denah titik per ruangan (titik = ruangan, bukan angka; nama muncul saat hover), warna flip ikut `isDark`. (3) **Plaque nomor ruangan** di keenam section (I Lobby, II The Maker, III The Craft, IV Accolades, V Exhibition, VI Reception), dipasang **di bawah judul** supaya tidak kena FAIL `eyebrow`. (4) **Insiden:** restart dev-server sempat memotong penulisan file → sejumlah file JSX berisi fragmen ganda/NUL padding (build gagal); semua dibersihkan (`tr -d '\000'`) dan struktur rusak diperbaiki. **Inspector: 3 FAIL** (pre-existing), **lint: 0 FAIL**, build bersih, 0 console error; diverifikasi di 1680/1440/390. |
| 18 Okt 2026 | Agent 3 | **Drain lebih halus + pintu terbuka + ruangan museum lebih ramai + porto lebih museum.** (1) **Drain** diganti dari `loader-vortex` (1.15s, scale→0 rotate 420°, easing simetris → terasa *snap*) menjadi `loader-drain`/`loader-drain-slow`: **2.1s**, easing `cubic-bezier(0.4,0,0.9,0.6)` (lambat → mempercepat, seperti air menemukan plughole), dan `scaleY` tertinggal di belakang `scaleX` (`0.52×0.6 → 0.18×0.26`) sehingga dinding **memanjang ke corong**; rotasi 540°. (2) **Efek pintu** (baru): setelah ruangan kosong, tersisa **dua daun pintu** galeri dengan recess + handle, `rotateY(±86°)` `perspective(1700px)`, dibuka dari tengah ke pinggir (`.loader-door`/`.loader-door-right`, 1.05s); ambang gelap `#09090e` di belakangnya. Timeline: drain 2.1s → pintu mulai 1900ms selesai ±2950ms → fade 3050ms → `onDone` 3550ms. (3) **Item ditambah**: poster "Now showing", plinth + objek bone + tali "Please do not touch", penunjuk arah "→ Galleries I–VI", wall label "Portrait of the maker / Kevin Mahardika Kumaeni / WebGL, React, three.js", meta row "Front room, open daily", dua karya berbingkai, sticky note. Muncul **berurutan** (`.loader-hang` + delay 0.5→0.94s). (4) **Foto profil About diturunkan ke tengah** (`items-start` → `items-center`). (5) **Projects jadi museum**: `notched-card` polos → **karya berbingkai** di dinding gelap bertekstur, sekamar dengan Certificates. (6) **Bersih-bersih FAIL baru**: label mikro (`micro-label`) → sentence case ≥13px; border pintu (`outlined-box`) → tone panel. **Inspector: 3 FAIL** (semua pre-existing); **lint: 0 FAIL**; build bersih, 0 console error. |
| 18 Okt 2026 | Agent 3 | **Loader = flush kaya WC duduk (tiap item tersedot sendiri) + perabot museum di dalam porto.** Permintaan: "di dalam portofolio nya dibuat seperti museum juga coba dan perbagus lagi… loading page nya masih kurang kaya per item tuh ksesedot dan tadi kesedot nya belum yang kaya pas wc duduk di pencet kan nyedot". (1) **Loader**: `loader-drain`/`loader-drain-slow` diganti **`loader-flush`/`loader-flush-wall`** (2.4s). **Tiap item `data-flush` kini tersedot SENDIRI-SENDIRI**: `armFlush()` mengukur vektor tiap elemen ke pusat layar (`--tx`/`--ty`) + urutan antrean (`--d`, stagger 0.075s) lalu `@keyframes loader-flush` menariknya ke plughole sambil berputar dan mengecil; ruangan kosong dari pinggir ke dalam, nama di tengah disedot **terakhir** (`data-flush-last`, delay 0.9s). Dinding menyusul (`loader-flush-wall`, `scaleY` tertinggal `scaleX` = corong). Timeline: flush 2.4s → pintu 2450ms → leaving 3600ms → `onDone` 4100ms. (2) **Perabot museum** (`MuseumRoom.jsx`, baru): `Floor`, `Cornice`, `Skirting`, `Vitrine` (lemari kaca dengan cast panel flat), `Stanchion` (tiang + tali), `WallLabel`. Dipakai di **Skills, Certificates, Projects, Contact** → keempat ruangan gelap berbagi dinding + lantai + perabot, jadi berpindah section terasa menyusuri koridor. (3) **About jadi museum**: kutipan = *wall quote* berbatang tinta, biografi = *wall text* di dinding polos (bukan kartu), disiplin = satu pelat bone, Core Capabilities = **4 lemari pajang** berkaki plinth (bukan kartu identik), potret owner = karya berbingkai bertingkat (cast flat → moulding `#08080b` → liner `#2b2b30` → mat bone → foto) + label dinding; di mobile narasi didahulukan (`order-1`/`order-2`). **`WallBand`** (frieze nama sayap) dicoba lalu **dihapus** karena memicu FAIL `eyebrow` + `micro-label`. **Lint: 0 FAIL**; **inspector: 3 FAIL** (semua pre-existing: `font-count`, `covered-text`, `pinned-over-picture`); build bersih, 0 console error; diverifikasi di 1440/768/390. |
| 18 Okt 2026 | Agent 3 | **Koleksi tetap: pameran lukisan & patung asli di dinding porto.** Permintaan: "coba ditambahkan lagi di background nya kaya pameran lukisan terkenal lah patung lah atau apa gitu dan buat lebih bagus lagi". (1) **Riset & unduh karya**: `scripts/assets.mjs` mencari di Openverse, lalu terkunci ke **open-access The Met (lisensi CC0)** — 4 lukisan Eropa (*Portrait of a Man* ca. 1618, *Portrait of a Woman* ca. 1520, *Portrait of a Young Woman* ca. 1490–1500, *A Renaissance Portico with Elegant Figures* ca. 1615) + 2 marmer klasik (*Marble statue of Aphrodite*, *Marble statue of Herakles*). Diproses `magick` → WebP (x1200–x1400, q82) di `public/exhibits/`, total ~730 KB. (2) **`src/data/collection.js` (baru)**: satu sumber kebenaran — `src`, `alt`, `title`, `credit`, `year`, `type`. (3) **`MuseumRoom.jsx` diperluas**: **`HungWork`** (lukisan dalam bingkai bertingkat *cast flat → moulding → liner → mat bone → karya* + label dinding: judul di pelat bone, kredit + tahun di bawahnya) dan **`Sculpture`** (marmer di atas **plinth dua tone** dengan cast panel). (4) **Penempatan** (dihitung, bukan ditaksir — CDP mengukur margin: 1440 grid 80→1360 = cuma 80px, 2xl = 200px+): Accolades — 1 lukisan besar di kanan kepala ruangan sejak `lg` (terlihat di semua lebar desktop) + 3 di margin `2xl`; Exhibition — 1 di kanan kepala + 2 di margin `2xl`; Craft — 2 marmer berdiri di lantai margin bawah; Reception — 1 lukisan. (5) **Kredit di Footer** lewat panel tone-step (`bg-white/[0.04]`, **bukan** `border-t` — hairline dilarang). (6) **Perbaikan temuan**: `loading="lazy"` dilepas dari gambar koleksi (hanya 6, kecil) — ini yang membuat `few-pictures` + `eyebrow` hilang karena gambar akhirnya benar-benar ada di DOM; patung yang labelnya menabrak grid dipindah dari Accolades/Exhibition ke lantai Craft. (7) **Ruang depan ikut berkoleksi**: dua plat abstrak abu di loader (kiri/kanan nama) diganti **dua karya asli Met** — *Portrait of a Young Woman* & *A Renaissance Portico* — jadi ruang depan mengumumkan koleksi yang sama dengan sayap di belakangnya. **Inspector: 3 FAIL → 2 FAIL** (`covered-text` + `pinned-over-picture`, keduanya dari lukisan latar hero yang memang di belakang headline — by design, pre-existing); **lint: 0 FAIL**; build bersih, 0 console error; diverifikasi di 1440/768/390 dan 1920. |
| 18 Okt 2026 | Agent 3 | **Foto owner + kartu ID museum untuk pengunjung.** Permintaan: "saya kan udah memasukan poto saya dan ada di originals… namanya Kepin.jpg coba di id yang owner nya kamu ganti jadi poto saya dan buat saat di loading page nanti orang nya bakal ditanya namanya siapa terus pas dia udah masukan namanya bakal kebuat dah card id dia sementara kaya kalo lagi ngunjungin museum ada lanyard yang id nya tapi atas nama orang yang ngebuka portofolio siapa gitu". (1) **Foto owner**: `public/_originals/Kepin.jpg` (2818×4227) diproses `magick` jadi **dua crop** — `public/owner.jpg` (1067×1600, untuk potret About yang wadahnya 4:5) dan **`public/owner-square.jpg` (900×900, crop persegi berpusat di wajah)**. Crop persegi penting: avatar Navbar 36px & chip Loader 40px berbentuk lingkaran dengan `object-cover`, jadi foto vertikal akan memotong wajah. About (`/Kepin.jpg` — path salah, file tak ada → foto tak muncul) & Navbar & Loader diseragamkan: potret pakai `owner.jpg`, yang bulat pakai `owner-square.jpg`. Fallback monogram "KM" tetap. (2) **Meja resepsionis di loading page**: sebelum nama diisi, loader menampilkan plat **"Visitor's name, for the day pass"** + input + tombol Enter; setelah disubmit, plat itu berganti jadi **kartu "MUSEUM PASS"** — band kepala ink (MUSEUM PASS / ROOM I), foto pass (potret owner, `owner-square.jpg`), "Admitted" + **nama pengunjung** dalam display serif, "Valid today · one visit", dan baris kaki "Digital Artifacts & Spatial Code · Collection of…". Kartu **digantung tali lanyard**: dua tali `#3f3e3a` 3px turun dari atas viewport (`-top-[42vh]`) ke klip `#4c4b47` di kepala kartu; tali diposisikan absolut dengan tinggi negatif supaya tidak mendorong layout dan ikut tersedot saat flush. (3) **Alur rilis diubah**: gate kini butuh **nama** (`visitorRef`), dengan `CARD_DWELL_MS` **2.6s** setelah nama masuk supaya pengunjung sempat membaca kartunya sebelum disedot, dan `NAME_WAIT_MS` **11s** sebagai batas sabar — pengunjung yang mengabaikan meja tetap dibuka sebagai **"Guest"**, tidak pernah terjebak. Jam dibagi lewat `startAtRef`/`namedAtRef` (satu clock `performance.now()`). (4) **Detail ikut berubah**: kicker jadi "You are signed in", catatan kurator jadi *"Welcome, {nama}. The galleries are yours — take your time."*, dan judul/byline **diredupkan ke 45%** (`transition-opacity` 700ms) begitu kartu keluar supaya kartu jadi fokus. (5) **Perbaikan tata letak**: catatan kurator `w-44` di mobile & `mt-2` supaya tidak menimpa kicker saat `-mt-6` (mobile) / `-mt-16` (desktop). (6) **Perbaikan timing (penting)**: gerbang rilis & tiga tahap keluar loader dulu memakai `setTimeout` berantai yang di-clamp saat tab tidak fokus → keluar bisa 2× lebih lama dari 3.7s yang dirancang (terukur 8.6s di headless). Diganti: gerbang = `requestAnimationFrame` + `setInterval(120)` cadangan; tiga tahap keluar = satu loop yang membandingkan **waktu dinding absolut** (2250/3250/3700ms) sehingga tick telat tetap menjalankan semua tahap jatuh tempo dengan urutan benar. `useEffect` dijadikan `[]` (sekali jalan) dengan `onDone` di `onDoneRef` — parent mengirim closure baru setiap render, yang tadinya **membangun ulang efek dan me-reset jam di tengah jalan**. Meja memanggil `gateRef.current()` saat submit agar gerbang langsung dievaluasi. `NAME_WAIT_MS` (11s terpisah) diganti `DESK_GRACE_MS` (6s **di atas** floor) supaya pengunjung yang mengabaikan meja tidak menunggu jauh lebih lama daripada sebelumnya; pengunjung yang sudah mengisi nama dilepas tanpa menunggu frame WebGL. `CARD_DWELL_MS` 2.6s → **1.2s**. **Lint: 0 FAIL**; **inspector: 2 FAIL** (pre-existing); build bersih, 0 console error; alur diverifikasi end-to-end di 1440/768/390 (form → kartu → tahan → flush → pintu → situs), urutan tahap keluar terbukti benar. |
| 18 Okt 2026 | Agent 3 | **Kartu ID = nama saja + efek siram cat + penghalusan (anti-lag).** Permintaan: "dibuat semua nya halus coba dan jangan lag terus juga pas awal awal jadi id dia aja jangan malah nambahin foto saya terus juga di id yang ada foto saya buatkan ikon di samping id atau dimana gitu untuk kalo misalnya di pencet nanti kaya disiram sama cat banyak warna nah tiba tiba nanti id yang ada foto saya nya menjadi berwarna cuman kalo mau monokrom lagi warnya nya berarti harus pencet lagi biar monokrom". Setelah diklarifikasi, user memilih: ikon siram cat di **foto About saja**, dan **hapus foto owner dari kartu ID pengunjung** (*"harusnya buatkan id nya nama saja untuk mereka"*). (1) **Kartu ID tanpa potret**: foto `owner-square.jpg` dihapus dari kartu MUSEUM PASS; diganti **monogram "KM"** sebagai *counter-mark* penerbit di slot foto (seperti pass asli yang mencetak lambang museum). State `photoOk` jadi tak terpakai → dihapus. Verifikasi CDP: teks kartu = `MUSEUM PASS / ROOM I / KM / Admitted / Ayu Larasati / Valid today · one visit / …`, dan `querySelectorAll('img')` **di dalam kartu = kosong**. (2) **Chip foto di ruang depan loader dihapus** juga → tidak ada wajah owner di layar pembuka sama sekali (sisa `owner-*.jpg` di halaman hanya avatar Navbar & potret About, di bawah). (3) **Efek siram cat (`AboutSlide.jsx` + `index.css`)**: tombol ember (`PaintBucket`, 44px, `#08080b`) di **sisi kanan bingkai** potret (`absolute top-1/2 -right-4 -translate-y-1/2 z-30`). Klik → `.portrait-pour` (SVG inline 6 bidang warna, tepi bergelombang, 1.05s, mengalir turun) menyiram bingkai, lalu `.portrait-photo.is-painted` membuat **foto berwarna penuh** (transisi `filter` 620ms); ikon berganti `Contrast`, `aria-pressed` mengikuti. Klik lagi → balik monokrom. Semua properti animasi = `opacity`/`transform`/`filter` (komposit GPU), warna digerakkan `filter` (bukan tukar `src`) sehingga tanpa unduhan kedua & tanpa kedipan, `will-change` dipasang hanya selama siraman. Kelas dibersihkan timer 1150ms (bukan `animationend`) supaya tekan ganda cepat tidak menyangkutkan layer. (4) **Penghalusan (sumber lag diperbaiki, bukan ditebak)** — dua komponen mengirim `setState` **tiap frame/event**, memicu rekonsiliasi React 60–ratusan×/detik: `ScrollPath.jsx` (`setProgress` per frame + `getPointAtLength` di dalam render) dan `CustomCursor.jsx` (`setPos` tiap `mousemove` + `useEffect` ber-`[visible]` yang **melepas-pasang listener tiap kali kursor muncul**). Keduanya ditulis ulang menulis **langsung ke DOM** (atribut SVG `stroke-dashoffset`/`cx`/`cy`; `style.transform` + class `cursor-ring-hot`), posisi kursor hanya ditulis bila pointer bergerak, `CustomCursor` dipasang **sekali** (`[]` deps) dengan opacity awal 0 lalu muncul saat gerakan pertama. (5) **`transition-all` dihapus semua (10 lokasi)** → dipersempit ke properti nyata (`transition-colors`, `transition-[height,width,background-color]`, `transition-[background-color,padding]`, `transition-[opacity,transform]`, `transition-[background-color,transform,border-color]`). Yang paling penting: 3 `<input>`/`<textarea>` Contact yang tadinya `transition-all` = menganimasikan `box-shadow` tiap ketikan. (6) **CSS mati dibuang**: `.glass-panel-light`/`.glass-panel-dark` (`backdrop-filter: blur(12–14px)`, **tidak dipakai di mana pun**) dihapus; `backdrop-blur-md` di overlay `CertificateModal` dilepas (repaint mahal untuk overlay penuh). **`lint.mjs`: 0 FAIL, 34 → 17 WARN** (penurunan langsung dari penghapusan `transition-all`). **Inspector: 2 FAIL** (pre-existing). Build bersih, **0 console error**; build produksi terverifikasi; siram cat & kartu ID diverifikasi lewat CDP (klik → aria-label bertukar "Pour colour…"/"Drain the colour…", screenshot sebelum/selama/sesudah). |
