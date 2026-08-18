# WORKING_DISCIPLINE.md

## Projenin Kalıcı Çalışma Sözleşmesi

> **Bu doküman bağlayıcıdır.**
> Her faz **bu dosyayı okuyarak başlar** ve **bu dosyaya karşı doğrulanarak biter**.
> Kurallar yalnızca açık kullanıcı onayıyla değiştirilebilir.

**Proje:** Kişisel portfolyo web sitesi
**Referans:** `Web-ste.webm` · **Analiz:** `PERSONAL_WEBSITE_EXECUTION_ROADMAP.md` Bölüm 1
**Oluşturuldu:** 2026-08-18

---

## 0. FAZ RİTÜELİ

Her fazın başında ve sonunda aşağıdaki ritüel **atlanmadan** uygulanır.

**Faz başlangıcı**

1. `WORKING_DISCIPLINE.md`'yi oku.
2. Roadmap'te ilgili fazın tüm şablon bölümlerini oku.
3. Ön koşul fazların "Definition of Done"unun işaretli olduğunu doğrula.
4. Bu fazın kapsamını yaz; kapsam dışını açıkça listele.

**Faz bitişi**

1. "Definition of Done" listesini **tek tek** işaretle — her madde için kanıt sun.
2. CI'ı çalıştır ve yeşil olduğunu doğrula (run URL'i paylaş).
3. Deployment'ı aç ve gerçekten çalıştığını doğrula (URL paylaş).
4. Dokümantasyonu güncelle.
5. `git status` temiz olsun.
6. Bir sonraki fazın ön koşullarını ve varsa açık girdileri raporla.

---

## 1. DOĞRULUK VE DÜRÜSTLÜK

**1.1 Test sonucu uydurulmaz.**
Bir testin geçtiği yalnızca gerçekten çalıştırıldıysa söylenir. "Geçmesi gerekir",
"muhtemelen çalışıyor" kabul edilmez. Çıktı paylaşılır.

**1.2 Test edilmeden "tamamlandı" denmez.**
Bir özellik; yerelde çalıştırılmadan, testleri yazılmadan ve CI'da doğrulanmadan
tamamlanmış sayılmaz.

**1.3 Ölçüm uydurulmaz.**
Performans, kontrast, bundle boyutu, kare hızı gibi tüm sayılar gerçek ölçümden gelir.
Ölçüm yapılmadıysa "ölçülmedi" denir.

**1.4 Referans analizi çarpıtılmaz.**
`PERSONAL_WEBSITE_EXECUTION_ROADMAP.md` Bölüm 1'deki OBSERVED değerler ölçümdür.
Yeni ölçüm eskisiyle çelişirse **doküman düzeltilir**, uydurulmaz.
OBSERVED / INFERRED / UNKNOWN etiketleri korunur; INFERRED bir şey OBSERVED'a terfi ettirilmez.

**1.5 Kısmi başarı kısmi olarak raporlanır.**
Bir fazın %80'i bittiyse "%80 bitti, şunlar eksik" denir; "bitti" denmez.

**1.6 Uydurma içerik yasaktır.**
Özellikle: **müşteri yorumları, metrikler, proje sonuçları, deneyim yılı, müşteri isimleri.**
Gerçek veri yoksa alan boş bırakılır, bölüm render edilmez ve durum kullanıcıya raporlanır.
Referans sitedeki içerik **başka bir kişiye aittir** ve hiçbir koşulda kopyalanmaz.

---

## 2. CI VE KALİTE KAPILARI

**2.1 CI yeşil kalmak zorundadır.** Kırmızı CI ile faz kapatılamaz, merge yapılamaz.

**2.2 Kalite kapıları atlanamaz.** `--no-verify`, `skip`, `.only`, `xit`, `test.skip`
kalıcı olarak kullanılamaz. Geçici kullanılırsa aynı PR'da kaldırılır.

**2.3 Tarayıcı testleri zorunludur.** Görsel/etkileşimli her değişiklik Playwright ile
en az Chromium'da doğrulanır; faz sonunda üç motorda çalıştırılır.

**2.4 Erişilebilirlik testi zorunludur.** axe her PR'da çalışır. **0 ihlal** hedeftir;
ihlal kabul edilmez.

**2.5 Görsel regresyon snapshot'ı körlemesine güncellenmez.** Her snapshot güncellemesi
PR açıklamasında gerekçelendirilir ("neden değişti, beklenen bir değişiklik mi").

**2.6 Lint uyarısı hata sayılır.** `--max-warnings=0`.

**2.7 Type hatası bastırılmaz.** `any`, `@ts-ignore`, `@ts-expect-error` yalnızca
yorumla gerekçelendirilmiş, dar kapsamlı ve geçici olabilir.

---

## 3. GÜVENLİK

**3.1 Secret asla commit edilmez.** API anahtarı, token, kişisel veri repoda bulunmaz.
`.env.example` şablon olarak tutulur. `gitleaks` pre-commit ve CI'da çalışır.

**3.2 Secret'lar yalnızca** GitHub Secrets ve Vercel Environment Variables'da yaşar.

**3.3 Yeni bağımlılık gerekçelendirilir.** Eklenmeden önce: neden gerekli, alternatifi ne,
bundle maliyeti kaç KB, bakım durumu nasıl, lisansı ne. Cevaplar PR'a yazılır.

**3.4 Bağımlılıklar sorumlu şekilde güncel tutulur.** Renovate/Dependabot açık; major
güncellemeler ayrı PR'da ve testlerle doğrulanarak alınır.

**3.5 Kullanıcı girdisi güvenilmezdir.** Form girdileri sunucu tarafında Zod ile doğrulanır;
rate limit ve honeypot uygulanır.

---

## 4. MİMARİ VE KAPSAM

**4.1 Mimari sessizce değiştirilmez.** Framework, render stratejisi, animasyon runtime'ı,
state yönetimi veya dizin yapısında büyük değişiklik → **dur, raporla, onay bekle**.

**4.2 Kapsam sessizce genişletilmez.** Onaylanmış fazın dışında iş yapılmaz.
Yeni fikir ortaya çıkarsa roadmap'e "backlog" olarak yazılır, uygulanmaz.

**4.3 Kapsam sessizce daraltılmaz.** Bir görev yapılamıyorsa atlanmaz; **açıkça raporlanır**.

**4.4 Reddedilmiş teknolojiler tekrar gündeme getirilmez** (gerekçeli yeni kanıt olmadan).
Bu projede v1 için açıkça reddedilenler:

- **WebGL / Three.js / R3F** — referansta 3D yok; Canvas 2D bütçeyi karşılıyor
- **GSAP** — Motion ile örtüşüyor; ikinci runtime bundle ve zihinsel yük
- **Lenis** — INP riski; referans zaten native scroll kullanıyor
- **Storybook** — bakım maliyeti; yerine `/dev/tokens` route'u
  Yeniden değerlendirme yalnızca ölçülmüş bir ihtiyaç ortaya çıkarsa ve onayla yapılır.

**4.5 Referans davranışından sapma dokümante edilir.**
Referanstaki bir davranış değiştiriliyor veya çıkarılıyorsa, gerekçe `docs/DECISIONS.md`'ye
yazılır. Sessiz sapma yasaktır.

---

## 5. TASARIM VE MOTION

**5.1 Ham tasarım değeri yazılmaz.** Bileşenlerde ham hex, px, ms, easing eğrisi bulunmaz.
Hepsi `styles/tokens.css` ve `lib/motion/tokens.ts` üzerinden gelir.

**5.2 Her görsel efektin ölçülebilir amacı olmalıdır.**
Bir efekt eklenirken "bu ne işe yarıyor?" sorusu yanıtlanır (dikkat yönlendirme, durum geri
bildirimi, hiyerarşi, keşfedilebilirlik...). Yanıtı yoksa efekt eklenmez.
Amacı olmayan mevcut efekt silinir.

**5.3 Sanatsal kimlik korunur.** Şu öğeler projenin imzasıdır ve onaysız değiştirilmez:
derin uzay siyahı zemin · mavi→siyan gradyan · iki renkli bölüm başlıkları · meteor yağmuru ·
yüzen nav adası · cam yüzeyler.

**5.4 Hareket asla bilgiyi gizlemez.** Animasyon bitmeden içerik okunamıyorsa tasarım yanlıştır.
Tüm içerik DOM'da her zaman mevcuttur; animasyon yalnızca sunumu etkiler.

---

## 6. ERİŞİLEBİLİRLİK — PAZARLIK KONUSU DEĞİL

**6.1 Erişilebilirlik görsel efekt için feda edilmez.** Çatışma varsa erişilebilirlik kazanır.

**6.2 Her etkileşimli öğe klavyeyle kullanılabilir olmalıdır.** İstisna yok.

**6.3 Odak her zaman görünür olmalıdır.** Odak halkası hiçbir yüzeyde kaybolmaz.

**6.4 `prefers-reduced-motion` her fazda doğrulanır.** Yeni bir animasyon eklendiğinde
reduced-motion davranışı **aynı PR'da** yazılır ve test edilir.

**6.5 Otomatik hareket eden içerik duraklatılabilir olmalıdır** (WCAG 2.2.2).
Marquee ve carousel için görünür duraklat kontrolü zorunludur.

**6.6 Kontrast animasyonlu arka plan üzerinde de sağlanır.** Gerekirse scrim eklenir.

**6.7 Alt metinler anlamlıdır.** Dekoratif görsel `alt=""`; anlamlı görsel açıklayıcı `alt`.

---

## 7. PERFORMANS

**7.1 Performans gereksiz efekt için feda edilmez.** Bütçeyi aşan efekt ya optimize edilir
ya da kaldırılır.

**7.2 Performans bütçesi CI'da zorunludur.** Roadmap Bölüm 7'deki tablo geçerlidir.
Bütçe aşımı = kırmızı build.

**7.3 Ölçmeden optimize edilmez.** Önce trace/rapor, sonra değişiklik, sonra tekrar ölçüm.
Her iyileştirme önce/sonra sayısıyla raporlanır.

**7.4 Animasyonlar yalnızca `transform` ve `opacity` kullanır.**
Layout tetikleyen özellikler animasyonda kullanılmaz. rAF içinde layout okuma yasak.

**7.5 Düşük güçlü cihaz birinci sınıf vatandaştır.** Her görsel özellik için düşük profil
davranışı tanımlanır.

---

## 8. MOBİL

**8.1 Mobil davranış her fazda doğrulanır.** "Sonra bakarız" yok.

**8.2 Mobil küçültülmüş masaüstü değildir.** Etkileşimler yeniden tasarlanır
(hover → dokunma, parallax → statik, kesik carousel → snap slider).

**8.3 Yatay taşma yasaktır.** Otomatik testle korunur.

**8.4 Dokunma hedefleri ≥ 44×44 px.**

**8.5 Yalnızca hover ile erişilen bilgi olamaz.**

---

## 9. İÇERİK

**9.1 İçerik UI bileşenlerine gömülmez.** Tüm portfolyo içeriği `content/` altında yaşar
ve Zod ile doğrulanır. Şema ihlali build'i kırar.

**9.2 Sahibi içeriği tek dosyadan güncelleyebilmelidir.** Yeni proje eklemek JSX düzenlemesi
gerektirmez.

**9.3 Telifi belirsiz asset kullanılmaz.** Referans videodaki görseller başkasına aittir
ve kullanılmaz.

**9.4 Sahte sosyal kanıt üretilmez** (bkz. 1.6).

---

## 10. GIT VE TESLİM

**10.1 Küçük, odaklı commit'ler.** Bir commit bir işi yapar.

**10.2 Commit mesajları anlamlıdır** (Conventional Commits: `feat:`, `fix:`, `chore:`,
`docs:`, `test:`, `perf:`, `a11y:`, `refactor:`).

**10.3 `main` her zaman deploy edilebilir olmalıdır.** Yarım iş `main`'e girmez.

**10.4 Faz sonunda `git status` temizdir.** Takip edilmeyen artefakt bırakılmaz.

**10.5 Production her tamamlanan fazdan sonra deploy edilebilir durumda kalır.**

**10.6 Geri alma yolu her zaman açıktır.** Her fazın rollback stratejisi tanımlı ve
uygulanabilir olmalıdır.

---

## 11. DOKÜMANTASYON

**11.1 Dokümantasyon kodla senkron tutulur.** Davranış değişirse aynı PR'da doküman güncellenir.

**11.2 Referans analizi erişilebilir kalır.** `PERSONAL_WEBSITE_EXECUTION_ROADMAP.md` Bölüm 1
silinmez, taşınmaz; ölçüm değişirse güncellenir.

**11.3 Kararlar kaydedilir.** Mimari ve tasarım kararları `docs/DECISIONS.md`'ye
"karar / bağlam / alternatifler / sonuç" formatında yazılır.

**11.4 Operasyon dokümante edilir.** `docs/RUNBOOK.md`: deploy, rollback, secret rotasyonu,
domain, izleme.

---

## 12. İLETİŞİM

**12.1 Belirsizlik varsa doğru zamanda sorulur.** Cevaba bağlı olmayan işler önce bitirilir;
soru tıkanma noktasında sorulur.

**12.2 Kötü haber erken verilir.** Bir hedef tutmayacaksa faz sonunda değil, fark edildiğinde
söylenir.

**12.3 Raporlar kanıtlıdır.** URL, komut çıktısı, ölçüm sayısı olmadan "tamam" denmez.

**12.4 Değişiklik kontrolü tablosuna uyulur** (Roadmap Bölüm 19).

---

## 13. HIZLI KONTROL LİSTESİ (her PR öncesi)

- [ ] `pnpm lint` → 0 uyarı
- [ ] `pnpm typecheck` → 0 hata
- [ ] `pnpm test` → geçiyor
- [ ] `pnpm build` → başarılı
- [ ] `pnpm e2e` → geçiyor
- [ ] axe → 0 ihlal
- [ ] Visual regression → yeşil (veya gerekçeli güncelleme)
- [ ] Performans bütçesi → içinde
- [ ] `prefers-reduced-motion` → doğrulandı
- [ ] Mobil viewport → doğrulandı
- [ ] Klavye navigasyonu → doğrulandı
- [ ] Secret yok, `.env` commit'lenmedi
- [ ] Doküman güncel
- [ ] `git status` temiz

---

## 14. SÖZLEŞMENİN ÖZETİ — 12 KURAL

1. CI yeşil kalır.
2. Tarayıcı testleri zorunludur.
3. Test edilmeden "tamamlandı" denmez.
4. Test sonucu ve ölçüm uydurulmaz.
5. Secret commit edilmez.
6. Mimari sessizce değiştirilmez.
7. Kapsam sessizce genişletilmez veya daraltılmaz.
8. Referans davranışından sapma gerekçesiyle dokümante edilir.
9. Erişilebilirlik görsel efekt için feda edilmez.
10. Performans gereksiz efekt için feda edilmez.
11. Her görsel efektin ölçülebilir bir amacı olmalıdır.
12. Production her tamamlanan fazdan sonra deploy edilebilir kalır.
