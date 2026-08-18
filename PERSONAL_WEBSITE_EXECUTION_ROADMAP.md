# KİŞİSEL WEB SİTESİ — YÜRÜTME YOL HARİTASI

> **Durum:** Faz 0 tamamlandı (referans analizi + teknoloji araştırması + mimari kararlar).
> **Sonraki adım:** Faz 1 için **açık kullanıcı onayı** bekleniyor. Onay gelmeden kod yazılmayacak.
> **Referans:** `Web-ste.webm` (proje kökü)
> **Doküman dili:** Türkçe · **Kod/teknik tanımlayıcılar:** İngilizce
> **Oluşturulma:** 2026-08-18

---

## 0. BU DOKÜMAN HAKKINDA

Bu dosya projenin tek yürütme kaynağıdır. Her faz bu dokümandan okunur, bu dokümana karşı doğrulanır.
İkinci zorunlu doküman: `WORKING_DISCIPLINE.md` (kalıcı çalışma sözleşmesi).

Gözlem etiketleri bu doküman boyunca tutarlı kullanılır:

| Etiket       | Anlamı                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------- |
| **OBSERVED** | Videodan doğrudan ölçüldü/görüldü. Piksel örneklemesi, hareket analizi veya net görsel kanıt var. |
| **INFERRED** | Gözlemden makul çıkarım. Doğrudan kanıt yok ama görüntüyle tutarlı tek makul açıklama.            |
| **UNKNOWN**  | Videoda yok. Tahmin edilmeyecek; tasarım kararı olarak bizim tarafımızdan verilecek.              |

---

## 1. REFERANS ANALİZİ

### 1.1 Teknik künye (OBSERVED)

| Alan                   | Değer                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| Dosya                  | `Web-ste.webm`, 14.7 MB                                                    |
| Codec / süre           | VP8, 26.83 sn, 799 kare, 29.67 fps (kare aralığı 33–34 ms, düşen kare yok) |
| Çözünürlük             | 1849 × 1007 (tarayıcı penceresi dahil ekran kaydı)                         |
| Görüntü alanı          | ~1849 × 971 CSS px (tarayıcı kromu ~36 px)                                 |
| Kayıt ortamı           | Linux masaüstü, Brave tarayıcı                                             |
| Kaydedilen URL         | `my-portfolio-tawny-one-51.vercel.app`                                     |
| Sayfa yüksekliği       | ~5710 px (kaydırma çubuğu thumb oranından hesaplandı: 158/930)             |
| Toplam kaydırma        | ~4744 px ≈ 5.9 ekran                                                       |
| Site sahibi (referans) | "Yusuf Yakubov" — Taşkent, Özbekistan                                      |

> ⚠️ **Kritik not:** Referans sitedeki tüm içerik (isim, fotoğraf, projeler, referans yorumları, iletişim
> bilgileri) **başka bir kişiye aittir**. Bu roadmap yalnızca **görsel dili ve etkileşim felsefesini**
> devralır. İçerik %100 sizin olacaktır. Uydurma müşteri yorumu asla üretilmeyecektir (bkz. Risk D-2).

### 1.2 Ölçülmüş sahne zaman çizelgesi (OBSERVED)

Kaydırma konumu, tarayıcı kaydırma çubuğunun thumb pozisyonu kare kare çözülerek çıkarıldı
(1 thumb px ≈ 6.14 sayfa px).

| Zaman       | scrollY (~) | Olay                                       | Ne hareket ediyor                                                | Uygulama tekniği (INFERRED)                                            | Karmaşıklık | Perf etkisi |
| ----------- | ----------- | ------------------------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- | ----------- |
| 00.00–03.96 | 0           | **Hero durağan izleme** (4 sn)             | Sadece meteorlar. Yıldızlar sabit, portre sabit, cam kart sabit. | CSS keyframe meteorlar + statik yıldız DOM/gradient                    | Düşük       | Düşük       |
| 03.96–04.13 | 0→240       | İlk kaydırma darbesi (170 ms)              | Navbar **tam genişlikten yüzen ada'ya** dönüşür                  | scroll listener + `backdrop-blur` + border/shadow geçişi (~200–300 ms) | Düşük       | Düşük       |
| 04.13–05.94 | 240         | Durağan                                    | Meteorlar                                                        | —                                                                      | —           | —           |
| 05.94–06.25 | 240→725     | Kaydırma darbesi (310 ms)                  | Tech logo marquee görünür                                        | —                                                                      | —           | —           |
| 06.25–13.43 | 725         | **Durağan (7.2 sn)** — marquee + About üst | Marquee: 0 → hızlanma → seyir → 0 → hızlanma (bkz. 1.4)          | rAF + lerp'li hız (damped) marquee                                     | Orta        | Düşük       |
| 13.43–13.80 | 725→1210    | Kaydırma darbesi                           | About içeriği                                                    | —                                                                      | —           | —           |
| 13.80–15.31 | 1210        | Durağan                                    | About bölümü tam görünür                                         | IntersectionObserver reveal                                            | Düşük       | Düşük       |
| 15.31–15.55 | 1210→1817   | Kaydırma + **yavaşlama kuyruğu**           | "Featured Projects" başlığı görünür, kartlar hâlâ ~%15 opaklıkta | Scroll-reveal: fade + translateY, stagger                              | Orta        | Düşük       |
| 15.55–17.29 | 1817        | Durağan                                    | Proje kartları belirir                                           | —                                                                      | —           | —           |
| 17.29–18.37 | 1817→2425   | İki kaydırma darbesi                       | 2×2 proje ızgarası                                               | —                                                                      | —           | —           |
| 18.37–18.94 | 2425        | Durağan                                    | Kart detayları (Live / Code)                                     | —                                                                      | —           | —           |
| 18.94–19.24 | 2425→2910   | Kaydırma darbesi                           | **Client Stories** bölümü                                        | —                                                                      | —           | —           |
| 19.24–20.32 | 2910        | **Durağan (1.1 sn)**                       | Testimonial sırası **hareketsiz** (ölçüldü)                      | Yatay taşan sıra; otomatik kaydırma gözlenmedi                         | Düşük       | Düşük       |
| 20.32–21.69 | 2910→3880   | Üç kaydırma darbesi                        | Contact bölümü                                                   | —                                                                      | —           | —           |
| 21.69–22.77 | 3880        | Durağan                                    | İletişim kartları + form                                         | —                                                                      | —           | —           |
| 22.77–23.47 | 3880→4740   | Son kaydırma                               | CTA bandı + footer                                               | —                                                                      | —           | —           |
| 23.47–26.83 | 4740 (dip)  | **Durağan (3.4 sn)** — footer              | Sadece meteorlar                                                 | —                                                                      | —           | —           |

**Okuma:** Kayıt bir _scroll-through_ demosudur. Fare ile hover/tık etkileşimi **kaydedilmemiştir**.
Bu, hover ve mikro-etkileşimlerin büyük ölçüde **UNKNOWN** olduğu ve bizim için en büyük
"bir seviye üstü" fırsat alanı olduğu anlamına gelir.

### 1.3 Ölçülmüş renk paleti (OBSERVED — piksel örneklemesi)

| Rol                        | Ölçülen                      | Önerilen token                        | Not                                          |
| -------------------------- | ---------------------------- | ------------------------------------- | -------------------------------------------- |
| Sayfa zemini               | `#02080d` / `#04070d`        | `--bg-void: #03070C`                  | Neredeyse siyah, hafif mavi-siyan tonlu      |
| Navbar (üstte)             | zeminle aynı                 | şeffaf                                | Kaydırınca ada olur                          |
| Nav ada zemini             | yarı saydam + blur           | `rgba(8,14,22,0.72)` + `blur(16px)`   | INFERRED (arkadaki başlık bulanık görünüyor) |
| Marka aksanı (logo `.Dev`) | `#28ceff`                    | `--accent-cyan: #22D3EE`              |                                              |
| Birincil buton gradyan     | `#0a6aeb` → `#12c1d6`        | `--grad-cta: #1D6FF2 → #14C2D8`       | Soldan sağa lineer                           |
| H1 gradyan metin ("Yusuf") | `#78b1e0` → `#18e3fa`        | `--grad-head: #4FA8F5 → #22E3F5`      | `background-clip: text`                      |
| İstatistik sayıları        | `#3d88ff`                    | `--accent-blue: #3D88FF`              |                                              |
| Rozet zemini               | `#0d1933`                    | `--surface-badge: rgba(13,25,51,.8)`  | Lacivert cam                                 |
| Pill / chip zemini         | `#131821`                    | `--surface-1: #131821`                | 1px `rgba(255,255,255,.08)` kenarlık         |
| İkincil buton              | `#101720`                    | `--surface-2: #101720`                |                                              |
| Cam kart ("Stack")         | `#1c2536`                    | `--surface-glass: rgba(28,37,54,.75)` | blur + border                                |
| Portre çerçeve kenarlığı   | `#12355b`                    | `--border-glow: #12355B`              | Çift çizgi + siyan parıltı                   |
| About sol parıltı          | `#091628` (lacivert)         | `--glow-blue`                         | Yumuşak radial                               |
| About sağ parıltı          | `#04232b` / `#031e20` (teal) | `--glow-teal`                         | Yumuşak radial                               |
| Gövde metni                | `#94a3b8`–`#cbd5e1` bandı    | `--text-muted`, `--text-body`         | INFERRED (antialias tepe değerleri ölçüldü)  |

### 1.4 Ölçülmüş hareket değerleri (OBSERVED)

**Tech logo marquee — kritik bulgu.** Hız kare kare izlendi (sarı JS logosu takip edildi):

```
t=6.5–7.5 s   hız ≈   0 px/s      (durmuş)
t=7.5–8.1 s   hız 0 → -95 px/s    (0.6 sn yumuşak hızlanma)
t=8.1–10.5 s  hız ≈ -95…-101 px/s (düz seyir, ±%6)
t=10.5–11.4 s hız → 0             (0.9 sn yumuşak yavaşlama)
t=11.4–11.5 s hız ≈ 0             (bekleme)
t=11.5–12.2 s hız 0 → -95 px/s    (0.7 sn yumuşak hızlanma)
t=12.2–13.3 s hız ≈ -95…-101 px/s (seyir)
```

Bu aralıkta **sayfa kaydırılmıyordu** (kaydırma çubuğu kare kare sabit doğrulandı) ve videoda
düşen kare yok. Dolayısıyla bu, sabit hızlı bir CSS animasyonu **değil**; hızı sönümlenmiş
(lerp/spring) bir marquee'dir.

- Seyir hızı: **~95–100 px/sn**, sola
- Logo aralığı: **120 px**, tekrar birimi **840 px** (7 logo) → tam tur ≈ 8.7 sn
- Duraklama/başlama geçişi: **0.6–0.9 sn** yumuşak
- **Tetikleyici: INFERRED — hover ile duraklatma.** Alternatif (scroll-velocity) veri ile
  uyuşmuyor. Biz her ikisini de destekleyen tek bir sönümlü hız modeli kuracağız.

**Meteorlar (shooting stars) — OBSERVED:**

- Açı: yatayla **~35–40°**, sağ-aşağı yönlü
- Parlak baş **sağ-alt uçta**, kuyruk sol-yukarı doğru söner
- Uzunluk: **~55–130 px** (değişken), kalınlık ~2–3 px + yumuşak glow
- Aynı anda ekranda **3–8 adet**
- Uygulama (INFERRED): `linear-gradient(transparent → #fff)` çubuk + `rotate(~38deg)` +
  `translate3d` keyframe + `box-shadow` glow + rastgele `animation-delay`

**Yıldız alanı — OBSERVED:** Yıldızlar **parlaklık değiştirmiyor** (sabit bir yamada 0–1.9 sn
boyunca ortalama parlaklık 6.92 → değişim yok). Yani **twinkle yok, parallax yok**.
Arka planda tek canlı öğe meteorlardır.

**Hero portre & cam kart — OBSERVED:** Konumları 0–3.9 sn boyunca **sabit**.
Float/bobbing animasyonu yok, fare parallax'ı yok.

**Kaydırma davranışı — INFERRED:** Kaydırma darbeleri kısa (150–500 ms) ve ani biter.
Ağır bir eylemsizlik (Lenis benzeri) imzası **yok**. Muhtemelen native scroll.

**Scroll-reveal — OBSERVED:** t=15.5 karesinde "Featured Projects" başlığı tam görünürken
altındaki kartlar ~%15 opaklıkta yakalandı → giriş anında `opacity` + `translateY`,
öğe bazlı stagger. (IntersectionObserver / `whileInView`.)

### 1.5 Bölüm bölüm ayrıştırma

**1) Açılış / yükleme deneyimi** — UNKNOWN. Video sayfa yüklenmiş halde başlıyor. Preloader gözlenmedi.

**2) Hero** — OBSERVED. İki kolon (sol metin / sağ görsel), ~1150–1200 px içerik genişliği.
Sol: rozet → H1 → H2 → paragraf → teknoloji pill'leri → 2 buton → 3 istatistik.
Sağ: yuvarlatılmış çerçeveli portre + üzerine bindirilmiş "Stack / React + Django" cam kartı.

**3) Navigasyon** — OBSERVED. Üstte: şeffaf, tam genişlik. Kaydırıldığında: yuvarlatılmış
yüzen ada (~1198 px genişlik, radius ~24 px, `backdrop-blur`, ince kenarlık, hafif gölge).
Öğeler: marka (`Yusuf.Dev`), 4 link (Home/About/Projects/Contact), gradyan CTA ("Let's Talk").
Aktif bölüm göstergesi **yok** (eksiklik). Mobil menü **UNKNOWN**.

**4) Tipografi** — OBSERVED (biçim) / INFERRED (font ailesi).
Hümanist sans; çift katlı `a`, tek katlı `g`, düz `y` inişi, açık apertürler.
Bu, Linux'ta `system-ui`'nin **Cantarell** olarak çözülmesiyle birebir tutarlı.
→ **INFERRED: Referansın belirlenmiş bir web fontu yok; Tailwind'in varsayılan
sistem font yığınını kullanıyor.** Bu, en net "bir seviye üstü" fırsatlarından biri.
Hiyerarşi: H1 ~72 px / ExtraBold, H2 ~32 px / SemiBold, gövde ~17 px, etiketler ~13 px.

**5) Renk sistemi** — bkz. 1.3. Tek temalı (koyu). Açık tema **yok**.

**6) Arka plan** — OBSERVED. Statik yıldız alanı + animasyonlu meteorlar + bölüm bazlı
yumuşak radial parıltılar (About'ta solda lacivert, sağda teal).

**7) Görsel hiyerarşi** — OBSERVED. Bölüm başlıkları iki renkli: ilk kelime beyaz,
ikinci kelime mavi→siyan gradyan ("Featured **Projects**", "About **Me**", "Client **Stories**").
Tutarlı ve etkili bir imza.

**8) Kartlar** — OBSERVED. Proje kartı: üstte 16:9 ekran görüntüsü → başlık + `↗` ikon butonu →
ortalanmış açıklama → teknoloji pill'leri → yan yana "Live" (dolu mavi) / "Code" (ghost) butonları.
Radius ~16 px, zemin `#0d1117` civarı, 1px `rgba(255,255,255,.06)` kenarlık.
Feature kartları (About sol kolon): ikon + başlık + alt başlık, radius ~14 px.
Testimonial kartı: "Verified Client" rozeti → `"` glifi → italik alıntı → avatar + isim + rol.

**9) Butonlar** — OBSERVED. Birincil: gradyan dolgu, radius ~14 px, beyaz metin, opsiyonel `↗`.
İkincil: koyu zemin + ince kenarlık. Nav CTA: aynı gradyan, radius ~12 px.
Sosyal ikon butonları: 40×40, yuvarlatılmış kare.

**10) Hover durumları** — **UNKNOWN.** Videoda hiçbir hover durumu yakalanmadı.

**11) İmleç davranışı** — OBSERVED. **Özel imleç yok**; standart işletim sistemi oku görünüyor.

**12) Fare etkileşimi** — OBSERVED. Fareye tepki veren tek şey (INFERRED) marquee duraklaması.
Parallax, manyetik buton veya tilt yok.

**13) Kaydırma etkileşimi** — INFERRED. Native scroll; anchor navigasyonu muhtemelen smooth.

**14) Kaydırma tetikli animasyonlar** — OBSERVED. Fade + translateY reveal, stagger'lı.

**15) Sayfa geçişleri** — Yok. Site tek sayfa + anchor.

**16) Metin animasyonları** — Blok seviyesinde reveal gözlendi; **karakter/kelime bazlı
split-text reveal gözlenmedi** (UNKNOWN/yok).

**17) Görsel animasyonları** — Kart görsellerinde reveal dışında efekt gözlenmedi.

**18–21) 3D / WebGL / partikül / ışıklandırma** — **Yok.** Referansta WebGL yok.
"Partikül" izlenimi CSS/DOM yıldız+meteor katmanından geliyor.

**22) Derinlik** — Yalnızca katman/gölge/blur ile; gerçek z-parallax yok.

**23) Parallax** — Yok (ölçüldü).

**24) Gradyanlar** — OBSERVED. Üç yerde: metin gradyanı, buton gradyanı, bölüm radial parıltıları.

**25) Blur / cam** — OBSERVED. Nav adası ve "Stack" kartında `backdrop-filter: blur`.

**26) Gölgeler** — Yumuşak, düşük opaklıklı; renkli glow (mavi/siyan) baskın.

**27–28) Motion eğrileri / zamanlama** — Ölçülen: marquee 0.6–0.9 sn sönümlü rampa;
nav dönüşümü ≤300 ms; reveal'ler ~400–700 ms (INFERRED).

**29) Mikro-etkileşimler** — UNKNOWN (yakalanmadı).

**30) Responsive** — UNKNOWN (yalnızca 1849 px masaüstü kaydı).

**31) Footer** — OBSERVED. "Ready to start your next project?" CTA bandı → ayırıcı çizgi →
3 kolon (marka+slogan / Navigation / Connect) → alt bar (telif · "Built with React & Tailwind CSS" ·
yukarı çık butonu).

**32) Genel görsel ritim** — Bölümler ~600–900 px aralıklarla; her bölüm: iki renkli başlık →
alt başlık → içerik ızgarası. Öngörülebilir ve sakin; ama bölümler arası **geçiş** yok (düz kesim).

### 1.6 Referansın güçlü ve zayıf yönleri (dürüst değerlendirme)

**Güçlü:** Tutarlı ve karakterli koyu uzay teması · gradyan başlık imzası · yumuşak sönümlü
marquee (beklenmedik derecede rafine) · sakin, okunabilir düzen · yüzen nav adası.

**Zayıf (bizim fırsat alanımız):** Font kararı yok (sistem fontu) · yıldızlar cansız (twinkle/parallax yok) ·
testimonial sırası kesik, erişim yolu yok · projeler yalnızca dış link, derinlik yok ·
aktif bölüm göstergesi yok · form etiketleri yalnızca placeholder · hover/mikro-etkileşim yok ·
mobil ve reduced-motion davranışı bilinmiyor · CSR SPA (SEO/LCP dezavantajı).

---

## 2. TEKNOLOJİ ARAŞTIRMASI

Araştırma tarihi: **2026-08-18**. Sürümler ve durumlar doğrulandı.

### 2.1 Doğrulanan güncel durum

| Teknoloji                             | Durum (Ağustos 2026)                                                                                                                                                                                      | Bizim için önemi                                                                           |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Next.js**                           | 16.3 stabil (3 Ağustos 2026). Turbopack varsayılan, disk cache ile build 2–5× hızlı, Node streams ile SSR +%22, TypeScript 7 desteği, `AGENTS.md` üretimi. Cache Components / Partial Prefetching opt-in. | Statik ön-render + metadata + `next/image` + `next/font` → SEO ve LCP'de referansın önünde |
| **React**                             | 19.x (R3F 9 ile 19.0–19.2 uyumlu)                                                                                                                                                                         | Next 16.3 ile gelir                                                                        |
| **Tailwind CSS**                      | v4.x olgun; Rust "Oxide" motoru, CSS-first `@theme` konfigürasyonu, artımlı build ~µs                                                                                                                     | Token'lar CSS değişkeni olarak yaşar → tasarım sistemi tek kaynaktan                       |
| **Motion (eski Framer Motion)**       | `motion` v13.x; `motion/react` importu. Hibrit motor, GPU hızlandırmalı scroll, `oklch` animasyonu, spring/layout/scroll hazır                                                                            | Ana animasyon runtime'ımız                                                                 |
| **GSAP**                              | 3.13; **Nisan 2025'ten beri tüm eklentiler dahil %100 ücretsiz, ticari kullanım dahil** (SplitText, MorphSVG…)                                                                                            | Artık lisans riski yok; ama bundle maliyeti var → yalnızca gerekirse                       |
| **Lenis**                             | v1.3+, ~3 KB, native `scrollTo` üzerinden interpolasyon; `position: sticky` ve IntersectionObserver'ı bozmuyor. Safari'de 60 fps tavanı                                                                   | v1'de **kullanmıyoruz** (bkz. 3.3)                                                         |
| **CSS scroll-driven animations**      | Chrome/Edge 115+, Safari 26+ (26.4 threaded, 26.5 hata düzeltmeleri), Firefox flag arkasında. Global ~%84                                                                                                 | Progressive enhancement olarak `@supports` ile kullanılabilir; temel olarak değil          |
| **Three.js / R3F / drei**             | R3F 9.7.x, drei 10.7.x, React 19 uyumlu                                                                                                                                                                   | Referansta 3D yok → v1'de kapsam dışı (bkz. Faz 5 kararı)                                  |
| **Playwright + @axe-core/playwright** | 2026'da E2E + WCAG 2.2 denetimi için en düşük sürtünmeli yığın; GitHub Actions entegrasyonu standart                                                                                                      | Test omurgamız                                                                             |
| **Core Web Vitals eşikleri**          | LCP < 2.5 sn · INP < 200 ms · CLS < 0.1 (75. persentil). INP 2026'da en sık kaybedilen metrik (%43 site başarısız)                                                                                        | Bütçemiz bunun üstüne kurulur                                                              |
| **Geist font**                        | Latin + Latin Extended + Kiril kapsıyor → Türkçe glifler (ş, ğ, İ, ı, ç, ö, ü) kapsam içinde. OFL, npm `geist` paketi                                                                                     | Tipografi kararımızın temeli (Faz 2'de gliflerle doğrulanacak)                             |

### 2.2 Teknoloji karar matrisi

Puanlama 1–5 (5 = en iyi). "Karmaşıklık" ters ölçek (5 = en basit).

#### A) Framework

| Aday                                  | Görsel | Animasyon |  3D | Perf | Mobil | Tarayıcı | Bakım |  DX | Ekosistem | Basitlik |  **Σ** |
| ------------------------------------- | -----: | --------: | --: | ---: | ----: | -------: | ----: | --: | --------: | -------: | -----: |
| **Next.js 16.3 (App Router, statik)** |      5 |         5 |   5 |    5 |     5 |        5 |     5 |   5 |         5 |        3 | **48** |
| Vite + React 19 SPA                   |      5 |         5 |   5 |    3 |     4 |        5 |     4 |   5 |         4 |        5 |     45 |
| Astro 5 + React adaları               |      5 |         4 |   4 |    5 |     5 |        5 |     4 |   4 |         4 |        4 |     44 |
| SvelteKit                             |      5 |         4 |   4 |    5 |     5 |        5 |     4 |   4 |         3 |        4 |     43 |

**Karar: Next.js 16.3.** Gerekçe: (a) statik ön-render → referansın CSR SPA'sına karşı doğrudan
LCP/SEO kazancı; (b) `next/font` ile sıfır-CLS self-hosted font; (c) `next/image` ile AVIF/WebP +
otomatik `sizes`; (d) Metadata API + `opengraph-image` + `sitemap`/`robots` route'ları;
(e) ileride `/work/[slug]` vaka çalışmaları için hazır routing; (f) Vercel'de sıfır sürtünme.
Astro daha az JS gönderirdi ama zengin motion katmanı zaten React adası gerektiriyor ve
Next'in görsel/metadata/route pipeline'ı bu projede net kazanç.

#### B) Animasyon runtime

| Aday                                     | Görsel | Animasyon |  3D | Perf | Mobil | Tarayıcı | Bakım |  DX | Ekosistem | Basitlik |  **Σ** |
| ---------------------------------------- | -----: | --------: | --: | ---: | ----: | -------: | ----: | --: | --------: | -------: | -----: |
| **Motion (`motion` v13)**                |      5 |         5 |   3 |    5 |     5 |        5 |     5 |   5 |         5 |        4 | **47** |
| GSAP 3.13 + ScrollTrigger                |      5 |         5 |   4 |    4 |     4 |        5 |     4 |   4 |         5 |        3 |     43 |
| Saf CSS + IntersectionObserver           |      3 |         3 |   1 |    5 |     5 |        5 |     5 |   3 |         3 |        5 |     38 |
| CSS scroll-driven (`animation-timeline`) |      4 |         4 |   1 |    5 |     5 |        3 |     5 |   4 |         2 |        4 |     37 |

**Karar: Motion (`motion/react`) birincil.** Gerekçe: React-native API, spring/damping modeli
marquee'nin ölçülen sönümlü hızını birebir modelleyebiliyor, `useReducedMotion` yerleşik,
transform/opacity'ye sadık kalıyor (INP dostu).
**GSAP kullanılmayacak** — artık ücretsiz olsa da ikinci bir animasyon runtime'ı taşımak
bundle ve zihinsel yük demek. İhtiyacımız olan tek özel şey split-text; onu ~30 satırlık
kendi `splitText` yardımcımızla yazacağız.
**CSS scroll-driven animations** yalnızca `@supports` ile progressive enhancement olarak
(scroll progress bar gibi) kullanılacak; temel davranış JS ile garanti altında kalacak.

#### C) Kaydırma (scroll) stratejisi

| Aday                                          | Hissiyat | INP | Erişilebilirlik | Mobil | Bakım | Risk | **Karar**   |
| --------------------------------------------- | -------: | --: | --------------: | ----: | ----: | ---: | ----------- |
| **Native scroll + `scroll-behavior: smooth`** |        4 |   5 |               5 |     5 |     5 |    5 | ✅ **v1**   |
| Lenis                                         |        5 |   3 |               3 |     3 |     4 |    3 | ⏸ Ertelendi |

**Karar: v1'de Lenis yok.** Gerekçe: (1) Referans zaten native scroll kullanıyor — "aynı hissiyat"
için gerekli değil; (2) Lenis her kaydırma karesinde JS çalıştırır → INP bütçemizin (200 ms)
en büyük tek riski; (3) işletim sistemi kaydırma tercihlerini ve dokunmatik momentumu ezer;
(4) Safari'de 60 fps tavanı var. **Yeniden değerlendirme tetikleyicisi:** Faz 6'da pinned veya
yatay kaydırmalı bir bölüm gerekirse, Lenis feature-flag arkasında yeniden ölçülerek eklenir.

#### D) Arka plan (yıldız alanı + meteorlar) — projenin imza kararı

| Aday                                      | Görsel | Perf (desktop) | Perf (low-end mobil) |      Bundle | Pil | Fallback | Basitlik |  **Σ** |
| ----------------------------------------- | -----: | -------------: | -------------------: | ----------: | --: | -------: | -------: | -----: |
| **Canvas 2D (tek katman)**                |      5 |              5 |                    4 |   5 (~3 KB) |   4 |        5 |        4 | **32** |
| DOM div + CSS keyframes (referansın yolu) |      4 |              4 |                    2 |           5 |   2 |        4 |        5 |     26 |
| WebGL / Three.js points shader            |      5 |              5 |                    3 | 1 (~160 KB) |   2 |        3 |        2 |     21 |
| Statik SVG/PNG + CSS meteor               |      3 |              5 |                    5 |           4 |   5 |        5 |        5 |     32 |

**Karar: Canvas 2D birincil, statik gradient fallback.**

- Yıldızlar bir kez offscreen canvas'a çizilir (her karede yeniden çizilmez) → neredeyse bedava.
- Twinkle ve parallax yalnızca ince bir "aktif yıldız" alt kümesine uygulanır.
- Meteorlar tek `requestAnimationFrame` döngüsünde; DPR **≤2** ile sınırlanır.
- `IntersectionObserver` + `document.visibilitychange` ile sekme/görünürlük dışında **durur**.
- `prefers-reduced-motion` veya `navigator.hardwareConcurrency ≤ 4` → **statik yıldız katmanı**.
- **WebGL/Three.js reddedildi:** referansta 3D yok, +160 KB bundle ve GPU context maliyeti
  görsel kazancı karşılamıyor. (Faz 5'te bütçe kapılı, tamamen opsiyonel bir WebGL
  "enhanced" katmanı _değerlendirilecek_, ama sitenin tamlığı buna bağlı olmayacak.)

#### E) Tipografi

| Aday                        | Karakter                             | Türkçe glif       | Değişken font | Lisans    | Self-host      | **Karar**  |
| --------------------------- | ------------------------------------ | ----------------- | ------------- | --------- | -------------- | ---------- |
| **Geist Sans + Geist Mono** | Teknik, temiz, koyu zeminde mükemmel | ✅ Latin Extended | ✅            | OFL       | ✅ npm `geist` | ✅ Seçildi |
| Inter + JetBrains Mono      | Güvenli, nötr                        | ✅                | ✅            | OFL       | ✅             | Yedek      |
| Satoshi / General Sans      | Karakterli                           | ✅                | ✅            | Fontshare | ✅             | Alternatif |
| Space Grotesk               | Tema uyumlu ama fazla "quirky"       | ✅                | ✅            | OFL       | ✅             | Hayır      |

**Karar: Geist Sans (UI/gövde) + Geist Mono (teknik aksan).** Mono yüzü; bölüm numaraları,
stack etiketleri, metrikler ve "eyebrow" metinlerde kullanılacak — bu, jenerik portfolyoları
premium olanlardan ayıran en ucuz tek hamle. Faz 2'de Türkçe glifler görsel regresyon testiyle
doğrulanacak; sorun çıkarsa Inter'e düşülür.

---

## 3. NİHAİ STACK VE MİMARİ

### 3.1 Stack

```
Runtime      Next.js 16.3 (App Router) · React 19 · TypeScript 5.9 (build'de TS7 denenecek)
Stil         Tailwind CSS v4 (@theme CSS-first) + design tokens (CSS custom properties)
Animasyon    motion v13 (motion/react) + in-house splitText util
Arka plan    Canvas 2D starfield/meteor engine (bağımlılıksız)
İçerik       TypeScript content modules + Zod şema doğrulaması
Form         Next.js Server Action + Resend (e-posta) + honeypot + rate limit
Görsel       next/image (AVIF/WebP) · statik asset'ler /public
Font         next/font/local (geist paketi) — self-hosted, sıfır CLS
Test         Vitest 4 + Testing Library · Playwright (E2E + visual) · @axe-core/playwright
Kalite       ESLint 9 (flat) · Prettier · TypeScript strict · knip (dead code)
Perf         Lighthouse CI · @next/bundle-analyzer · size-limit
CI/CD        GitHub Actions · Vercel (preview per PR, production on main)
Paket yön.   pnpm (lockfile pinned)
```

### 3.2 Dizin mimarisi

```
.
├─ app/
│  ├─ layout.tsx                 # html/body, font, tema, skip-link, arka plan portal
│  ├─ page.tsx                   # tek sayfa deneyim (hero…footer)
│  ├─ work/page.tsx              # tüm projeler indeksi
│  ├─ work/[slug]/page.tsx       # vaka çalışması (generateStaticParams)
│  ├─ about/page.tsx             # derin özgeçmiş / deneyim
│  ├─ not-found.tsx  error.tsx
│  ├─ sitemap.ts  robots.ts  opengraph-image.tsx
│  └─ api/contact/route.ts       # (veya server action)
├─ components/
│  ├─ layout/    Header, Nav, MobileMenu, Footer, SkipLink, ScrollProgress
│  ├─ sections/  Hero, TechMarquee, About, Work, Testimonials, Contact, CtaBand
│  ├─ ui/        Button, Pill, Card, Badge, Field, Icon, Reveal, GradientText
│  └─ background/ StarfieldCanvas, MeteorLayer, GlowField, BackgroundProvider
├─ lib/
│  ├─ motion/    tokens.ts, variants.ts, useReducedMotionSafe.ts, splitText.ts
│  ├─ hooks/     useScrollSpy, useInView, useMediaQuery, usePrefersReducedMotion
│  └─ utils/     cn.ts, seo.ts, analytics.ts
├─ content/
│  ├─ site.ts        # isim, ünvan, sosyal, SEO varsayılanları
│  ├─ projects.ts    # proje kayıtları (Zod ile doğrulanır)
│  ├─ experience.ts  # deneyim/eğitim
│  ├─ services.ts    # About feature kartları
│  ├─ stack.ts       # marquee logoları + hero pill'leri
│  └─ schema.ts      # Zod şemaları — build'de fail-fast
├─ styles/  tokens.css, globals.css
├─ tests/   unit/  e2e/  visual/  a11y/
├─ .github/workflows/ci.yml
├─ WORKING_DISCIPLINE.md
└─ PERSONAL_WEBSITE_EXECUTION_ROADMAP.md
```

### 3.3 Katman modeli (render sırası)

```
z-0   BackgroundProvider  → StarfieldCanvas (fixed, pointer-events:none, aria-hidden)
z-10  GlowField           → bölüm bazlı radial parıltılar (CSS, GPU-composited)
z-20  İçerik akışı        → tüm bölümler
z-40  Header / Nav adası  → sticky, backdrop-blur
z-50  ScrollProgress · MobileMenu · Toast
```

Arka plan **tek bir fixed canvas**tır; her bölümde yeniden oluşturulmaz. Bölüm parıltıları
CSS radial-gradient katmanlarıdır (canvas'a yük bindirmez).

---

## 4. "BİR SEVİYE ÜSTÜ" — REFERANSI NEREDE GEÇİYORUZ

Her madde: **referansta ne var → biz ne yapacağız → ölçülebilir amaç**.

| #   | Referans                                  | Bizim                                                                                                | Ölçülebilir amaç                                                   |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Sistem fontu (Cantarell'e düşüyor)        | Self-hosted Geist Sans + Mono, `clamp()` akışkan ölçek, tabular sayılar                              | Font kaynaklı CLS = 0; tipografi her OS'ta aynı                    |
| 2   | Yıldızlar cansız, parallax yok            | 3 derinlik katmanı, ince twinkle, ≤8 px pointer parallax, rastgele meteor parametreleri              | Arka plan CPU < %3 (desktop), < %6 (mobil)                         |
| 3   | Projeler yalnızca dış link                | `/work/[slug]` vaka çalışması: problem → çözüm → rol → stack → sonuç                                 | Her proje için CreativeWork JSON-LD; ortalama oturum süresi hedefi |
| 4   | Testimonial sırası kesik, erişim yolu yok | Erişilebilir carousel: klavye ok tuşları, drag, snap, ilerleme, hover/focus'ta duraklama             | Klavye ile tüm kartlara erişim; axe ihlali 0                       |
| 5   | Aktif bölüm göstergesi yok                | Scroll-spy + `layoutId` paylaşımlı pill animasyonu; `aria-current`                                   | Kullanıcı nerede olduğunu her an bilir                             |
| 6   | Mobil menü bilinmiyor                     | Gerçek mobil sheet: focus trap, `Esc`, body-scroll lock, geri tuşu desteği                           | Playwright mobil E2E geçer                                         |
| 7   | Form etiketleri yalnızca placeholder      | Görünür `<label>`, satır içi doğrulama, `aria-describedby`, başarı/hata durumları, `mailto:` yedeği  | axe 0 ihlal; formu klavyeyle tamamlanabilir                        |
| 8   | Açılış deneyimi yok                       | Ön-render HTML + font preload + hero LCP görseli `priority`; ≤400 ms marka geçişi (LCP'yi bloklamaz) | LCP < 2.0 sn (hedef, eşik 2.5)                                     |
| 9   | Reduced-motion davranışı bilinmiyor       | Birinci sınıf reduced-motion modu **+ arayüzde motion toggle** (localStorage)                        | `prefers-reduced-motion` E2E testi                                 |
| 10  | CSR SPA                                   | Statik ön-render, minimum client JS, island tabanlı hidrasyon                                        | Birinci taraf JS < 45 KB gzip                                      |
| 11  | SEO altyapısı zayıf                       | Metadata API, OG image üretimi, JSON-LD (Person/WebSite/CreativeWork), sitemap, robots, canonical    | Lighthouse SEO 100                                                 |
| 12  | İçerik UI'a gömülü                        | Zod ile doğrulanan `content/` modülleri                                                              | Yeni proje eklemek = 1 dosya, 0 JSX                                |
| 13  | Hata durumları görünmüyor                 | Tasarlanmış 404/500, görsel fallback, form hata durumları                                            | E2E hata senaryoları geçer                                         |
| 14  | Hover/mikro-etkileşim yok                 | Manyetik CTA, kart sheen, pill hover, görünürde sayaç animasyonu, e-posta kopyala                    | Her efektin dokümante edilmiş UX amacı                             |
| 15  | Bölümler arası düz kesim                  | Bölüm geçişlerinde parıltı devri + arka plan tonu kayması                                            | Görsel regresyon referans kareleri                                 |
| 16  | Tarayıcı matrisi yok                      | Tanımlı destek matrisi + CI'da görsel regresyon                                                      | Chromium/Firefox/WebKit yeşil                                      |

**Korunacak sanatsal kimlik (dokunulmaz):** derin uzay siyahı zemin · mavi→siyan gradyan imzası ·
iki renkli bölüm başlıkları · meteor yağmuru · yüzen nav adası · cam yüzeyler · sakin dikey ritim.

---

## 5. BİLGİ MİMARİSİ

**İlke: Her sayfanın bir işi var. İşi olmayan sayfa yok.**

| Route           | İş tanımı                                                                                     | Neden var                                                                            |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/`             | Tek sayfa vitrin: Hero → Stack → About → Work (öne çıkan 4) → Social proof → Contact → Footer | Referansın deneyimi; ilk izlenim ve dönüşüm burada                                   |
| `/work`         | Tüm projeler + teknoloji filtresi                                                             | 4'ten fazla proje olduğunda ana sayfa şişmesin; "projects" araması için iniş sayfası |
| `/work/[slug]`  | Vaka çalışması: problem, çözüm, rol, stack, süreç, sonuç, linkler                             | **Referansın en büyük eksiği.** Derinlik + SEO + işveren/müşteri ikna                |
| `/about`        | Derin özgeçmiş: hikâye, deneyim zaman çizelgesi, eğitim, CV indir                             | Ana sayfadaki About bir teaser; işe alım tarafı derinlik ister                       |
| `404` / `error` | Aynı evrende hata deneyimi                                                                    | Kırık linkte kullanıcıyı kaybetmemek                                                 |

**Bilinçli olarak EKLENMEYENLER:** `/contact` (ana sayfa bölümü + `mailto` yeterli),
`/blog`, `/lab`, `/now`, `/uses` — düzenli içerik taahhüdü olmadan bunlar ölü sayfa olur.
Blog gelecekte gerçekten yazılacaksa ayrı bir faz olarak roadmap'e eklenir (scope creep kontrolü).

---

## 6. MOTION SİSTEMİ

Tüm süre/easing/stagger değerleri **tek dosyada** yaşar: `lib/motion/tokens.ts`.
Bileşenlerde ham sayı yasak (WORKING_DISCIPLINE kuralı).

```ts
// lib/motion/tokens.ts  (Faz 2 çıktısı)
export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  slower: 0.9,
  marquee: 8.7, // referansta ölçülen tam tur
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1], // premium "expo-out" — reveal'ler
  inOut: [0.65, 0, 0.35, 1], // nav adası, tema geçişleri
  spring: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  marqueeDamp: { type: 'spring', stiffness: 40, damping: 18 }, // ölçülen 0.6–0.9 sn rampa
} as const;

export const stagger = { tight: 0.04, base: 0.07, loose: 0.12 } as const;

export const distance = { reveal: 24, revealLarge: 40, parallaxMax: 8 } as const;
```

**Standart hareket sözlüğü**

| İsim           | Kullanım              | Değer                                                  |
| -------------- | --------------------- | ------------------------------------------------------ |
| `revealUp`     | Blok girişleri        | `opacity 0→1`, `y 24→0`, `duration.slow`, `ease.out`   |
| `revealChars`  | Yalnızca H1           | Karakter stagger `stagger.tight`, `y 100%→0`, mask ile |
| `staggerGroup` | Kart ızgaraları       | `staggerChildren: stagger.base`                        |
| `navIsland`    | Scroll durum değişimi | `duration.base`, `ease.inOut`                          |
| `magnetic`     | Birincil CTA          | `ease.spring`, max 6 px yer değiştirme                 |
| `marqueeSpeed` | Logo şeridi           | hedef 97 px/sn, `ease.marqueeDamp` ile sönümlü         |
| `countUp`      | İstatistikler         | 1.2 sn, `ease.out`, görünürlükte bir kez               |

**Reduced-motion sözleşmesi:** `useReducedMotionSafe()` tek giriş noktası.
Aktifken: tüm `y/scale` hareketleri iptal, yalnızca `opacity` (0.2 sn); marquee durur;
meteorlar durur; count-up son değeri anında gösterir. Hiçbir bilgi kaybolmaz.

---

## 7. PERFORMANS BÜTÇESİ

Bütçe CI'da **zorunludur**; aşılırsa build kırmızıdır.

| Metrik                                   | Hedef           | Sert eşik (CI fail)    |
| ---------------------------------------- | --------------- | ---------------------- |
| LCP (mobil, Slow 4G)                     | < 2.0 sn        | 2.5 sn                 |
| INP                                      | < 150 ms        | 200 ms                 |
| CLS                                      | < 0.02          | 0.1                    |
| TTFB (Vercel edge)                       | < 200 ms        | 500 ms                 |
| İlk yük JS — toplam (gzip, modern)       | < 160 KB        | **175 KB**             |
| İlk yük JS — **birinci taraf**           | < 35 KB         | **45 KB**              |
| Toplam CSS (gzip)                        | < 20 KB         | 30 KB                  |
| Hero görseli                             | < 120 KB (AVIF) | 180 KB                 |
| Proje görseli (her biri)                 | < 90 KB (AVIF)  | 140 KB                 |
| Font (toplam, woff2)                     | < 90 KB         | 120 KB                 |
| Video (varsa, poster'lı, `preload=none`) | < 1.5 MB        | 2.5 MB                 |
| Arka plan CPU (desktop, idle)            | < %3            | %6                     |
| Arka plan CPU (mid-tier mobil)           | < %6            | %12                    |
| Kare hızı (scroll sırasında)             | 60 fps          | uzun kare (>50 ms) yok |
| JS heap (5 dk sonra)                     | < 40 MB         | 70 MB                  |
| Lighthouse (Perf/A11y/BP/SEO)            | 95/100/100/100  | 90/100/95/100          |

> **Ölçüm notu (Faz 1'de eklendi, 2026-08-18).** İlk taslaktaki "< 100 KB / 120 KB"
> hedefi framework tabanı ölçülmeden yazılmıştı. Next.js 16.3 + React 19'un boş bir
> sayfadaki gerçek ilk-yük maliyeti **131.0 KB gzip** olarak ölçüldü
> (`.next/server/app/_global-error.html`). Dolayısıyla 120 KB fiziksel olarak
> ulaşılamaz bir sayıydı. Bütçe iki parçaya ayrıldı: kontrol edemediğimiz
> **framework tabanı** ve kontrol ettiğimiz **birinci taraf JS**. İkincisi asıl
> sözleşmedir. Ayrıca ölçüm, `noModule` eski-tarayıcı polyfill paketini (38.4 KB)
> **hariç tutar** — destek matrisimizdeki hiçbir tarayıcı onu indirmez.
> Ölçüm aracı: `scripts/check-budgets.mjs`.

**Zarif düşüş (graceful degradation)**

| Koşul                                             | Davranış                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `prefers-reduced-motion: reduce`                  | Statik yıldız katmanı, marquee durur, reveal'ler sadece opacity    |
| `hardwareConcurrency ≤ 4` veya `deviceMemory ≤ 4` | Yıldız sayısı %40'a, meteor sayısı 3'e düşer, twinkle kapalı       |
| `navigator.connection.saveData`                   | Dekoratif görseller ve video yüklenmez                             |
| Sekme arka planda / canvas görünür değil          | rAF döngüsü tamamen durur                                          |
| Canvas 2D context alınamıyor                      | CSS radial-gradient statik yıldız arka planı                       |
| Batarya < %20 (`getBattery`, destekliyorsa)       | Düşük-güç profili                                                  |
| JS kapalı                                         | Tüm içerik okunabilir (statik HTML), navigasyon anchor ile çalışır |

---

## 8. ERİŞİLEBİLİRLİK (WCAG 2.2 AA hedef)

- Semantik HTML: tek `<h1>`, doğru başlık hiyerarşisi, `<nav>`, `<main>`, `<section aria-labelledby>`, `<footer>`
- **Skip link** ilk odaklanabilir öğe
- Görünür focus halkası: 2 px, kontrast ≥ 3:1, arka plan ne olursa olsun (offset + gölge)
- Klavye: tüm etkileşimli öğeler erişilebilir; carousel ok tuşları; menü focus trap + `Esc`
- Kontrast: gövde metni ≥ 4.5:1, büyük başlık ≥ 3:1 — **animasyonlu arka plan üzerinde de**
  (metin bloklarının arkasına scrim uygulanır, CI'da otomatik ölçülür)
- Arka plan canvas'ı `aria-hidden="true"` + `pointer-events: none`
- Alt metinler: dekoratif görseller `alt=""`, anlamlı görseller açıklayıcı alt
- `prefers-reduced-motion` + arayüzde kalıcı motion toggle
- Form: görünür label, `aria-invalid`, `aria-describedby`, hata özeti, `aria-live` durum bildirimi
- Ekran okuyucu ile bölüm bölüm manuel doğrulama (Faz 12)

---

## 9. SEO

- Next.js Metadata API: title template, description, canonical, `robots`
- `opengraph-image.tsx` ile dinamik OG görseli (1200×630) — ana sayfa + her vaka çalışması
- Twitter/X card: `summary_large_image`
- JSON-LD: `Person` (ana sayfa), `WebSite` + `SearchAction`, `BreadcrumbList` (/work/[slug]),
  `CreativeWork` (her proje)
- `app/sitemap.ts` + `app/robots.ts` (otomatik, content'ten türetilir)
- Semantik başlık hiyerarşisi, açıklayıcı link metinleri ("buraya tıkla" yok)
- Görseller: `next/image`, açık `width/height`, AVIF/WebP, lazy (hero hariç `priority`)
- Statik ön-render → bot'lar için tam HTML
- `hreflang` — yalnızca çok dilli seçilirse (bkz. Açık Girdiler)

---

## 10. RESPONSIVE DAVRANIŞ

Kırılım noktaları (Tailwind v4 `@theme` ile tanımlanır):

| Ad    | Genişlik  | Düzen                                                              | Etkileşim uyarlaması                                         |
| ----- | --------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| `xs`  | < 480     | Tek kolon, hero metin-öncelikli, portre altta ve 4:5               | Meteor 3 adet, twinkle kapalı, parallax yok, marquee %60 hız |
| `sm`  | 480–767   | Tek kolon, daha geniş tipografi                                    | Dokunmatik: hover bilgisi yok, tüm bilgi görünür             |
| `md`  | 768–1023  | Work 2 kolon, About 1 kolon (kartlar yatay)                        | Carousel drag + snap                                         |
| `lg`  | 1024–1439 | Referans düzeni: hero 2 kolon, work 2×2                            | Hover durumları aktif, parallax ≤4 px                        |
| `xl`  | 1440–1919 | İçerik `max-w-6xl` (1152 px) — referansla eşleşir                  | Tam etkileşim, parallax ≤8 px                                |
| `2xl` | ≥ 1920    | İçerik `max-w-7xl`'e genişler, tipografi `clamp()` tavanına oturur | Meteor yoğunluğu +%25                                        |

**Yalnızca küçültmüyoruz — yeniden tasarlıyoruz:**

- Nav adası → mobilde tam genişlik sticky bar + sheet menü
- Hero'daki "Stack" cam kartı → mobilde portre altında satır içi rozet
- İstatistikler → mobilde 3 kolon yerine 3 satır, mono tipografiyle
- Testimonial carousel → mobilde tam genişlik snap slider + nokta göstergesi
- `↗` hover ikonları → mobilde kalıcı görünür
- Tıklama hedefleri ≥ 44×44 px
- `dvh` kullanımı (mobil tarayıcı çubuğu zıplaması olmasın)

---

## 11. ASSET STRATEJİSİ

| Kategori                  | Kaynak                                          | Format                 | Çözünürlük      | Sıkıştırma                | Yükleme                                     |
| ------------------------- | ----------------------------------------------- | ---------------------- | --------------- | ------------------------- | ------------------------------------------- |
| Portre (hero)             | **Kullanıcıdan gerekli**                        | AVIF + WebP fallback   | 1200×1500 (4:5) | q≈55 AVIF                 | `priority`, preload, `fetchpriority=high`   |
| Proje ekran görüntüleri   | Kullanıcıdan / canlı sitelerden                 | AVIF                   | 1600×900 (16:9) | q≈50                      | lazy, `sizes` doğru                         |
| Proje videosu (opsiyonel) | Kullanıcıdan                                    | MP4(H.264) + WebM(VP9) | 1280×720        | 2 Mbps                    | `preload="none"`, poster, tıklayınca oynat  |
| Tech logoları             | `simple-icons` (CC0) veya resmi marka paketleri | Inline SVG             | vektör          | SVGO                      | Bundle içinde (küçük), currentColor         |
| UI ikonları               | `lucide-react` (ISC) — tree-shaken              | SVG                    | vektör          | —                         | Named import                                |
| Yıldız/meteor             | **Runtime üretim** (asset yok)                  | Canvas                 | —               | —                         | —                                           |
| OG görselleri             | `next/og` ile üretim                            | PNG                    | 1200×630        | —                         | Edge'de üretilir, cache'lenir               |
| Font                      | `geist` npm                                     | woff2 (variable)       | —               | subset: latin + latin-ext | `next/font/local`, `display: swap`, preload |
| CV / PDF                  | Kullanıcıdan                                    | PDF/A                  | —               | linearize                 | `/public`, indirilebilir                    |
| Favicon / app icons       | Marka işaretinden üretim                        | SVG + ICO + PNG        | 32/180/512      | —                         | `app/icon.tsx`                              |

**Kurallar:** Her raster asset `next/image` üzerinden. Telifi belirsiz hiçbir görsel kullanılmaz.
Referans videodaki proje görselleri **kullanılmayacaktır** — onlar başkasının işi.

---

## 12. İÇERİK STRATEJİSİ

Tüm portfolyo içeriği `content/` altında, **Zod ile doğrulanan** TypeScript modüllerinde yaşar.
Şema ihlali build'i kırar (fail-fast) — böylece eksik alanla canlıya çıkılamaz.

```ts
// content/schema.ts (özet)
export const Project = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  summary: z.string().max(160),
  problem: z.string(), // vaka çalışması alanları
  solution: z.string(),
  role: z.string(),
  outcome: z.string().optional(), // ölçülebilir sonuç varsa
  stack: z.array(z.string()).min(1),
  cover: z.object({ src: z.string(), alt: z.string().min(5) }),
  gallery: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  links: z.object({ live: z.string().url().optional(), repo: z.string().url().optional() }),
  featured: z.boolean().default(false),
  year: z.number().int(),
  status: z.enum(['live', 'wip', 'archived', 'confidential']).default('live'),
});
```

**Testimonial politikası (etik kural):** Referans sitede 4 adet müşteri yorumu var.
Bizim sitemizde **yalnızca gerçek, izin alınmış yorumlar** yayınlanır. Gerçek yorum yoksa
bölüm ya hiç render edilmez ya da yerine dürüst bir alternatif konur (ör. "Çalıştığım kurumlar",
GitHub katkı özeti, sertifikalar). Uydurma sosyal kanıt üretilmeyecektir — bu
`WORKING_DISCIPLINE.md`'de kalıcı kural olarak yer alır.

---

## 13. TEST MİMARİSİ

| Katman                | Araç                                 | Kapsam                                                                                                                                                                               |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Unit**              | Vitest 4                             | `lib/utils`, `lib/motion` token bütünlüğü, `content/schema` doğrulaması, starfield matematiği (yıldız üretimi, meteor ömrü, DPR clamp), `splitText`, `useScrollSpy` mantığı          |
| **Integration**       | Vitest + Testing Library             | Nav durum makinesi, mobil menü focus trap, carousel klavye, form doğrulama, reveal fallback'leri                                                                                     |
| **E2E**               | Playwright (Chromium/Firefox/WebKit) | Ana sayfa akışı, anchor navigasyonu, `/work` → `/work/[slug]`, `/about`, form gönderimi (mock), 404, mobil viewport, klavye ile tam tur                                              |
| **Visual regression** | Playwright `toHaveScreenshot`        | Hero, nav (üst + kaydırılmış), About, Work ızgarası, kart, testimonials, contact, footer, 404 — her biri desktop + mobil; **arka plan animasyonu deterministik seed ile dondurulur** |
| **Accessibility**     | `@axe-core/playwright`               | Her route + mobil menü açık + form hata durumu; WCAG 2.2 AA; **0 ihlal zorunlu**                                                                                                     |
| **Performance**       | Lighthouse CI + `size-limit`         | Bütçe tablosu (Bölüm 7) zorunlu; bundle boyutu PR'da raporlanır                                                                                                                      |
| **Motion**            | Playwright                           | `prefers-reduced-motion: reduce` ile: meteor yok, marquee sabit, reveal anında                                                                                                       |
| **Content**           | Vitest                               | Her proje şemaya uyuyor, her görselin alt metni var, her link geçerli formatta                                                                                                       |

**Determinizm kuralı:** Görsel testlerde arka plan `?seed=` query param veya test-only
`__STARFIELD_SEED__` ile sabitlenir ve `motion`'ın animasyonları `reducedMotion: 'always'`
ile kapatılır. Flaky görsel test kabul edilmez.

---

## 14. CI/CD

```
PR açıldı / push
  │
  ├─ 1. setup      pnpm install --frozen-lockfile (cache'li)
  ├─ 2. lint       eslint . --max-warnings=0  +  prettier --check
  ├─ 3. typecheck  tsc --noEmit
  ├─ 4. unit       vitest run --coverage    (eşik: %80 lib/, %100 content/schema)
  ├─ 5. build      next build (Turbopack) + bundle-analyzer artifact
  ├─ 6. e2e        playwright test --project=chromium,firefox,webkit
  ├─ 7. visual     playwright test tests/visual  (diff artifact olarak yüklenir)
  ├─ 8. a11y       playwright test tests/a11y (axe)  → 0 ihlal
  ├─ 9. perf       lhci autorun  → bütçe tablosuna karşı assert
  ├─ 10. security  pnpm audit --audit-level=high · gitleaks · CodeQL (JS/TS)
  ├─ 11. deploy    Vercel preview (her PR) — yorum olarak URL
  └─ 12. validate  preview URL'e karşı smoke E2E + Lighthouse
main'e merge → Vercel production + production smoke test
```

**Kurallar:** Hiçbir faz CI kırmızıyken tamamlanmış sayılmaz. `main` korumalı; tüm check'ler
zorunlu. Secret'lar yalnızca GitHub Secrets + Vercel Environment Variables'da.

---

## 15. FAZ LİSTESİ VE BAĞIMLILIK GRAFİĞİ

Prompt'taki 16 fazlık taslak, araştırma sonrası **15 faza (0–14)** uyarlandı.
Değişiklikler ve gerekçeleri:

| Değişiklik                                                                                            | Gerekçe                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prompt'un "Faz 6: Interactive Background / WebGL" → **Faz 5'e alındı** ve WebGL'siz tanımlandı        | Arka plan bu sitenin imzası ve **her bölüm onun üstüne kompoze ediliyor**. Sona bırakılırsa tüm bölümlerin kontrast/z-index/perf ayarı yeniden yapılır. Ayrıca referansta WebGL yok — trend diye eklemiyoruz. |
| Prompt'un "Faz 5: Advanced Motion System" → **Faz 6'ya kaydı**                                        | Motion koreografisi arka plan katmanı yerine oturduktan sonra kalibre edilmeli (reveal'ler meteorlarla aynı karede yarışıyor). Motion **token'ları** ise Faz 2'de tanımlanıyor.                               |
| Prompt'un Faz 8 (About) + Faz 9 (Contact) → **Faz 8 ve Faz 9 korundu**, testimonials Faz 9'a bağlandı | Testimonials ve Contact aynı "dönüşüm" hikâyesinin parçası; birlikte tasarlanınca tutarlı.                                                                                                                    |
| Prompt'un Faz 14 (Production Hardening) + Faz 15 (Final Comparison + Launch) → **Faz 14'te birleşti** | İkisi de aynı çıkış kapısı; ayrı faz olması yapay tekrar üretiyordu.                                                                                                                                          |

### Bağımlılık grafiği

```
F0 Analiz/Araştırma  (TAMAMLANDI)
 └─> F1 Mühendislik Temeli  ◄── tüm fazların ön koşulu
      └─> F2 Tasarım Sistemi + Tokenlar
           ├─> F3 App Shell: Nav + Route Mimarisi
           │    └─> F4 Hero + Açılış
           ├─> F5 Uzay Arka Planı (Canvas)      ── F4 ile paralel yürüyebilir
           │    └─> F6 Motion Koreografisi      ◄── F4 + F5 gerekli
           │         ├─> F7 Work / Portfolyo    ── F8, F9 ile paralel
           │         ├─> F8 About / Kişisel Marka
           │         └─> F9 Social Proof + Contact
           │              └─> F10 Responsive / Mobil   ◄── F7+F8+F9 gerekli
           │                   └─> F11 Performans
           │                        └─> F12 Erişilebilirlik + SEO
           │                             └─> F13 Cross-Browser + Görsel QA
           │                                  └─> F14 Production Hardening + Launch
```

**Kritik yol:** F1 → F2 → F3 → F4 → F6 → F7 → F10 → F11 → F12 → F13 → F14
**Paralelleştirilebilir:** F5 ∥ F4 · F7 ∥ F8 ∥ F9

---

## 16. FAZLAR

Her faz zorunlu şablonu takip eder. Bir faz, "Definition of Done" tamamen karşılanmadan
kapatılamaz.

---

# Faz 0 — Referans Analizi, Araştırma ve Tasarım Yönü

## Objective

Referans videoyu ölçülebilir veriye çevirmek, teknoloji alanını araştırmak, stack'i seçmek ve
uygulanabilir bir yol haritası üretmek. **Kod yazılmaz.**

## User Experience Goal

Yok (iç çıktı). Dolaylı hedef: sonraki fazların tahmin yerine ölçüme dayanması.

## Business / Portfolio Goal

Yanlış mimari seçiminden doğacak yeniden yazma maliyetini sıfıra indirmek.

## Dependencies

Yok.

## Reference Elements

Videonun tamamı (799 kare, 26.83 sn) — 54 örnek kare + 6 kontakt sayfa + hedefli tam çözünürlük
kareler + piksel renk örneklemesi + kaydırma çubuğu izleme + `vidstabdetect` hareket vektörleri +
marquee hız takibi.

## Improvements Over Reference

Referansın _ölçülmemiş_ detayları (marquee sönümleme profili, statik yıldız gerçeği, gerçek
kaydırma zaman çizelgesi) ilk kez sayısallaştırıldı — böylece "hissiyat" yerine sayıya göre inşa edilecek.

## Technical Architecture

`ffmpeg`/`ffprobe` ile kare çıkarma, PIL ile piksel analizi, kaydırma çubuğu thumb takibi ile
scroll zaman çizelgesi, tekil logo takibi ile marquee hız profili.

## UI/UX

Yok.

## Motion

Ölçüldü, dokümante edildi (Bölüm 1.4).

## 3D/WebGL

Referansta yok → v1 kapsam dışı; Faz 5'te bütçe kapılı opsiyonel değerlendirme.

## Assets

Analiz artefaktları geçici çalışma dizininde; repoya girmez.

## Responsive Behavior

Videoda gözlenmedi → Bölüm 10'da tasarlandı.

## Accessibility

Referansta doğrulanamadı → Bölüm 8'de baştan tanımlandı.

## SEO

Referans CSR SPA → Bölüm 9'da statik ön-render stratejisi belirlendi.

## Testing

Yok (analiz fazı).

## Performance

Referans ölçülemedi (canlı site test edilmedi) → kendi bütçemiz Bölüm 7'de tanımlandı.

## Deployment

Yok.

## Tasks

- [x] Video künyesi ve kare zamanlaması doğrula
- [x] 2 fps kare çıkar + kontakt sayfaları oluştur
- [x] Tüm bölümleri tam çözünürlükte incele
- [x] Renk paletini piksel örneklemesiyle çıkar
- [x] Kaydırma zaman çizelgesini kare kare ölç
- [x] Marquee hız profilini ölç (kritik bulgu)
- [x] Yıldız/portre/cam kart hareketsizliğini doğrula
- [x] Meteor geometrisini ölç
- [x] Teknoloji alanını araştır ve sürümleri doğrula
- [x] Karar matrislerini oluştur, stack'i seç
- [x] `PERSONAL_WEBSITE_EXECUTION_ROADMAP.md` yaz
- [x] `WORKING_DISCIPLINE.md` yaz
- [x] Öz denetim yap

## Expected Files

`PERSONAL_WEBSITE_EXECUTION_ROADMAP.md`, `WORKING_DISCIPLINE.md`

## AI Agent Execution Prompt

> Bu faz tamamlandı. Yeniden çalıştırılırsa: referans videoyu ffmpeg ile ayrıştır, ölçümleri
> tekrarla ve bu dokümandaki OBSERVED değerlerle karşılaştır. Sapma varsa dokümanı güncelle,
> uydurma.

## Risks

Videonun tek bir masaüstü çözünürlüğünü göstermesi → responsive ve hover davranışı ölçülemedi.
Bu, doküman boyunca **UNKNOWN** olarak işaretlendi.

## Rollback Strategy

Yok (kod yok). Doküman versiyonlanır.

## Success Criteria

Her görsel/etkileşim iddiası ya ölçüme ya da açık bir INFERRED/UNKNOWN etiketine dayanıyor.

## Definition of Done

- [x] Her iki doküman oluşturuldu
- [x] Tüm ölçümler tekrarlanabilir yöntemle elde edildi
- [x] Stack kararları gerekçelendirildi
- [x] Faz 1 tam olarak tanımlandı
- [x] Öz denetim yapıldı

---

# Faz 1 — Mühendislik Temeli

## Objective

Görsel olarak minimal ama **mühendislik olarak eksiksiz** bir üretim iskeleti kurmak:
public GitHub deposu, tip güvenliği, lint, test, E2E, CI, preview + production deployment,
performans bütçesi, tarayıcı matrisi, erişilebilirlik temeli.

## User Experience Goal

Ziyaretçi `https://<domain>` adresine gittiğinde: doğru fontla, doğru renklerle, hatasız,
erişilebilir ve hızlı yüklenen bir "hazırlanıyor" iskeleti görür. Boş ekran veya hata yok.

## Business / Portfolio Goal

İlk günden itibaren canlıya çıkarılabilir bir ürün. Her sonraki faz bunun üzerine güvenle eklenir.

## Dependencies

Faz 0. Kullanıcıdan: GitHub repo adı onayı, (varsa) domain.
**Not:** `gh` CLI bu makinede `emredogan-cloud` hesabıyla oturum açmış durumda (`repo`, `workflow`
scope'ları mevcut) — public repo oluşturulabilir.

## Reference Elements

Bu fazda referansın yalnızca **renk zemini ve font kararı** uygulanır (siyah uzay zemini +
Geist). Bölüm düzeni yok.

## Improvements Over Reference

Referansın altyapısı görünmüyor; biz ilk commit'ten itibaren CI, E2E, a11y ve perf bütçesi
ile başlıyoruz.

## Technical Architecture

```
next@16.3 (App Router) · react@19 · typescript@5.9 strict
tailwindcss@4 (@theme) · motion@13 · zod
eslint@9 flat config + eslint-config-next + jsx-a11y · prettier
vitest@4 + @testing-library/react + jsdom
@playwright/test + @axe-core/playwright
@lhci/cli · @next/bundle-analyzer · size-limit
pnpm@10 (packageManager alanı pinned)
```

## UI/UX

- `app/layout.tsx`: `<html lang>`, skip link, `<main id="content">`, footer stub
- Tek bir "Coming soon" hero: marka kelime işareti (gradyan `.dev` aksanı), tek satır açıklama,
  `mailto:` linki
- Zemin: `--bg-void` düz renk (canvas arka planı Faz 5'te gelir)
- 404 ve error sayfaları iskelet halinde

## Motion

Yok — yalnızca `useReducedMotionSafe()` hook'unun iskeleti ve unit testi.

## 3D/WebGL

Yok.

## Assets

- Geist Sans + Geist Mono (`geist` npm), `next/font/local`, latin + latin-ext subset
- `app/icon.tsx` ile favicon üretimi
- Placeholder OG görseli

## Responsive Behavior

Tek kolon akış; `clamp()` tipografi ölçeği; 360 px–2560 px arası bozulmasız.

## Accessibility

- Skip link, `lang="tr"` veya `lang="en"` (dil kararına göre)
- Odak halkası token'ı tanımlı ve görünür
- Renk kontrastı ilk günden ≥ 4.5:1
- axe testi CI'da çalışır ve **0 ihlal** ile geçer

## SEO

Metadata API (title/description/canonical), `robots.ts`, `sitemap.ts`, temel OG/Twitter kartları.

## Testing

- Unit: `cn()`, `useReducedMotionSafe`, `content/schema` (boş içerikle bile şema doğrulaması)
- E2E: ana sayfa 200 döner, `<h1>` var, skip link klavyeyle çalışır, konsol hatası yok
- A11y: axe → 0 ihlal
- Visual: ana sayfa desktop + mobil baseline
- Perf: Lighthouse CI bütçesi (bu fazda kolay geçer; asıl işi ileride görür)

## Performance

Birinci taraf JS < 10 KB gzip (bu fazda), LCP < 1.2 sn. Bütçeler `scripts/check-budgets.mjs` ve `lighthouserc.json` ile CI'da zorlanır.

## Deployment

- Public GitHub repo (`gh repo create --public`)
- Vercel projesi bağlanır; her PR → preview URL, `main` → production
- `.env.example` commit'lenir; gerçek secret'lar yalnızca GitHub Secrets + Vercel env
- Deployment doğrulama adımı: preview URL'e smoke E2E

## Tasks

1. `gh repo create <isim> --public` + local init + ilk commit
2. `pnpm dlx create-next-app` (App Router, TS, Tailwind v4, ESLint) — Turbopack varsayılan
3. `tsconfig.json` strict + `noUncheckedIndexedAccess` + path alias
4. ESLint 9 flat config + `jsx-a11y` + `@next/eslint-plugin-next`; Prettier + `.editorconfig`
5. Vitest + Testing Library kurulumu, ilk unit testler
6. Playwright kurulumu (chromium/firefox/webkit), `playwright.config.ts`
7. `@axe-core/playwright` a11y test dosyası
8. Visual regression baseline'ları
9. Lighthouse CI + `lighthouserc.json` bütçe tablosu
10. `size-limit` + `@next/bundle-analyzer`
11. `.github/workflows/ci.yml` — 12 adımlı pipeline
12. Vercel projesi + preview/production ayarı
13. `.env.example`, env doğrulama (`lib/env.ts` + Zod)
14. `gitleaks` pre-commit + CI adımı
15. `README.md` (kurulum, script'ler, mimari, katkı akışı)
16. `WORKING_DISCIPLINE.md` repoya taşınır
17. `docs/BROWSER_SUPPORT.md` — destek matrisi
18. `content/schema.ts` + boş `content/*` modülleri
19. Design token iskeleti: `styles/tokens.css` (renkler Bölüm 1.3'ten)
20. `next/font` ile Geist kurulumu + Türkçe glif doğrulaması
21. Minimal "Coming soon" sayfası + 404 + error
22. Sağlık doğrulaması: tüm CI adımları yeşil + production deploy erişilebilir

## Expected Files

```
package.json  pnpm-lock.yaml  tsconfig.json  next.config.ts
eslint.config.mjs  .prettierrc  .editorconfig  .gitignore  .env.example
vitest.config.ts  playwright.config.ts  lighthouserc.json  .size-limit.json
app/{layout.tsx,page.tsx,not-found.tsx,error.tsx,icon.tsx,robots.ts,sitemap.ts,opengraph-image.tsx}
components/layout/{SkipLink.tsx,Footer.tsx}
lib/{env.ts,utils/cn.ts,motion/useReducedMotionSafe.ts}
content/{schema.ts,site.ts,projects.ts}
styles/{tokens.css,globals.css}
tests/unit/*.test.ts  tests/e2e/home.spec.ts  tests/a11y/home.a11y.spec.ts  tests/visual/home.visual.spec.ts
.github/workflows/ci.yml
README.md  WORKING_DISCIPLINE.md  docs/BROWSER_SUPPORT.md
```

## AI Agent Execution Prompt

> `WORKING_DISCIPLINE.md`'yi oku. Faz 1'i yukarıdaki 22 görev sırasıyla uygula.
> Kural: hiçbir görsel bölüm (hero, about, work…) inşa etme — bu faz **yalnızca altyapı**.
> Her adımdan sonra `pnpm lint && pnpm typecheck && pnpm test` çalıştır.
> CI'ı gerçekten çalıştır ve yeşil olduğunu **doğrula**; "geçmesi gerekir" deme.
> Vercel preview URL'ini aç ve konsol hatası olmadığını doğrula.
> Faz sonunda "Definition of Done" listesini tek tek işaretle ve kanıt (komut çıktısı, URL) sun.

## Risks

| Risk                                                    | Etki              | Azaltma                                                                                   |
| ------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| Next 16.3 + Tailwind v4 + Motion 13 peer uyumsuzluğu    | Build kırılır     | Sürümleri tam pinle; ilk kurulumda `pnpm why` ile çakışma kontrolü                        |
| Playwright WebKit Linux'ta ek bağımlılık ister          | CI kırmızı        | `pnpm exec playwright install --with-deps` CI'da                                          |
| Vercel projesi yanlış framework preset'i seçer          | Deploy başarısız  | `vercel.json` yerine proje ayarını açıkça Next.js'e sabitle, deploy'u doğrula             |
| Geist'te Türkçe glif eksikliği                          | Tipografi bozulur | Faz 1 görev 20'de görsel testle doğrula; başarısızsa Inter'e düş (karar dokümante edilir) |
| `gh` hesabı (emredogan-cloud) istenen repo sahibi değil | Yanlış yere repo  | Repo oluşturmadan önce hesabı ve adı kullanıcıya doğrulat                                 |

## Rollback Strategy

Her adım ayrı commit. Sorun çıkarsa `git revert <sha>`. Vercel'de "Instant Rollback" ile
önceki production deployment'a dönülür. `main` her zaman deploy edilebilir durumda kalır.

## Success Criteria

- Public repo mevcut ve README anlamlı
- `pnpm build` yerelde ve CI'da başarılı
- CI'ın 12 adımının tamamı yeşil
- Preview ve production URL'leri çalışıyor, konsol hatası yok
- Lighthouse: Perf ≥ 95, A11y = 100, BP = 100, SEO = 100
- axe: 0 ihlal

## Definition of Done

- [ ] Public GitHub reposu oluşturuldu, `main` korumalı, ilk commit'ler push'landı
- [ ] `pnpm install && pnpm build` temiz bir klonda çalışıyor
- [ ] `pnpm lint` 0 uyarı, `pnpm typecheck` 0 hata
- [ ] Unit testler geçiyor, coverage eşiği sağlanıyor
- [ ] Playwright E2E 3 tarayıcıda geçiyor
- [ ] axe a11y testi 0 ihlal
- [ ] Visual baseline'lar commit'lendi
- [ ] Lighthouse CI bütçesi geçiyor
- [ ] Security taraması (audit + gitleaks + CodeQL) temiz
- [ ] GitHub Actions pipeline'ı **gerçekten çalıştırıldı ve yeşil** (run URL'i sunuldu)
- [ ] Vercel preview ve production deployment'ları doğrulandı (URL sunuldu)
- [ ] `.env.example` var, repoda hiçbir secret yok
- [ ] `README.md`, `WORKING_DISCIPLINE.md`, `docs/BROWSER_SUPPORT.md` yazıldı
- [ ] Performans bütçesi ve tarayıcı matrisi dokümante edildi
- [ ] `git status` temiz

---

# Faz 2 — Tasarım Sistemi ve Global Görsel Dil

## Objective

Referansın ölçülen görsel dilini token'lara çevirmek; tipografi, renk, boşluk, şekil ve motion
token'larını tek kaynakta tanımlamak.

## User Experience Goal

Sitenin her köşesi aynı dili konuşur; hiçbir bileşen "yamalanmış" görünmez.

## Business / Portfolio Goal

Bir geliştirici portfolyosunda tasarım sistemi tutarlılığı doğrudan yetkinlik sinyalidir.

## Dependencies

Faz 1.

## Reference Elements

Bölüm 1.3 renkleri, 1.4 hareket değerleri, iki renkli başlık imzası, radius/blur/glow dili.

## Improvements Over Reference

Referansta token yok (değerler bileşenlere dağılmış görünüyor). Bizde tek `@theme` bloğu;
ayrıca referansın olmayan tipografi kararı, mono aksan yüzü ve akışkan ölçek eklenir.

## Technical Architecture

`styles/tokens.css` → Tailwind v4 `@theme` → utility'ler. Motion token'ları `lib/motion/tokens.ts`.
Storybook **kullanılmayacak** (bakım maliyeti); yerine `/dev/tokens` adında sadece geliştirmede
derlenen bir token galerisi route'u.

## UI/UX

Primitive'ler: `Button` (primary/secondary/ghost/icon), `Pill`, `Badge`, `Card`, `GradientText`,
`SectionHeading` (iki renkli imza), `Field`, `Divider`, `IconButton`.

## Motion

Bölüm 6'daki token seti implemente edilir + `Reveal` bileşeni (henüz koreografi yok).

## 3D/WebGL

Yok.

## Assets

Font yüklemesi kesinleşir; ikon seti (lucide) tree-shaking doğrulanır.

## Responsive Behavior

`clamp()` tipografi ölçeği ve boşluk ölçeği 360→2560 px arası test edilir.

## Accessibility

Her token çifti için kontrast oranı hesaplanır ve unit testle sabitlenir (regresyon koruması).
Odak halkası tüm yüzeylerde ≥3:1.

## SEO

Etkisi yok.

## Testing

Unit: kontrast oranı testleri, token bütünlüğü (kullanılmayan/eksik token yok).
Visual: `/dev/tokens` galeri baseline'ı. A11y: primitive'ler için axe.

## Performance

CSS toplamı < 20 KB gzip; kullanılmayan token yok (knip).

## Deployment

Preview'da token galerisi görülebilir (production'da route yok).

## Tasks

1. `styles/tokens.css` — renk, boşluk, radius, blur, gölge, z-index token'ları
2. Akışkan tipografi ölçeği (`clamp()`), mono aksan stilleri
3. `lib/motion/tokens.ts`
4. UI primitive'leri + varyantlar
5. `SectionHeading` iki renkli imza bileşeni
6. Kontrast unit testleri
7. `/dev/tokens` galerisi + visual baseline
8. `README` tasarım sistemi bölümü

## Expected Files

`styles/tokens.css`, `lib/motion/tokens.ts`, `components/ui/*`, `app/dev/tokens/page.tsx`,
`tests/unit/contrast.test.ts`, `tests/visual/tokens.visual.spec.ts`

## AI Agent Execution Prompt

> Bölüm 1.3 ve 1.4'teki ölçülmüş değerleri token'a çevir. Bileşenlerde ham hex/px/sn değeri
> kullanma. Her renk çifti için kontrast testi yaz. Token galerisini görsel testle kilitle.

## Risks

Token enflasyonu (kullanılmayan 60 token) → knip ile temizlik zorunlu.
Türkçe glif sorunu → Faz 1'de doğrulanmış olmalı.

## Rollback Strategy

Token dosyası tek yerde; geri alma tek commit.

## Success Criteria

Hiçbir bileşende ham tasarım değeri yok; kontrast testleri geçiyor; CSS bütçesi içinde.

## Definition of Done

- [ ] Tüm token'lar tanımlı ve kullanımda
- [ ] Kontrast testleri geçiyor · axe 0 ihlal
- [ ] Visual baseline'lar commit'li · CI yeşil
- [ ] CSS < 20 KB gzip · knip temiz
- [ ] Dokümantasyon güncel · `git status` temiz

---

# Faz 3 — App Shell: Navigasyon ve Sayfa Mimarisi

## Objective

Header/nav (üst durum ↔ yüzen ada), mobil menü, footer, route iskeletleri ve scroll-spy.

## User Experience Goal

Kullanıcı her an nerede olduğunu bilir, her yere klavyeyle gidebilir, mobilde menü doğal hissettirir.

## Business / Portfolio Goal

Navigasyon dönüşümün ilk adımı: "Let's Talk" her ekranda erişilebilir.

## Dependencies

Faz 2.

## Reference Elements

Şeffaf üst nav → kaydırınca yuvarlatılmış yüzen ada (~1198 px, radius ~24, `backdrop-blur`,
ince kenarlık); marka + 4 link + gradyan CTA; footer 3 kolon + alt bar + yukarı çık butonu.

## Improvements Over Reference

Aktif bölüm göstergesi (`layoutId` paylaşımlı pill + `aria-current`), gerçek mobil sheet menü
(focus trap, `Esc`, body-scroll lock, `history` entegrasyonu), skip link, kaydırma ilerleme çubuğu
(`@supports (animation-timeline: scroll())` ile CSS, aksi halde JS).

## Technical Architecture

`Header` client component; scroll durumu `useSyncExternalStore` ile (rAF throttled, layout read yok).
Scroll-spy `IntersectionObserver` ile (scroll event değil) → INP dostu.
Route'lar: `/`, `/work`, `/work/[slug]`, `/about`, `not-found`, `error`.

## UI/UX

Nav ada geçişi 250 ms; CTA her zaman görünür; mobilde alt kısımda sticky CTA (opsiyonel,
Faz 10'da değerlendirilir).

## Motion

`navIsland` (duration.base, ease.inOut) · aktif pill `layoutId` spring · menü sheet spring.

## 3D/WebGL

Yok.

## Assets

Marka işareti (wordmark) SVG.

## Responsive Behavior

≥1024: ada + yatay linkler. <1024: tam genişlik bar + hamburger + sheet.

## Accessibility

`<nav aria-label>`, `aria-current="true"`, menü `role="dialog" aria-modal`, focus trap,
`Esc` kapatır, odak tetikleyiciye döner, `Tab` sırası mantıklı.

## SEO

Route metadata'ları, canonical'lar, `sitemap.ts` route'lardan otomatik türetilir.

## Testing

E2E: anchor navigasyonu, scroll-spy doğru bölümü işaretliyor, mobil menü aç/kapat/klavye,
`/work` ve `/about` 200. A11y: menü açıkken axe. Visual: nav üst + kaydırılmış + mobil menü.

## Performance

Header JS < 8 KB gzip; scroll handler'da layout thrash yok (Performance trace ile doğrulanır).

## Deployment

Preview'da tüm route'lar erişilebilir.

## Tasks

1. `Header` + nav ada durum makinesi · 2. Scroll-spy hook + testleri · 3. Mobil sheet menü
2. `ScrollProgress` (CSS-first, JS fallback) · 5. `Footer` · 6. Route iskeletleri + metadata
3. `sitemap.ts` otomatikleştirme · 8. E2E + a11y + visual testler

## Expected Files

`components/layout/{Header,Nav,MobileMenu,Footer,ScrollProgress}.tsx`,
`lib/hooks/{useScrollSpy,useScrolled}.ts`, `app/work/page.tsx`, `app/about/page.tsx`,
ilgili testler.

## AI Agent Execution Prompt

> Nav'ı iki durumlu bir makine olarak kur (top | floating). Scroll dinlemede layout okuma yapma.
> Scroll-spy'ı IntersectionObserver ile yaz. Mobil menüde focus trap'i gerçek klavye E2E testiyle
> doğrula. Aktif göstergeyi hem görsel hem `aria-current` ile ver.

## Risks

Scroll-spy'ın yanlış bölümü işaretlemesi (uzun bölümler) → rootMargin kalibrasyonu + E2E testi.
`backdrop-filter` Firefox'ta performans → fallback opak zemin, visual testle doğrula.

## Rollback Strategy

Nav bileşeni izole; feature flag ile eski basit header'a dönülebilir.

## Success Criteria

Klavyeyle tüm site gezilebiliyor; nav durumları doğru; mobil menü kusursuz.

## Definition of Done

- [ ] Nav iki durumu da doğru · aktif gösterge doğru
- [ ] Mobil menü: focus trap, Esc, scroll lock, geri tuşu
- [ ] Skip link çalışıyor · axe 0 ihlal
- [ ] Tüm route'lar 200 · sitemap doğru
- [ ] E2E/visual yeşil · CI yeşil · `git status` temiz

---

# Faz 4 — Hero ve Açılış Deneyimi

## Objective

Referansın hero kompozisyonunu ve gradyan başlık imzasını, daha iyi tipografi ve LCP ile kurmak.

## User Experience Goal

İlk 1.5 saniyede kullanıcı **kim olduğunuzu, ne yaptığınızı ve ne yapabileceğinizi** anlar.

## Business / Portfolio Goal

Birincil dönüşüm: "View Projects" ve "Contact Me".

## Dependencies

Faz 2, Faz 3.

## Reference Elements

Sol: rozet ("🚀 Building products & startups") → H1 (beyaz + gradyan isim) → H2 → paragraf →
teknoloji pill'leri → 2 buton → 3 istatistik. Sağ: yuvarlatılmış çerçeveli portre + cam "Stack" kartı.

## Improvements Over Reference

- H1 karakter bazlı reveal (referansta yok) — ama LCP'yi bloklamayacak şekilde
  (metin ilk boyada görünür, animasyon `opacity`/`transform` ile üstüne biner)
- İstatistiklerde görünürlükte sayaç animasyonu + mono/tabular sayılar
- Portre çerçevesinde ince pointer-reactive parıltı (≤8 px, desktop, reduced-motion'da yok)
- Manyetik birincil CTA
- Rozet'te canlı durum ("Freelance işlere açığım") — dönüşüm sinyali
- Portre için AVIF + doğru `sizes` + `priority` → LCP hedefi < 2.0 sn

## Technical Architecture

Hero server component; yalnızca animasyonlu alt parçalar client. `splitText` util ile H1.
Portre `next/image` `priority` + `placeholder="blur"`.

## UI/UX

`max-w-6xl` (1152 px) içerik; iki kolon 1024 px üstünde; hiyerarşi referansla aynı ritimde.

## Motion

Giriş: rozet → H1 (char stagger) → H2 → paragraf → pill'ler (stagger) → butonlar → istatistikler.
Toplam ≤ 1.1 sn. `ease.out`, `stagger.base`.

## 3D/WebGL

Yok.

## Assets

Portre (4:5, AVIF+WebP), marka işareti, teknoloji pill etiketleri (`content/stack.ts`).

## Responsive Behavior

<1024: tek kolon, portre H1'in altında; "Stack" cam kartı satır içi rozete dönüşür;
istatistikler 3 satır.

## Accessibility

H1 tek ve gerçek metin (split edilmiş karakterler `aria-hidden`, erişilebilir metin ayrı
`sr-only` olarak korunur). Portre'nin anlamlı `alt` metni. Butonlar gerçek `<a>`/`<button>`.

## SEO

H1 ana anahtar ifadeyi içerir; `Person` JSON-LD; OG görselinde hero kompozisyonu.

## Testing

E2E: butonlar doğru hedefe gidiyor; H1 metni DOM'da tek parça okunabiliyor (split'e rağmen).
A11y: axe + ekran okuyucu metin kontrolü. Visual: hero desktop/mobil (animasyon dondurulmuş).
Perf: LCP ölçümü Lighthouse'ta.

## Performance

Hero client JS < 12 KB gzip. LCP elemanı portre veya H1 → ikisi de ilk boyada hazır.

## Deployment

Preview'da LCP ölçülür ve bütçeye karşı raporlanır.

## Tasks

1. `Hero` kompozisyonu · 2. `splitText` util + testleri · 3. `CountUp` bileşeni
2. Portre çerçevesi + glow · 5. Manyetik CTA · 6. `content/site.ts` bağlantısı
3. LCP optimizasyonu (preload, priority, sizes) · 8. Testler

## Expected Files

`components/sections/Hero.tsx`, `components/ui/{CountUp,MagneticButton,GradientText}.tsx`,
`lib/motion/splitText.ts`, testler.

## AI Agent Execution Prompt

> Hero'yu server component olarak kur; yalnızca animasyonlu parçaları client'a taşı.
> H1'i split ederken erişilebilir metni **koru** (sr-only kopya + aria-hidden karakterler).
> Portre'yi LCP elemanı olarak optimize et ve Lighthouse ile **ölç**.

## Risks

Split-text'in LCP'yi geciktirmesi → metin CSS ile ilk boyada görünür, animasyon üstüne biner.
Portre görselinin ağır olması → AVIF q55, boyut bütçesi CI'da.

## Rollback Strategy

Split-text feature flag'li; kapatıldığında düz reveal'e döner.

## Success Criteria

LCP < 2.0 sn · hero animasyonu ≤1.1 sn · reduced-motion'da anında görünür.

## Definition of Done

- [ ] Hero referans kompozisyonuyla eşleşiyor, tipografi daha iyi
- [ ] LCP bütçe içinde (kanıt: Lighthouse raporu)
- [ ] H1 ekran okuyucuda tek parça okunuyor
- [ ] reduced-motion doğrulandı · axe 0 ihlal
- [ ] Visual/E2E yeşil · CI yeşil · `git status` temiz

---

# Faz 5 — Uzay Arka Planı (Canvas Starfield + Meteor Motoru)

> **Sıra değişikliği:** Prompt'ta Faz 6'ydı; Faz 5'e alındı. Gerekçe Bölüm 15'te.

## Objective

Referansın imza arka planını — statik yıldız alanı + meteor yağmuru — tek bir performanslı
Canvas 2D katmanı olarak kurmak ve **canlandırmak**.

## User Experience Goal

Sayfa "yaşıyor" hissi verir ama okumayı asla zorlaştırmaz; düşük güçlü cihazda ısınmaz.

## Business / Portfolio Goal

Bu arka plan sitenin akılda kalan tek görsel imzası. Aynı zamanda teknik yetkinlik vitrinidir.

## Dependencies

Faz 2 (token'lar). Faz 4 ile paralel yürüyebilir.

## Reference Elements

Statik yıldızlar (ölçüldü: twinkle yok) · meteorlar: ~35–40°, sağ-aşağı, parlak baş sağ-altta,
55–130 px, aynı anda 3–8 adet · bölüm bazlı radial parıltılar (About'ta sol lacivert, sağ teal).

## Improvements Over Reference

- **3 derinlik katmanı** (uzak/orta/yakın) farklı boyut ve parlaklıkta
- **İnce twinkle** yalnızca yıldızların ~%15'inde, düşük genlikli (göz yormaz)
- **Pointer parallax ≤8 px** (desktop, `ease.spring`) — referansta yok
- Meteor parametreleri (açı, uzunluk, hız, ömür, gecikme) **rastgele** → tekrar hissi yok
- DPR ≤2 clamp, offscreen yıldız buffer'ı, görünürlük dışında **tam durdurma**
- Cihaz sınıfına göre otomatik kalite profili
- `prefers-reduced-motion` ve motion toggle ile tam statik mod
- Metin bloklarının arkasına otomatik scrim → kontrast garanti

## Technical Architecture

```
components/background/
  BackgroundProvider.tsx   # kalite profili seçimi, reduced-motion, visibility
  StarfieldCanvas.tsx      # tek <canvas>, fixed, aria-hidden, pointer-events:none
  GlowField.tsx            # CSS radial-gradient bölüm parıltıları (canvas dışı)
lib/background/
  engine.ts                # rAF döngüsü, delta-time bağımsız
  stars.ts                 # seed'li üretim (test için deterministik)
  meteors.ts               # havuz (pool) — GC baskısı yok
  quality.ts               # cihaz sınıflandırma
```

Yıldızlar bir kez `OffscreenCanvas`'a (veya normal canvas'a) çizilir, her karede `drawImage`
ile kopyalanır → yıldız maliyeti ~0. Meteorlar object pool'dan alınır → allocation yok.

## UI/UX

Arka plan hiçbir zaman metnin okunabilirliğini düşürmez; parıltı yoğunluğu bölüm bazlı ayarlanır.

## Motion

Meteor: `duration` 1.6–3.2 sn (rastgele), `linear`; spawn aralığı 0.4–1.4 sn.
Parallax: `ease.spring`, max 8 px. Twinkle: 2–5 sn sinüs, genlik ±%12.

## 3D/WebGL

**Kullanılmıyor.** Bütçe kapılı opsiyonel değerlendirme: Canvas 2D profili hedefleri
karşılıyorsa WebGL katmanı **eklenmeyecek**. (Karar Bölüm 2.2-D'de gerekçeli.)

## Assets

Yok — tamamen runtime üretim.

## Responsive Behavior

Yıldız yoğunluğu alan başına sabit (`px²` başına), böylece 2560 px'te seyrek görünmez.
Mobilde meteor 3, twinkle kapalı, parallax yok.

## Accessibility

`aria-hidden="true"`, `pointer-events: none`, klavye odağı almaz.
Reduced-motion'da tamamen statik. Metin kontrastı arka plan ne olursa olsun korunur (scrim).

## SEO

Etkisi yok (dekoratif).

## Testing

- Unit: seed'li yıldız üretimi deterministik; meteor havuzu sızdırmıyor; DPR clamp; kalite profili
- E2E: `prefers-reduced-motion` ile canvas animasyonu duruyor; sekme gizlendiğinde rAF duruyor
- Visual: seed sabitlenerek baseline (flaky olmamalı)
- Perf: 30 sn'lik trace — uzun kare yok, heap büyümüyor

## Performance

Desktop CPU < %3, mid-tier mobil < %6. Heap 5 dk sonra < 40 MB. 60 fps.

## Deployment

Preview'da gerçek cihaz testi (en az bir orta seviye Android + bir iOS Safari).

## Tasks

1. `quality.ts` cihaz sınıflandırma · 2. `stars.ts` seed'li üretim + offscreen buffer
2. `meteors.ts` object pool · 4. `engine.ts` rAF + delta-time + visibility
3. `StarfieldCanvas` bileşeni · 6. Pointer parallax · 7. `GlowField` bölüm parıltıları
4. Scrim sistemi · 9. reduced-motion + motion toggle · 10. Testler + perf trace

## Expected Files

`components/background/*`, `lib/background/*`, `tests/unit/background/*`,
`tests/e2e/reduced-motion.spec.ts`, `tests/visual/background.visual.spec.ts`

## AI Agent Execution Prompt

> Tek bir fixed canvas kur. Yıldızları offscreen buffer'a bir kez çiz. Meteorları object pool ile
> yönet. rAF'ı IntersectionObserver + visibilitychange ile durdur. Test edilebilirlik için
> seed'li RNG kullan. Performansı gerçekten **ölç** (Chrome trace) ve bütçeye karşı raporla.
> WebGL ekleme.

## Risks

| Risk                          | Azaltma                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| Mobilde ısınma/pil            | Kalite profili + düşük meteor sayısı + tam durdurma; gerçek cihazda ölç |
| Görsel testlerin flaky olması | Seed + animasyon dondurma zorunlu                                       |
| Metin kontrastının düşmesi    | Scrim + otomatik kontrast testi                                         |
| Canvas retina'da bulanık      | DPR aware çizim, ≤2 clamp                                               |

## Rollback Strategy

`BackgroundProvider` tek giriş noktası; env flag ile statik CSS arka plana anında dönülür.

## Success Criteria

Bütçe içinde 60 fps · reduced-motion tam statik · görsel testler kararlı.

## Definition of Done

- [ ] Canvas motoru çalışıyor, bütçe içinde (kanıt: trace)
- [ ] Reduced-motion ve visibility durdurma E2E ile doğrulandı
- [ ] Gerçek mobil cihazda test edildi (kanıt: not + ölçüm)
- [ ] Kontrast testleri geçiyor · axe 0 ihlal
- [ ] Visual testler kararlı (3 ardışık run flaky değil) · CI yeşil · `git status` temiz

---

# Faz 6 — Motion Koreografisi

> **Sıra değişikliği:** Prompt'ta Faz 5'ti; arka plan sonrası kalibrasyon gerektiği için Faz 6.

## Objective

Sayfa genelinde scroll reveal, stagger, marquee ve mikro-etkileşim koreografisini kurmak.

## User Experience Goal

Hareket dikkati yönlendirir, dağıtmaz. Kullanıcı "animasyon izlediğini" değil, "içerik keşfettiğini" hisseder.

## Business / Portfolio Goal

Motion kalitesi, bir creative developer portfolyosunda doğrudan satış argümanıdır.

## Dependencies

Faz 4 + Faz 5.

## Reference Elements

Scroll-reveal (fade + translateY, stagger — t=15.5 karesinde yakalandı) ·
sönümlü marquee (95–100 px/sn seyir, 0.6–0.9 sn rampa, tam tur 8.7 sn).

## Improvements Over Reference

- Tek merkezî `Reveal` bileşeni (token'lı, reduced-motion farkında)
- Marquee: ölçülen sönümleme profili **birebir** modellenir + hover/focus'ta duraklar +
  isteğe bağlı scroll-velocity boost + mobilde %60 hız
- Bölüm geçişlerinde parıltı devri (referansta düz kesim var)
- `will-change` yönetimi: animasyon bitince kaldırılır (bellek)
- Tüm reveal'ler `IntersectionObserver` ile bir kez tetiklenir (geri kaydırınca tekrar oynamaz)

## Technical Architecture

`components/ui/Reveal.tsx` (variants + `viewport={{ once: true, margin }}`),
`components/sections/TechMarquee.tsx` (rAF + damped speed, `motion` value ile).

## UI/UX

Reveal mesafesi 24 px (büyük bloklar 40 px); stagger 70 ms; hiçbir animasyon 900 ms'yi geçmez.

## Motion

Bölüm 6'daki sözlük uygulanır. Marquee `ease.marqueeDamp` ile hedef hıza yaklaşır.

## 3D/WebGL

Yok.

## Assets

Teknoloji logoları (inline SVG, `currentColor`).

## Responsive Behavior

Mobilde stagger 40 ms, mesafe 16 px, marquee %60 hız.

## Accessibility

Marquee `aria-hidden` değil — logolar anlamlı liste olarak da sunulur (`sr-only` liste);
hover/focus'ta durur (WCAG 2.2.2 "Pause, Stop, Hide" uyumu için **duraklat kontrolü** eklenir).

## SEO

Reveal'ler `opacity` ile — içerik DOM'da her zaman mevcut (bot'lar görür).

## Testing

Unit: damped speed matematiği, reveal variant seçimi.
E2E: reduced-motion'da marquee sabit; duraklat kontrolü çalışıyor; reveal sonrası içerik görünür.
Visual: animasyon dondurulmuş baseline'lar.

## Performance

Yalnızca `transform`/`opacity`. Scroll sırasında uzun kare yok. INP < 150 ms.

## Deployment

Preview'da INP ölçümü.

## Tasks

1. `Reveal` bileşeni + variants · 2. `TechMarquee` sönümlü motor · 3. Duraklat kontrolü
2. Bölüm geçiş parıltıları · 5. `will-change` yönetimi · 6. Mikro-etkileşimler (pill hover, kart sheen)
3. Testler + INP ölçümü

## Expected Files

`components/ui/Reveal.tsx`, `components/sections/TechMarquee.tsx`,
`lib/motion/variants.ts`, testler.

## AI Agent Execution Prompt

> Marquee'yi Bölüm 1.4'teki ölçülmüş profile göre kur: seyir 97 px/sn, rampa 0.6–0.9 sn, sönümlü.
> Hover ve focus'ta duraklat; ayrıca görünür bir duraklat butonu ekle (WCAG 2.2.2).
> Tüm reveal'leri tek bileşenden yönet; bileşenlerde ham süre yazma.

## Risks

Aşırı animasyon → "gimmick" hissi. Azaltma: her efektin dokümante edilmiş amacı olmalı
(`WORKING_DISCIPLINE.md` kuralı); amacı olmayan efekt silinir.
Marquee'nin INP'yi bozması → rAF içinde layout okuma yasak.

## Rollback Strategy

`Reveal` bileşeni `enabled` prop'u ile kapatılabilir; marquee statik listeye düşer.

## Success Criteria

Motion tutarlı, INP bütçe içinde, reduced-motion tam çalışıyor.

## Definition of Done

- [ ] Reveal sistemi tüm bölümlerde tek kaynaktan
- [ ] Marquee ölçülen profile uyuyor (kanıt: ölçüm notu)
- [ ] Duraklat kontrolü + reduced-motion doğrulandı
- [ ] INP < 150 ms (kanıt: Lighthouse/trace)
- [ ] axe 0 ihlal · CI yeşil · `git status` temiz

---

# Faz 7 — Work / Portfolyo Deneyimi

## Objective

Öne çıkan proje ızgarası + `/work` indeksi + `/work/[slug]` vaka çalışmaları.

## User Experience Goal

Ziyaretçi 20 saniyede "bu kişi ne inşa etmiş" sorusunu yanıtlar; ilgilenirse 3 dakikada
bir projenin nasıl yapıldığını öğrenir.

## Business / Portfolio Goal

**Sitenin en yüksek ticari değerli bölümü.** İşveren/müşteri kararı burada verilir.

## Dependencies

Faz 6. İçerik: kullanıcıdan gerçek proje verisi.

## Reference Elements

2×2 kart ızgarası; kart: 16:9 görsel → başlık + `↗` ikon butonu → ortalanmış açıklama →
teknoloji pill'leri → "Live" (dolu mavi) / "Code" (ghost) butonları. "Coming soon" + "TOP SECRET"
durumu.

## Improvements Over Reference

- **Vaka çalışması sayfaları**: problem → çözüm → rol → süreç → stack → ölçülebilir sonuç
- Kart hover: görsel hafif zoom + kenarlık parıltısı + `↗` canlanması (referansta hover yok)
- Kart tamamı tıklanabilir (vaka çalışmasına), "Live"/"Code" ayrı `stopPropagation` linkler
- `status` durumları: `live` / `wip` / `archived` / `confidential` — dürüst etiketleme
- `/work` sayfasında teknolojiye göre filtre (URL query ile paylaşılabilir, JS'siz de çalışır)
- Her proje için `CreativeWork` JSON-LD + kendi OG görseli
- Görsel yoksa üretilen gradyan placeholder (kırık görsel yok)

## Technical Architecture

`content/projects.ts` → Zod → `generateStaticParams` → statik `/work/[slug]` sayfaları.
Kart bir server component; yalnızca hover efekti client.

## UI/UX

Ana sayfada `featured: true` olan en fazla 4 proje + "Tüm projeler →" linki.
`/work` tam liste + filtre. `/work/[slug]` uzun form.

## Motion

Izgara stagger reveal; kart hover 200 ms; sayfa girişinde başlık split reveal.

## 3D/WebGL

Yok.

## Assets

Proje kapak görselleri (AVIF 1600×900), galeri görselleri, opsiyonel demo videosu
(`preload="none"`, poster'lı).

## Responsive Behavior

≥1024: 2 kolon · 768–1023: 2 kolon dar · <768: 1 kolon, `↗` kalıcı görünür,
buton'lar tam genişlik.

## Accessibility

Kart bağlantısı tek erişilebilir isim taşır; iç içe interaktif öğe yok
(kart `<article>` + başlıkta tek `<a>` "stretched link" deseni). Görsellerin anlamlı `alt`'ı.

## SEO

`/work/[slug]` başına metadata + canonical + `BreadcrumbList` + `CreativeWork` JSON-LD;
sitemap otomatik.

## Testing

Unit: `content/projects` şema doğrulaması, filtre mantığı.
E2E: ana sayfa → `/work` → `/work/[slug]`; filtre URL'i; Live/Code linkleri yeni sekmede
`rel="noopener"`. A11y: kart klavye erişimi. Visual: ızgara + kart + vaka sayfası.

## Performance

Görsel bütçesi (≤90 KB/görsel), lazy loading, `sizes` doğru; `/work/[slug]` LCP < 2.0 sn.

## Deployment

Statik olarak prerender edilir.

## Tasks

1. `content/projects.ts` + şema · 2. `ProjectCard` · 3. Ana sayfa `Work` bölümü
2. `/work` indeksi + filtre · 5. `/work/[slug]` şablonu · 6. JSON-LD + OG görselleri
3. Placeholder/hata durumları · 8. Testler

## Expected Files

`components/sections/Work.tsx`, `components/ui/ProjectCard.tsx`,
`app/work/page.tsx`, `app/work/[slug]/{page.tsx,opengraph-image.tsx}`,
`content/projects.ts`, `lib/utils/seo.ts`, testler.

## AI Agent Execution Prompt

> Projeleri `content/projects.ts`'ten oku, Zod ile doğrula, şema ihlalinde build'i kır.
> Kartı "stretched link" deseniyle kur — iç içe `<a>` yasak. Her proje için vaka çalışması
> sayfası üret. Gerçek proje verisi yoksa **uydurma**; kullanıcıdan iste ve placeholder ile
> yapıyı kur.

## Risks

Gerçek proje içeriği yoksa bölüm boş kalır → placeholder sistemi + kullanıcıdan içerik talebi.
Dış görsellerin telifi → yalnızca kullanıcının kendi işleri kullanılır.

## Rollback Strategy

`/work` route'ları bağımsız; sorun çıkarsa ana sayfa ızgarası tek başına çalışır.

## Success Criteria

Her proje kartı vaka sayfasına gidiyor; SEO işaretlemesi geçerli (Rich Results testi).

## Definition of Done

- [ ] Izgara + indeks + vaka sayfaları çalışıyor
- [ ] Şema doğrulaması build'e bağlı · JSON-LD geçerli
- [ ] Görsel bütçesi içinde · LCP bütçe içinde
- [ ] axe 0 ihlal · E2E/visual yeşil · CI yeşil · `git status` temiz

---

# Faz 8 — About / Kişisel Marka Deneyimi

## Objective

Ana sayfadaki About bölümü + `/about` derin sayfası (hikâye, deneyim zaman çizelgesi, CV).

## User Experience Goal

Kullanıcı sizinle çalışmanın nasıl bir şey olacağını hisseder — yalnızca ne bildiğinizi değil.

## Business / Portfolio Goal

Güven inşası; işe alım tarafında karar verici bilgi.

## Dependencies

Faz 6.

## Reference Elements

İki kolon: sol 3 hizmet kartı (Website Development / UI-UX Design / Deployment),
sağ "About **Me**" başlığı + paragraf + teknoloji pill'leri + 2 istatistik kartı;
arkada sol lacivert / sağ teal radial parıltı.

## Improvements Over Reference

- `/about` derin sayfası: hikâye, deneyim zaman çizelgesi, eğitim, sertifikalar, CV indir
- Hizmet kartlarına ölçülebilir çıktı ekleme ("teslim süresi", "kapsam") — genel ifadeler yerine
- Zaman çizelgesi `<ol>` semantiği ile (ekran okuyucu dostu)
- Portre/atölye görseli opsiyonel, `content` ile kontrol
- İstatistikler `content/site.ts`'ten; uydurma sayı yok (elde yoksa gösterilmez)

## Technical Architecture

Server component; `content/{services,experience}.ts`. `/about` statik prerender.

## UI/UX

Ana sayfa About = teaser + "Daha fazla →". `/about` = uzun form.

## Motion

Kolon bazlı stagger reveal; zaman çizelgesinde çizgi ilerleme animasyonu (reduced-motion'da yok).

## 3D/WebGL

Yok.

## Assets

Opsiyonel portre/çalışma alanı görseli, CV PDF.

## Responsive Behavior

<1024: tek kolon; hizmet kartları yatay kaydırma yerine dikey liste (kaydırma tuzağı olmasın).

## Accessibility

Zaman çizelgesi sıralı liste; ikonlar `aria-hidden` + metin etiket; CV linki dosya türü ve
boyutu belirtir ("CV (PDF, 240 KB)").

## SEO

`Person` JSON-LD zenginleştirmesi (`alumniOf`, `knowsAbout`, `sameAs`); `/about` metadata.

## Testing

Unit: `content/experience` şeması. E2E: `/about` yükleniyor, CV linki 200 döner.
A11y: başlık hiyerarşisi + liste semantiği. Visual: her iki görünüm.

## Performance

Ek JS ≈ 0 (server component); CV dosyası lazy.

## Deployment

Statik.

## Tasks

1. `content/{services,experience}.ts` · 2. Ana sayfa `About` bölümü · 3. `/about` sayfası
2. Zaman çizelgesi bileşeni · 5. CV indirme · 6. JSON-LD · 7. Testler

## Expected Files

`components/sections/About.tsx`, `components/ui/Timeline.tsx`, `app/about/page.tsx`,
`content/{services,experience}.ts`, testler.

## AI Agent Execution Prompt

> About içeriğini `content/`'ten oku. Kullanıcıdan gerçek deneyim verisi gelmediyse
> **rakam uydurma** — alanları placeholder olarak bırak ve eksik içeriği raporla.
> Zaman çizelgesini `<ol>` ile kur.

## Risks

İçerik eksikliği → placeholder + açık talep. Genel/klişe metin → kullanıcıdan gerçek hikâye istenir.

## Rollback Strategy

`/about` route'u bağımsız; ana sayfa teaser'ı tek başına yeterli.

## Success Criteria

İçerik `content/`'ten geliyor; hiçbir uydurma metrik yok.

## Definition of Done

- [ ] Ana sayfa About + `/about` çalışıyor · içerik şemadan
- [ ] Zaman çizelgesi semantik · CV linki doğrulandı
- [ ] axe 0 ihlal · testler yeşil · CI yeşil · `git status` temiz

---

# Faz 9 — Social Proof ve İletişim / Dönüşüm

## Objective

Testimonial carousel (varsa) + iletişim bölümü + çalışan form + CTA bandı + footer tamamlanması.

## User Experience Goal

İletişime geçmek üç saniyelik bir iş olsun: e-postayı kopyala, forma yaz veya doğrudan tıkla.

## Business / Portfolio Goal

**Dönüşüm noktası.** Sitenin varlık nedeni.

## Dependencies

Faz 6.

## Reference Elements

"Client **Stories**" başlığı + "Become My Next Client →" butonu + yatay kart sırası
(görüntü alanı kenarında kesiliyor) + "Let's Build Something Amazing Together" pill'i.
Contact: sol 3 bilgi kartı (Email/Location/Phone) + sağ "Send Me a Message" formu.
CTA bandı + 3 kolon footer + yukarı çık butonu.

## Improvements Over Reference

- **Erişilebilir carousel**: klavye ok tuşları, drag, `scroll-snap`, ilerleme göstergesi,
  hover/focus'ta duraklama, duraklat kontrolü, reduced-motion'da statik ızgara
  (referansta kartlar kesik ve ulaşılamaz)
- **Gerçek form**: görünür label, satır içi doğrulama, `aria-describedby`, honeypot + rate limit,
  Server Action ile e-posta gönderimi, başarı/hata durumu, JS kapalıysa `mailto:` yedeği
- E-posta ve telefon için **kopyala** butonu + geri bildirim
- **Etik kural:** Gerçek, izinli yorum yoksa bölüm render edilmez; yerine dürüst alternatif
  (çalışılan kurumlar / GitHub istatistikleri / sertifikalar) veya bölüm tamamen kaldırılır

## Technical Architecture

Carousel: CSS `scroll-snap` + `IntersectionObserver` (JS'siz de kaydırılabilir).
Form: Next.js Server Action + Zod + Resend; rate limit (IP başına 5/saat) Upstash Redis veya
in-memory edge fallback.

## UI/UX

Contact bölümü iki kolon; formda 3 alan (ad, e-posta, mesaj) — sürtünme minimum.

## Motion

Kart stagger reveal; form gönderiminde buton durum animasyonu; başarı durumunda ince onay.

## 3D/WebGL

Yok.

## Assets

Sosyal ikonlar (lucide / simple-icons), avatar görselleri (yalnızca gerçek yorum varsa).

## Responsive Behavior

Carousel mobilde tam genişlik snap slider + nokta göstergesi.
Contact mobilde tek kolon, form üstte.

## Accessibility

Carousel: `role="region" aria-roledescription="carousel"`, `aria-live="polite"` durum,
ok tuşları, duraklat. Form: label, hata özeti, `aria-live` sonuç bildirimi, `autocomplete`.

## SEO

`ContactPoint` yapılandırılmış veri; `mailto`/`tel` linkleri.

## Testing

Unit: form şeması, rate limit mantığı, carousel indeks mantığı.
E2E: form doğrulama hataları, başarılı gönderim (mock), honeypot, klavyeyle carousel,
kopyala butonu. A11y: form hata durumunda axe. Visual: carousel + form + footer.

## Performance

Form JS < 6 KB gzip; carousel CSS-first.

## Deployment

`RESEND_API_KEY` yalnızca Vercel env; preview'da test adresine gönderim.

## Tasks

1. Carousel bileşeni · 2. Testimonial içerik politikası + şema · 3. Contact bilgi kartları + kopyala
2. Form + Server Action + Zod · 5. Rate limit + honeypot · 6. Başarı/hata durumları
3. `mailto:` yedeği · 8. CTA bandı + footer tamamlama · 9. Testler

## Expected Files

`components/sections/{Testimonials,Contact,CtaBand}.tsx`, `components/ui/Carousel.tsx`,
`app/actions/contact.ts`, `lib/rate-limit.ts`, `content/testimonials.ts`, testler.

## AI Agent Execution Prompt

> Carousel'i CSS scroll-snap üzerine kur; JS yalnızca gösterge ve klavye için.
> Formu Server Action ile yaz, Zod ile doğrula, honeypot + rate limit ekle, hata durumlarını
> ekranda göster. **Uydurma müşteri yorumu üretme** — `content/testimonials.ts` boşsa bölümü
> render etme ve bunu raporla.

## Risks

| Risk                     | Azaltma                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| Spam                     | Honeypot + rate limit + (gerekirse) Turnstile                       |
| E-posta sağlayıcı hatası | Hata durumu + `mailto:` yedeği + log                                |
| Sahte sosyal kanıt       | Politika: gerçek yorum yoksa bölüm yok (disiplin dokümanında kural) |
| Carousel klavye tuzağı   | E2E klavye testi zorunlu                                            |

## Rollback Strategy

Form başarısız olursa `mailto:` yedeğine düşer; carousel başarısız olursa statik ızgaraya düşer.

## Success Criteria

Form gerçekten e-posta gönderiyor; carousel klavyeyle tam erişilebilir; sahte içerik yok.

## Definition of Done

- [ ] Form uçtan uca çalışıyor (kanıt: alınan test e-postası)
- [ ] Rate limit + honeypot doğrulandı
- [ ] Carousel klavye + reduced-motion + duraklat doğrulandı
- [ ] Testimonial politikası uygulandı
- [ ] axe 0 ihlal · E2E/visual yeşil · CI yeşil · `git status` temiz

---

# Faz 10 — Responsive ve Mobil Deneyim

## Objective

Masaüstü düzeni küçültmek yerine, mobil için etkileşimleri **yeniden tasarlamak**.

## User Experience Goal

Mobilde site "küçültülmüş masaüstü" değil, telefon için tasarlanmış hissettirir.

## Business / Portfolio Goal

Trafiğin büyük kısmı mobil; dönüşüm burada kaybedilir veya kazanılır.

## Dependencies

Faz 7, 8, 9.

## Reference Elements

Referansta mobil görünüm **UNKNOWN** — tamamen bizim tasarımımız.

## Improvements Over Reference

Bölüm 10'daki tam kırılım tablosu: hero yeniden kompoze, cam kart → satır içi rozet,
istatistikler dikey, hover bilgisi kalıcı görünür, tıklama hedefleri ≥44 px, `dvh` kullanımı,
arka plan kalite profili düşer, marquee yavaşlar, opsiyonel alt sticky CTA.

## Technical Architecture

Container query'ler (Tailwind v4 `@container`) bileşen bazlı uyum için; viewport
kırılımları yalnızca düzen için.

## UI/UX

Tek elle kullanım: birincil aksiyonlar başparmak bölgesinde.

## Motion

Mobilde mesafe 16 px, stagger 40 ms, parallax kapalı.

## 3D/WebGL

Yok.

## Assets

Mobil için ayrı `sizes` ve art direction (hero portresi 4:5 → mobilde 1:1 kırpma).

## Responsive Behavior

360 / 390 / 414 / 768 / 1024 / 1280 / 1440 / 1920 / 2560 px'te tam kontrol.

## Accessibility

Dokunmatik hedefler ≥44×44 px; yalnızca-hover ile ulaşılan bilgi yok; yatay kaydırma yok
(`overflow-x` denetimi CI'da).

## SEO

Mobile-friendly; viewport meta; mobil LCP bütçesi.

## Testing

E2E: Playwright device emülasyonu (iPhone 15, Pixel 8, iPad).
Visual: her kırılımda baseline. Unit: container query yardımcıları.
Özel test: **yatay taşma yok** (her breakpoint'te `document.scrollWidth <= clientWidth`).

## Performance

Mobil LCP < 2.5 sn (Slow 4G), INP < 200 ms, arka plan CPU < %6.

## Deployment

Gerçek cihazda manuel doğrulama (en az 1 Android + 1 iOS).

## Tasks

1. Hero mobil kompozisyonu · 2. Nav/menü mobil ince ayar · 3. Kart/ızgara mobil düzenleri
2. Carousel mobil slider · 5. Form mobil klavye tipleri (`inputmode`) · 6. Arka plan mobil profili
3. Yatay taşma testi · 8. Cihaz testleri

## Expected Files

Mevcut bileşenlerde responsive güncellemeler, `tests/e2e/responsive.spec.ts`,
`tests/visual/responsive.visual.spec.ts`

## AI Agent Execution Prompt

> Her bölümü mobil için **yeniden düşün**, sadece `sm:` prefix ekleme. Yatay taşmayı otomatik
> testle engelle. Gerçek cihazda test et ve sonucu raporla.

## Risks

iOS Safari `100vh` sorunu → `dvh`. `backdrop-filter` mobilde performans → profil düşür.

## Rollback Strategy

Breakpoint bazlı değişiklikler izole; geri alınabilir.

## Success Criteria

Hiçbir breakpoint'te yatay kaydırma yok; mobil bütçeler içinde.

## Definition of Done

- [ ] 9 breakpoint'te visual baseline'lar yeşil
- [ ] Yatay taşma testi geçiyor
- [ ] Mobil Lighthouse bütçe içinde
- [ ] Gerçek cihaz testi yapıldı (kanıt)
- [ ] axe 0 ihlal · CI yeşil · `git status` temiz

---

# Faz 11 — Performans Optimizasyonu

## Objective

Bölüm 7'deki bütçelerin tamamını gerçek ölçümle karşılamak.

## User Experience Goal

Site anında açılır, kaydırma pürüzsüzdür, telefon ısınmaz.

## Business / Portfolio Goal

Hızlı portfolyo = yetkinlik kanıtı. Yavaş portfolyo = ters etki.

## Dependencies

Faz 10.

## Reference Elements

Referansın performansı ölçülmedi (canlı site test edilmedi) — kendi bütçemize karşı çalışıyoruz.

## Improvements Over Reference

Referans CSR SPA; biz statik prerender + minimal client JS + island hidrasyon.

## Technical Architecture

Bundle analizi → en ağır client bileşenlerinin server'a taşınması; `dynamic()` ile geciktirme;
görsel pipeline denetimi; font subset kontrolü; üçüncü parti script denetimi (ideal: sıfır).

## UI/UX

Değişiklik yok (regresyon olmamalı — visual testler koruma).

## Motion

Animasyonların yalnızca compositor özelliklerini kullandığı doğrulanır.

## 3D/WebGL

Yok.

## Assets

Tüm görseller yeniden sıkıştırılır ve bütçeye oturtulur; kullanılmayan asset'ler silinir.

## Responsive Behavior

Değişiklik yok.

## Accessibility

Değişiklik yok (regresyon testi).

## SEO

Perf iyileştirmesi doğrudan SEO'ya yansır.

## Testing

Lighthouse CI (mobil + desktop), `size-limit`, 30 sn'lik scroll trace, bellek sızıntısı testi
(5 dk idle sonrası heap), `knip` ile ölü kod.

## Performance

Bölüm 7'deki tüm satırlar **geçmek zorunda**.

## Deployment

Production benzeri ortamda ölçüm (preview, gerçek ağ kısıtlaması ile).

## Tasks

1. Bundle analizi + en büyük 5 modülün gözden geçirilmesi
2. Client component denetimi (server'a taşınabilecekler)
3. `dynamic()` + `loading` stratejileri
4. Görsel yeniden sıkıştırma + `sizes` denetimi
5. Font subset + preload denetimi
6. Uzun kare avı (Chrome trace)
7. Bellek sızıntısı kontrolü (canvas, event listener, observer temizliği)
8. Ölü kod temizliği
9. Bütçelerin CI'da sertleştirilmesi

## Expected Files

`docs/PERFORMANCE.md` (ölçüm kayıtları), `lighthouserc.json` güncellemesi,
`.size-limit.json` güncellemesi.

## AI Agent Execution Prompt

> Ölçmeden optimize etme. Önce trace al, en büyük 3 sorunu bul, çöz, tekrar ölç.
> Her iyileştirmeyi önce/sonra sayısıyla raporla. Görsel regresyon testleri yeşil kalmalı.

## Risks

Optimizasyon uğruna görsel kaliteden ödün → visual testler koruma; ödün verilecekse
kullanıcıya sorulur (WORKING_DISCIPLINE kuralı).

## Rollback Strategy

Her optimizasyon ayrı commit; regresyonda geri alınır.

## Success Criteria

Bütçe tablosundaki her satır yeşil, kanıtlı.

## Definition of Done

- [ ] Tüm perf bütçeleri geçiyor (kanıt: LHCI raporu + trace)
- [ ] Bellek sızıntısı yok (kanıt: heap ölçümü)
- [ ] Görsel regresyon yok · a11y regresyon yok
- [ ] `docs/PERFORMANCE.md` güncel · CI yeşil · `git status` temiz

---

# Faz 12 — Erişilebilirlik ve SEO Sertleştirme

## Objective

WCAG 2.2 AA'yı otomatik + manuel olarak doğrulamak; SEO altyapısını tamamlamak.

## User Experience Goal

Ekran okuyucu, klavye, yüksek kontrast ve büyütme kullanıcıları için site tam işlevsel.

## Business / Portfolio Goal

Erişilebilirlik bir geliştirici portfolyosunda doğrudan profesyonellik sinyalidir.

## Dependencies

Faz 11.

## Reference Elements

Referansın erişilebilirliği doğrulanamadı — kendi standardımıza karşı çalışıyoruz.

## Improvements Over Reference

Bölüm 8'in tamamı + manuel ekran okuyucu turu + kontrast otomasyonu + `prefers-contrast`
ve `forced-colors` (Windows High Contrast) desteği.

## Technical Architecture

axe CI + manuel NVDA/VoiceOver turu + klavye haritası dokümantasyonu.

## UI/UX

Odak sırası ve odak görünürlüğü son kez kalibre edilir.

## Motion

Motion toggle kalıcılığı ve tüm animasyonların ona uyduğu doğrulanır.

## 3D/WebGL

Yok.

## Assets

Tüm `alt` metinleri gözden geçirilir (dekoratif vs. anlamlı).

## Responsive Behavior

%200 ve %400 zoom'da içerik kaybı olmadığı doğrulanır (WCAG 1.4.10 reflow).

## Accessibility

Hedef: axe 0 ihlal + manuel kontrol listesi tamamen işaretli.

## SEO

Metadata, canonical, OG/Twitter, JSON-LD (Person/WebSite/CreativeWork/BreadcrumbList),
sitemap, robots, `hreflang` (çok dilliyse), Rich Results doğrulaması, Search Console kaydı.

## Testing

axe (tüm route'lar + durumlar), klavye E2E turu, `forced-colors` visual testi,
%400 zoom reflow testi, Rich Results Test, sitemap/robots doğrulaması.

## Performance

Regresyon yok.

## Deployment

Production'a `robots.txt` doğru; preview'lar `noindex`.

## Tasks

1. Tam axe taraması + düzeltmeler · 2. Manuel ekran okuyucu turu (kontrol listesi)
2. Klavye haritası dokümantasyonu · 4. `forced-colors` / `prefers-contrast` desteği
3. Zoom/reflow testi · 6. JSON-LD tamamlama + doğrulama · 7. OG görselleri son hali
4. Sitemap/robots/canonical denetimi · 9. Search Console + analytics (gizlilik dostu)

## Expected Files

`docs/ACCESSIBILITY.md` (kontrol listesi + klavye haritası), `docs/SEO.md`,
`lib/utils/seo.ts` genişletmesi, testler.

## AI Agent Execution Prompt

> axe'i tüm route ve durumlarda çalıştır. Manuel ekran okuyucu turunu **gerçekten yap** ve
> bulguları listele; "muhtemelen çalışır" deme. JSON-LD'yi Rich Results Test ile doğrula
> ve çıktıyı raporla.

## Risks

Animasyonlu arka plan üzerinde kontrast kaybı → scrim ve otomatik kontrast testi (Faz 5'ten).
`forced-colors` modunda gradyan metinlerin kaybolması → fallback düz renk.

## Rollback Strategy

A11y düzeltmeleri görsel regresyona yol açarsa, görsel yerine erişilebilirlik korunur
(WORKING_DISCIPLINE kuralı: "erişilebilirlik görsel efekt için feda edilmez").

## Success Criteria

axe 0 ihlal · manuel liste tam · Rich Results geçerli · Lighthouse A11y=100, SEO=100.

## Definition of Done

- [ ] axe tüm route/durumlarda 0 ihlal
- [ ] Manuel ekran okuyucu turu tamamlandı (kanıt: doldurulmuş kontrol listesi)
- [ ] Klavyeyle tüm site kullanılabiliyor
- [ ] %400 zoom'da içerik kaybı yok
- [ ] `forced-colors` modunda site kullanılabilir
- [ ] JSON-LD doğrulandı · sitemap/robots doğru
- [ ] Lighthouse A11y=100, SEO=100 · CI yeşil · `git status` temiz

---

# Faz 13 — Cross-Browser ve Görsel QA

## Objective

Destek matrisindeki tüm tarayıcılarda görsel ve işlevsel doğruluğu garantilemek.

## User Experience Goal

Site hangi tarayıcıda açılırsa açılsın aynı kalitede.

## Business / Portfolio Goal

Bozuk görünen bir portfolyo, iyi bir portfolyodan daha çok zarar verir.

## Dependencies

Faz 12.

## Reference Elements

Referans yalnızca Brave/Linux'ta gözlendi.

## Improvements Over Reference

Tanımlı destek matrisi + CI'da 3 motorda görsel regresyon.

## Technical Architecture

Playwright: Chromium, Firefox, WebKit. Ek manuel: gerçek Safari (macOS/iOS), Edge, Samsung Internet.

## UI/UX

Motor farklarının kabul edilebilir olduğu yerler dokümante edilir (ör. `backdrop-filter`
render farkı).

## Motion

`prefers-reduced-motion` her motorda doğrulanır.

## 3D/WebGL

Yok.

## Assets

AVIF desteklemeyen tarayıcılarda WebP/JPEG fallback doğrulanır.

## Responsive Behavior

Her motorda 3 kritik breakpoint görsel testi.

## Accessibility

Odak halkası her motorda görünür; `forced-colors` Edge/Windows'ta doğrulanır.

## SEO

Değişiklik yok.

## Testing

Görsel regresyon matrisi: 3 motor × 3 breakpoint × 8 bölüm.
İşlevsel E2E her motorda. Manuel keşif testi kontrol listesi.

## Performance

WebKit'te scroll performansı ayrıca ölçülür (Safari 60 fps tavanı).

## Deployment

Preview URL'i üzerinden gerçek tarayıcı turu.

## Tasks

1. `docs/BROWSER_SUPPORT.md` kesinleştirme · 2. Görsel matris testleri
2. Motor bazlı düzeltmeler · 4. AVIF/WebP fallback doğrulaması
3. Manuel keşif turu · 6. Bilinen farklılıkların dokümantasyonu

## Expected Files

`docs/BROWSER_SUPPORT.md`, `tests/visual/matrix.visual.spec.ts`, güncellenmiş snapshot'lar.

## AI Agent Execution Prompt

> Üç motorda da testleri çalıştır. Fark bulursan önce kök nedeni bul, sonra düzelt;
> snapshot'ı körlemesine güncelleme. Kabul edilen farkları dokümante et.

## Risks

Snapshot güncellemesiyle gerçek regresyonun gizlenmesi → her snapshot güncellemesi PR'da
gerekçelendirilir (disiplin kuralı).

## Rollback Strategy

Motor bazlı CSS düzeltmeleri izole (`@supports` / feature detection).

## Success Criteria

3 motorda tüm testler yeşil; bilinen farklar dokümante.

## Definition of Done

- [ ] Chromium/Firefox/WebKit E2E + visual yeşil
- [ ] Gerçek Safari (masaüstü + iOS) manuel doğrulandı
- [ ] Görsel farklar dokümante edildi
- [ ] Destek matrisi yayınlandı · CI yeşil · `git status` temiz

---

# Faz 14 — Production Hardening, Referans Karşılaştırması ve Launch

## Objective

Canlıya çıkış: güvenlik, izleme, hata yönetimi, domain, son referans karşılaştırması.

## User Experience Goal

Site canlı, hızlı, güvenli ve her koşulda ayakta.

## Business / Portfolio Goal

Ürünü teslim etmek ve sürdürülebilir kılmak.

## Dependencies

Faz 13.

## Reference Elements

Son karşılaştırma: referans videonun 8 anahtar karesi ile bizim sitemizin aynı bölümlerinin
yan yana değerlendirmesi — "aynı evren mi, bir seviye üstü mü?"

## Improvements Over Reference

Referansta olmayan: güvenlik başlıkları, hata izleme, uptime kontrolü, yedekleme,
bağımlılık güncelleme otomasyonu, dokümante edilmiş operasyon.

## Technical Architecture

Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy),
Vercel Analytics + Speed Insights (gizlilik dostu), Renovate/Dependabot, uptime izleme.

## UI/UX

Son cila turu: boşluk, hizalama, mikro-kopya.

## Motion

Son kalibrasyon (hız/zamanlama).

## 3D/WebGL

Yok — kararın gerekçesi `docs/DECISIONS.md`'ye yazılır.

## Assets

Tüm asset'lerin son sıkıştırması ve lisans denetimi.

## Responsive Behavior

Son tur doğrulama.

## Accessibility

Son axe + manuel tur.

## SEO

Domain bağlama, canonical'lar production domain'e, Search Console doğrulaması, sitemap gönderimi.

## Testing

Production smoke testi, uptime kontrolü, CSP ihlali kontrolü (rapor modunda başlat),
form gerçek gönderim testi.

## Performance

Production'da gerçek kullanıcı metrikleri (RUM) toplanmaya başlar.

## Deployment

`main` → production. Instant Rollback prosedürü test edilir.

## Tasks

1. Security headers + CSP (önce `report-only`, sonra enforce)
2. Hata izleme + uptime · 3. Analytics (gizlilik dostu, çerezsiz)
3. Renovate/Dependabot yapılandırması · 5. Domain bağlama + SSL doğrulaması
4. Search Console + sitemap gönderimi · 7. Production smoke testi
5. Rollback prosedürü tatbikatı · 9. **Referans karşılaştırma raporu** (8 kare yan yana)
6. `docs/DECISIONS.md` + `docs/RUNBOOK.md` · 11. Launch

## Expected Files

`next.config.ts` (headers), `docs/{DECISIONS,RUNBOOK,LAUNCH_CHECKLIST}.md`,
`renovate.json`, `docs/REFERENCE_COMPARISON.md`

## AI Agent Execution Prompt

> CSP'yi önce report-only ile aç, ihlalleri topla, sonra sertleştir. Rollback'i **gerçekten
> dene**. Referans karşılaştırmasını referans videodan çıkarılan karelerle yan yana yap ve
> her bölüm için "eşleşti / iyileştirildi / bilinçli farklı" değerlendirmesi yaz.

## Risks

CSP'nin inline stilleri kırması → nonce/hash stratejisi, report-only ile kademeli geçiş.
Domain/DNS gecikmesi → launch tarihinden önce yapılandır.

## Rollback Strategy

Vercel Instant Rollback; `main` her zaman kararlı; rollback prosedürü dokümante ve test edilmiş.

## Success Criteria

Site canlı, tüm bütçeler yeşil, güvenlik başlıkları aktif, izleme çalışıyor,
referans karşılaştırması "aynı evren + bir seviye üstü" sonucunu veriyor.

## Definition of Done

- [ ] Production canlı ve domain bağlı (kanıt: URL)
- [ ] Security headers aktif (kanıt: securityheaders.com veya curl çıktısı)
- [ ] Hata izleme + uptime + analytics çalışıyor
- [ ] Rollback prosedürü test edildi
- [ ] Referans karşılaştırma raporu yazıldı
- [ ] Tüm dokümantasyon güncel
- [ ] CI yeşil · `git status` temiz

---

## 17. ROADMAP ÖZ DENETİMİ

Yol haritası sunulmadan önce yapılan derin gözden geçirme. Her madde: **soru → cevap → kanıt**.

| #   | Kontrol                                          | Sonuç     | Kanıt / Not                                                                                                                                       |
| --- | ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Referans videonun tamamı incelendi mi?           | ✅        | 799 karenin tamamı çözüldü; 54 örnek kare + 6 kontakt sayfa + hedefli tam çözünürlük kareler                                                      |
| 2   | Tüm ana sahneler tanımlandı mı?                  | ✅        | Bölüm 1.2'de 17 satırlık kaydırma-tabanlı zaman çizelgesi                                                                                         |
| 3   | Tüm görünür etkileşimler tanımlandı mı?          | ⚠️ Kısmen | Videoda **hover/tık etkileşimi yok**. Bu açıkça UNKNOWN olarak işaretlendi ve Bölüm 4'te fırsat olarak ele alındı                                 |
| 4   | Olası teknolojiler belirlendi mi?                | ✅        | Bölüm 1.5 + 2.1; her biri OBSERVED/INFERRED etiketli                                                                                              |
| 5   | Güncel alternatifler araştırıldı mı?             | ✅        | Bölüm 2.1 — 11 teknolojinin Ağustos 2026 durumu doğrulandı                                                                                        |
| 6   | Körü körüne uygulama varsayımından kaçınıldı mı? | ✅        | Marquee'nin sabit CSS animasyonu **olmadığı** ölçümle kanıtlandı; yıldızların twinkle **etmediği** ölçüldü; font'un sistem fontu olduğu çıkarıldı |
| 7   | Mobil davranış tasarlandı mı?                    | ✅        | Bölüm 10 + Faz 10; "küçültme değil yeniden tasarım" ilkesi                                                                                        |
| 8   | Performans sınırları tanımlandı mı?              | ✅        | Bölüm 7 — 14 satırlık bütçe + 7 satırlık zarif düşüş tablosu                                                                                      |
| 9   | Erişilebilirlik tanımlandı mı?                   | ✅        | Bölüm 8 + Faz 12; WCAG 2.2 AA hedefi, 0 axe ihlali zorunlu                                                                                        |
| 10  | Test tanımlandı mı?                              | ✅        | Bölüm 13 — 8 test katmanı + determinizm kuralı                                                                                                    |
| 11  | CI/CD tanımlandı mı?                             | ✅        | Bölüm 14 — 12 adımlı pipeline                                                                                                                     |
| 12  | Deployment tanımlandı mı?                        | ✅        | Vercel preview/production + doğrulama adımı + rollback                                                                                            |
| 13  | Asset gereksinimleri tanımlandı mı?              | ✅        | Bölüm 11 — 10 kategori × 6 özellik                                                                                                                |
| 14  | İçerik mimarisi tanımlandı mı?                   | ✅        | Bölüm 12 — Zod şeması + testimonial etik politikası                                                                                               |
| 15  | SEO tanımlandı mı?                               | ✅        | Bölüm 9 + Faz 12                                                                                                                                  |
| 16  | Rollback tanımlandı mı?                          | ✅        | Her fazda "Rollback Strategy" bölümü                                                                                                              |
| 17  | Scope creep engellendi mi?                       | ✅        | Bölüm 5'te eklenmeyen sayfalar gerekçeli listelendi; WebGL, GSAP ve Lenis **açıkça reddedildi**; blog ayrı faz olarak ertelendi                   |
| 18  | Gerçekçi bağımlılık grafiği var mı?              | ✅        | Bölüm 15 — kritik yol + paralelleştirilebilir fazlar                                                                                              |

### Denetimde bulunan ve düzeltilen boşluklar

1. **Marquee hızını başta "sabit CSS animasyonu" varsaymıştım.** Kare kare ölçüm bunu
   çürüttü (sönümlü hız profili). Bölüm 1.4 yeniden yazıldı ve Faz 6'nın kabul kriteri buna bağlandı.
2. **Faz sıralaması hatalıydı.** Prompt'un taslağında arka plan (WebGL) Faz 6'daydı; ama tüm
   bölümler onun üstüne kompoze oluyor. Faz 5'e alındı ve gerekçesi Bölüm 15'e yazıldı.
3. **Testimonial bölümü etik boşluk taşıyordu.** Referansta 4 müşteri yorumu var; körü körüne
   kopyalamak uydurma sosyal kanıt üretmek olurdu. Bölüm 12'ye kalıcı politika, Faz 9'a kabul
   kriteri, `WORKING_DISCIPLINE.md`'ye kural eklendi.
4. **Kimlik boşluğu göz ardı edilmişti.** Referans içeriği başka bir kişiye ait. Bölüm 18'de
   "Açık Girdiler" listesi eklendi ve Faz 7/8/9'un içerik bağımlılığı açıkça yazıldı.
5. **WCAG 2.2.2 (Pause, Stop, Hide) ihlali riski.** Otomatik hareket eden marquee için
   duraklat kontrolü zorunlu hale getirildi (Faz 6).
6. **Görsel testlerin flaky olma riski** (animasyonlu arka plan). Determinizm kuralı
   (seed + animasyon dondurma) Bölüm 13'e ve Faz 5'in DoD'sine eklendi.
7. **Türkçe glif riski.** Geist'in Latin Extended kapsadığı doğrulandı, ama gliflerin görsel
   doğrulaması Faz 1 görev 20'ye ve fallback kararı risk tablosuna eklendi.

---

## 18. AÇIK GİRDİLER — SİZDEN GEREKENLER

Faz 1 bunların **hiçbirini beklemez** (altyapı fazıdır). Ama Faz 2'den itibaren gerekli olurlar.
Şimdi cevaplarsanız hiç beklemeden ilerleriz.

| #   | Girdi                                                                                      | Ne zaman gerekli            | Cevap verilmezse ne olur                                                        |
| --- | ------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------- |
| 1   | **Ad-soyad, ünvan, konum, e-posta, sosyal hesaplar**                                       | Faz 1 (sayfa metni) / Faz 2 | Placeholder ile ilerlenir, sonra tek dosyada güncellenir                        |
| 2   | **GitHub repo adı** ve deponun `emredogan-cloud` hesabında açılmasının uygun olup olmadığı | Faz 1, ilk görev            | Faz 1 başlayamaz — **tek gerçek blokaj**                                        |
| 3   | **Site dili**: yalnızca İngilizce / yalnızca Türkçe / iki dilli                            | Faz 2                       | Varsayılan: İngilizce içerik + `lang="en"`; iki dillilik sonradan ayrı faz olur |
| 4   | **Domain** (varsa)                                                                         | Faz 14                      | `*.vercel.app` ile canlıya çıkılır                                              |
| 5   | **Portre / hero görseli**                                                                  | Faz 4                       | Tipografik hero alternatifi kurulur (görselsiz de güçlü çalışır)                |
| 6   | **Gerçek proje listesi** (isim, açıklama, stack, link, ekran görüntüsü)                    | Faz 7                       | Yapı placeholder ile kurulur, içerik sonra doldurulur                           |
| 7   | **Deneyim / eğitim bilgileri + CV PDF**                                                    | Faz 8                       | `/about` iskelet kalır                                                          |
| 8   | **Gerçek müşteri yorumu var mı?** (izinli)                                                 | Faz 9                       | Testimonial bölümü **render edilmez**; yerine dürüst alternatif konur           |
| 9   | **İletişim formu e-posta sağlayıcısı** (Resend hesabı)                                     | Faz 9                       | Form yerine `mailto:` kullanılır                                                |
| 10  | **Analytics tercihi** (Vercel Analytics / Plausible / hiçbiri)                             | Faz 14                      | Hiçbiri kurulmaz (gizlilik varsayılanı)                                         |

---

## 19. DEĞİŞİKLİK KONTROLÜ

| Değişiklik türü                                                           | Prosedür                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Onaylanmış faz içinde küçük uygulama kararı                               | **Otonom** — yapılır, faz raporunda belirtilir              |
| Büyük mimari değişiklik (framework, render stratejisi, animasyon runtime) | **Dur ve raporla** — onay beklenir                          |
| Yeni büyük özellik (blog, i18n, CMS, WebGL katmanı)                       | **Dur ve roadmap güncellemesi öner**                        |
| Temel görsel yönün değişmesi (palet, tipografi, arka plan konsepti)       | **Dur ve onay iste**                                        |
| Deployment mimarisi değişikliği (Vercel dışına çıkış, farklı CI)          | **Dur ve onay iste**                                        |
| Referans davranışından bilinçli sapma                                     | Yapılır ama **`docs/DECISIONS.md`'ye gerekçesiyle yazılır** |

---

## 20. DOKÜMAN DURUMU

- **Faz 0:** ✅ Tamamlandı (2026-08-18)
- **Faz 1:** ⏸ **Açık onay bekleniyor**
- Faz 2–14: Planlandı, başlamadı

Bu doküman canlı bir belgedir. Her faz sonunda güncellenir; ölçümler değişirse OBSERVED
değerleri düzeltilir (uydurulmaz).
