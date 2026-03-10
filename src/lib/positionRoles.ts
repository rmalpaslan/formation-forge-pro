/** Complete position roles from Futbol Rolleri Veritabanı */

interface RoleEntry {
  tr: string;
  en: string;
  descTr: string;
  descEn: string;
}

export const positionRolesMap: Record<string, RoleEntry[]> = {
  GK: [
    { tr: 'Kaleci', en: 'Goalkeeper', descTr: 'Top dağıtımında farklı yöntemler kullanır, kalede durmanın yanında top alıp oyun kurmaya da katkı verir.', descEn: 'Uses various distribution methods, contributes to build-up play besides shot-stopping.' },
    { tr: 'Çizgi Koruyan Kaleci', en: 'Line-Holding Keeper', descTr: 'Kendi ceza sahasında kalır, savunmayı ileri baskıdan koruma görevini savunma oyuncularına bırakır.', descEn: 'Stays in his box, leaves defending high lines to the defenders.' },
    { tr: 'Pratik Kaleci', en: 'No-Nonsense GK', descTr: 'Kalesinde risksiz oynar, top ayağında iken minimum riske girer.', descEn: 'Plays without risk, takes minimum risks when the ball is at his feet.' },
    { tr: 'Süpürücü Kaleci', en: 'Sweeper Keeper', descTr: 'Proaktif kaleci, çizgisinden çıkarak rakip paslarını keser ve hücumculara erken müdahale eder.', descEn: 'Proactive keeper, comes off his line to intercept passes and intervene early.' },
    { tr: 'Top Kullanan Kaleci', en: 'Ball Playing GK', descTr: 'Takımın yapı kurma oyununda aktif rol alır, kaleden çıkarak top alır.', descEn: 'Takes an active role in build-up, comes out of the goal to receive.' },
  ],
  CB: [
    { tr: 'Stoper', en: 'Centre-Back', descTr: 'Takımı korur, top kaybında hücum tehlikelerine hazırdır.', descEn: 'Protects the team, ready for threats on turnover.' },
    { tr: 'Pratik Stoper', en: 'No-Nonsense CB', descTr: 'Topu tehlikeli bölgelerde riske atmaz, basit ve güvenli oynar.', descEn: 'Doesn\'t risk the ball in dangerous areas, plays simple and safe.' },
    { tr: 'Koruyucu Stoper', en: 'Covering CB', descTr: 'Daha temkinli oynar, çizgiyi korur ve rakip hücumculara reaksiyon verir.', descEn: 'Plays more cautiously, holds the line and reacts to attackers.' },
    { tr: 'Markajcı Stoper', en: 'Stopping CB', descTr: 'Rakip hücumculara baskı yapar, pozisyonunu terk ederek top kesmeye çalışır.', descEn: 'Presses attackers, leaves position to intercept the ball.' },
    { tr: 'Top Kullanabilen Stoper', en: 'Ball Playing CB', descTr: 'Derin bölgede hat kıran paslar atar, topu ileri sürer.', descEn: 'Plays line-breaking passes from deep, carries the ball forward.' },
    { tr: 'Bindirmeci Stoper', en: 'Overlapping CB', descTr: 'Hücumda bindirmeler yaparak son üçüncü bölgede tehlike yaratır.', descEn: 'Creates threat in the final third by making overlapping runs.' },
    { tr: 'İleri Çıkan Stoper', en: 'Advanced CB', descTr: 'Derin yapılandırmada klasik stoper gibi oynar, ardından ön liberoya çıkar.', descEn: 'Plays as a classic CB in build-up, then steps up to DM.' },
    { tr: 'Geniş Stoper', en: 'Wide CB', descTr: 'Takımı korur, hücumda geniş alan sunar.', descEn: 'Provides width in attack, supports forward players.' },
    { tr: 'Markajcı Geniş Stoper', en: 'Stopping Wide CB', descTr: 'Rakip hücumculara baskı yaparak top kesmeye çalışır.', descEn: 'Presses attackers in wide areas to intercept the ball.' },
  ],
  RB: [
    { tr: 'Bek', en: 'Full-Back', descTr: 'Hem savunma hem hücuma destek olur, kanattan bindirmeler yapar.', descEn: 'Supports both defense and attack, makes overlapping runs.' },
    { tr: 'Tutucu Bek', en: 'Holding FB', descTr: 'Takım hücum yaparken geride kalır, savunmaya ek destek verir.', descEn: 'Stays back during attack to provide extra defensive cover.' },
    { tr: 'İçeri Kat Eden Bek', en: 'Inside FB', descTr: 'Hücumda içe kalarak ekstra stoper gibi oynar.', descEn: 'Tucks inside in attack to play like an extra centre-back.' },
    { tr: 'Ters Bek', en: 'Inverted FB', descTr: 'Hücumda içe katılarak ekstra stoper gibi oynar.', descEn: 'Tucks inside in attack to play like an extra centre-back.' },
    { tr: 'Pres Yapan Bek', en: 'Pressing FB', descTr: 'Rakip kanat oyuncularına pres yapar, ileri çıkarak destek sağlar.', descEn: 'Presses wingers, moves forward to provide support.' },
  ],
  LB: [
    { tr: 'Bek', en: 'Full-Back', descTr: 'Hem savunma hem hücuma destek olur, kanattan bindirmeler yapar.', descEn: 'Supports both defense and attack, makes overlapping runs.' },
    { tr: 'Tutucu Bek', en: 'Holding FB', descTr: 'Takım hücum yaparken geride kalır, savunmaya ek destek verir.', descEn: 'Stays back during attack to provide extra defensive cover.' },
    { tr: 'İçeri Kat Eden Bek', en: 'Inside FB', descTr: 'Hücumda içe kalarak ekstra stoper gibi oynar.', descEn: 'Tucks inside in attack to play like an extra centre-back.' },
    { tr: 'Ters Bek', en: 'Inverted FB', descTr: 'Hücumda içe katılarak ekstra stoper gibi oynar.', descEn: 'Tucks inside in attack to play like an extra centre-back.' },
    { tr: 'Pres Yapan Bek', en: 'Pressing FB', descTr: 'Rakip kanat oyuncularına pres yapar, ileri çıkarak destek sağlar.', descEn: 'Presses wingers, moves forward to provide support.' },
  ],
  RWB: [
    { tr: 'Kanat Bek', en: 'Wing-Back', descTr: 'Bek ve kanat oyuncusu özelliklerini birleştirir, genişlik sağlar.', descEn: 'Combines full-back and winger traits, provides width.' },
    { tr: 'Tutucu Kanat Bek', en: 'Holding WB', descTr: 'Hücumda daha geride kalır, savunmaya destek olur.', descEn: 'Stays further back during attack, focuses on defensive stability.' },
    { tr: 'İçeri Kat Eden Kanat Bek', en: 'Inside WB', descTr: 'Top ilerledikçe merkeze katılır, pas yollarını destekler.', descEn: 'Moves central as play progresses, supports passing lanes.' },
    { tr: 'Ters Kanat Bek', en: 'Inverted WB', descTr: 'Merkeze katılarak pas trafiğini destekler.', descEn: 'Moves into central midfield to support pass circulation.' },
    { tr: 'Pres Yapan Kanat Bek', en: 'Pressing WB', descTr: 'Rakip kanat oyuncularına agresif pres yapar.', descEn: 'Aggressively presses opponent wingers, provides forward support.' },
    { tr: 'Oyun Kurucu Kanat Bek', en: 'Playmaking WB', descTr: 'Merkeze katılarak oyun kurar, riskli paslar ve orta yapar.', descEn: 'Moves inside to playmaker, makes risky passes and crosses.' },
    { tr: 'İleri Kanat Bek', en: 'Advanced WB', descTr: 'Daha agresif konumlanır, çok geniş orta saha gibi pozisyon alır.', descEn: 'Positions aggressively, acts like a very wide midfielder.' },
  ],
  LWB: [
    { tr: 'Kanat Bek', en: 'Wing-Back', descTr: 'Bek ve kanat oyuncusu özelliklerini birleştirir, genişlik sağlar.', descEn: 'Combines full-back and winger traits, provides width.' },
    { tr: 'Tutucu Kanat Bek', en: 'Holding WB', descTr: 'Hücumda daha geride kalır, savunmaya destek olur.', descEn: 'Stays further back during attack, focuses on defensive stability.' },
    { tr: 'İçeri Kat Eden Kanat Bek', en: 'Inside WB', descTr: 'Top ilerledikçe merkeze katılır, pas yollarını destekler.', descEn: 'Moves central as play progresses, supports passing lanes.' },
    { tr: 'Ters Kanat Bek', en: 'Inverted WB', descTr: 'Merkeze katılarak pas trafiğini destekler.', descEn: 'Moves into central midfield to support pass circulation.' },
    { tr: 'Pres Yapan Kanat Bek', en: 'Pressing WB', descTr: 'Rakip kanat oyuncularına agresif pres yapar.', descEn: 'Aggressively presses opponent wingers, provides forward support.' },
    { tr: 'Oyun Kurucu Kanat Bek', en: 'Playmaking WB', descTr: 'Merkeze katılarak oyun kurar, riskli paslar ve orta yapar.', descEn: 'Moves inside to playmaker, makes risky passes and crosses.' },
    { tr: 'İleri Kanat Bek', en: 'Advanced WB', descTr: 'Daha agresif konumlanır, çok geniş orta saha gibi pozisyon alır.', descEn: 'Positions aggressively, acts like a very wide midfielder.' },
  ],
  CDM: [
    { tr: 'Defansif Orta Saha', en: 'Defensive Midfielder', descTr: 'Savunmanın önünde pozisyon alır, basit paslarla oyunu ilerletir.', descEn: 'Positions in front of the defense, moves the play with simple passes.' },
    { tr: 'Geri Çekilen Defansif OS', en: 'Dropping DM', descTr: 'Kendi sahasında baskı altındayken savunma hattına katılarak destek olur.', descEn: 'Drops into the defensive line to aid build-up and stability.' },
    { tr: 'Defansif OS Koruyucu', en: 'Screening DM', descTr: 'Defans önünde pozisyon alır, baskı yapmaz, bölgeyi korur ve pas yollarını kapatır.', descEn: 'Holds position in front of defense, blocks passing lanes.' },
    { tr: 'Geniş Koruyucu Defansif OS', en: 'Wide Covering DM', descTr: 'Savunmayı geniş alanlarda destekler.', descEn: 'Supports defense in wide areas, aids on the flanks.' },
    { tr: 'Yarım Savunma', en: 'Half-Back', descTr: 'Savunma hattına iner, oyun kurmaya ve defansif istikrara destek olur.', descEn: 'Drops into the defensive line to aid build-up and stability.' },
    { tr: 'Pres Yapan Defansif OS', en: 'Pressing DM', descTr: 'Rakip baskısında ileri çıkarak pres yapar.', descEn: 'Steps up to press when the opponent is in possession.' },
    { tr: 'Geri Çekilen Oyun Kurucu', en: 'Deep-Lying Playmaker', descTr: 'Savunma ile orta saha arasında yaratıcı rol oynar, derinden hücumu başlatır.', descEn: 'Creative role between defense and midfield, initiates attacks.' },
  ],
  DM: [
    { tr: 'Defansif Orta Saha', en: 'Defensive Midfielder', descTr: 'Savunmanın önünde pozisyon alır, basit paslarla oyunu ilerletir.', descEn: 'Positions in front of the defense, moves the play with simple passes.' },
    { tr: 'Geri Çekilen Defansif OS', en: 'Dropping DM', descTr: 'Kendi sahasında baskı altındayken savunma hattına katılarak destek olur.', descEn: 'Drops into the defensive line to aid build-up and stability.' },
    { tr: 'Defansif OS Koruyucu', en: 'Screening DM', descTr: 'Defans önünde pozisyon alır, baskı yapmaz, bölgeyi korur ve pas yollarını kapatır.', descEn: 'Holds position in front of defense, blocks passing lanes.' },
    { tr: 'Geniş Koruyucu Defansif OS', en: 'Wide Covering DM', descTr: 'Savunmayı geniş alanlarda destekler.', descEn: 'Supports defense in wide areas, aids on the flanks.' },
    { tr: 'Yarım Savunma', en: 'Half-Back', descTr: 'Savunma hattına iner, oyun kurmaya ve defansif istikrara destek olur.', descEn: 'Drops into the defensive line to aid build-up and stability.' },
    { tr: 'Pres Yapan Defansif OS', en: 'Pressing DM', descTr: 'Rakip baskısında ileri çıkarak pres yapar.', descEn: 'Steps up to press when the opponent is in possession.' },
    { tr: 'Geri Çekilen Oyun Kurucu', en: 'Deep-Lying Playmaker', descTr: 'Savunma ile orta saha arasında yaratıcı rol oynar, derinden hücumu başlatır.', descEn: 'Creative role between defense and midfield, initiates attacks.' },
  ],
  CM: [
    { tr: 'Merkez Orta Saha', en: 'Central Midfielder', descTr: 'Savunma ve hücum arasında çok yönlü ve çalışkan bağlantı sağlar.', descEn: 'Provides versatile and hard-working link between defense and attack.' },
    { tr: 'Orta Saha Koruyucu', en: 'Screening CM', descTr: 'Pozisyonunu çok fazla terk etmeden pas yollarını keser, orta sahayı korur.', descEn: 'Holds position to block passing lanes and protect the midfield.' },
    { tr: 'Geniş Koruyucu Merkez OS', en: 'Wide Covering CM', descTr: 'Savunmayı geniş alanlarda destekler.', descEn: 'Supports defense in wide areas, aids on the flanks.' },
    { tr: 'Orta Sahada Koşan', en: 'Box-to-Box Midfielder', descTr: 'Durmaksızın koşan, hem yapı kurmaya hem de hücuma destek verir.', descEn: 'Constant runner, supports both build-up and attack.' },
    { tr: 'Gezen Oyun Kurucu', en: 'Box-to-Box Playmaker', descTr: 'Hem derin hem ileri bölgelerde yaratıcı rol üstlenir, oyunu kurar.', descEn: 'Creative role in both deep and advanced areas, builds the play.' },
    { tr: 'Serbest Orta Saha', en: 'Channel Midfielder', descTr: 'Geniş alanlarda koşular yapar, kanat hücumlarına destek verir.', descEn: 'Makes runs in wide areas, supports wing attacks.' },
    { tr: 'Orta Saha Oyun Kurucu', en: 'Midfield Playmaker', descTr: 'Savunma ile hücum arasında yaratıcı paslar atar, oyunu kurar.', descEn: 'Plays creative passes between defense and attack.' },
    { tr: 'Pres Yapan Orta Saha', en: 'Pressing CM', descTr: 'Rakip baskısında ileri çıkarak pres yapar.', descEn: 'Steps up to press when the opponent is in possession.' },
  ],
  CAM: [
    { tr: 'Ofansif Orta Saha', en: 'Attacking Midfielder', descTr: 'Savunma ve orta saha hattı arasında oynar, gol şansı yaratmaya çalışır.', descEn: 'Plays between lines to create goal-scoring opportunities.' },
    { tr: 'Defansif Takipçi Ofansif OS', en: 'Tracking AM', descTr: 'Rakip hücumda defansa destek için geriye döner.', descEn: 'Drops back to support the defense during opponent attacks.' },
    { tr: 'İleri Oyun Kurucu', en: 'Advanced Playmaker', descTr: 'Yüksek bölgede oynayarak pas almaya çalışır, kilit anahtar paslar atar.', descEn: 'Looks to receive in high areas, makes key through balls.' },
    { tr: 'Merkezi Bekleyen Ofansif OS', en: 'Central Outlet AM', descTr: 'Defansa çok dönmez, pozisyonunu korur, kontra ataklarda hazır bekler.', descEn: 'Stays forward to be an outlet during counter-attacks.' },
    { tr: 'Yanlara Açılan Ofansif OS', en: 'Splitting Outlet AM', descTr: 'Yüksek pozisyonda kalır, hücum ilerledikçe kanallara kayar.', descEn: 'Stays high and drifts into channels as the attack progresses.' },
    { tr: 'Serbest Rol', en: 'Free Role', descTr: 'Tam yaratıcılık ve özgürlükle oynar, pozisyonuna bağlı kalmaz.', descEn: 'Plays with total creative freedom, not restricted by position.' },
  ],
  AM: [
    { tr: 'Ofansif Orta Saha', en: 'Attacking Midfielder', descTr: 'Savunma ve orta saha hattı arasında oynar, gol şansı yaratmaya çalışır.', descEn: 'Plays between lines to create goal-scoring opportunities.' },
    { tr: 'Defansif Takipçi Ofansif OS', en: 'Tracking AM', descTr: 'Rakip hücumda defansa destek için geriye döner.', descEn: 'Drops back to support the defense during opponent attacks.' },
    { tr: 'İleri Oyun Kurucu', en: 'Advanced Playmaker', descTr: 'Yüksek bölgede oynayarak pas almaya çalışır, kilit anahtar paslar atar.', descEn: 'Looks to receive in high areas, makes key through balls.' },
    { tr: 'Serbest Rol', en: 'Free Role', descTr: 'Tam yaratıcılık ve özgürlükle oynar, pozisyonuna bağlı kalmaz.', descEn: 'Plays with total creative freedom, not restricted by position.' },
  ],
  RM: [
    { tr: 'Geniş Orta Saha', en: 'Wide Midfielder', descTr: 'Geniş alanda hücuma destek verir, pas ve orta yapmaya odaklanır.', descEn: 'Supports attack in wide areas, focusing on passing and crossing.' },
    { tr: 'Defansif Takipçi Geniş OS', en: 'Tracking WM', descTr: 'Rakip hücumda bek ve savunmaya destek için geriye döner.', descEn: 'Drops back to support the full-back and defense.' },
    { tr: 'Geniş Merkez Orta Saha', en: 'Wide Central Midfielder', descTr: 'Geniş pozisyonlarda oynar, uzun ve çapraz pas opsiyonları sunar.', descEn: 'Plays in wide positions, offers long and diagonal pass options.' },
    { tr: 'Geniş Dış Oyuncu Geniş OS', en: 'Wide Outlet WM', descTr: 'Defansa çok dönmez, pozisyonunu korur, kanadı açık tutar.', descEn: 'Doesn\'t drop deep for defense, keeps the flank open.' },
  ],
  LM: [
    { tr: 'Geniş Orta Saha', en: 'Wide Midfielder', descTr: 'Geniş alanda hücuma destek verir, pas ve orta yapmaya odaklanır.', descEn: 'Supports attack in wide areas, focusing on passing and crossing.' },
    { tr: 'Defansif Takipçi Geniş OS', en: 'Tracking WM', descTr: 'Rakip hücumda bek ve savunmaya destek için geriye döner.', descEn: 'Drops back to support the full-back and defense.' },
    { tr: 'Geniş Merkez Orta Saha', en: 'Wide Central Midfielder', descTr: 'Geniş pozisyonlarda oynar, uzun ve çapraz pas opsiyonları sunar.', descEn: 'Plays in wide positions, offers long and diagonal pass options.' },
    { tr: 'Geniş Dış Oyuncu Geniş OS', en: 'Wide Outlet WM', descTr: 'Defansa çok dönmez, pozisyonunu korur, kanadı açık tutar.', descEn: 'Doesn\'t drop deep for defense, keeps the flank open.' },
  ],
  RW: [
    { tr: 'Kanat Forvet', en: 'Winger', descTr: 'Genişlik sağlar, bekle bire bir mücadele eder, dripling ve orta yapar.', descEn: 'Provides width, takes on full-backs 1v1, crosses and dribbles.' },
    { tr: 'Yarım Alan Kanat', en: 'Half-Space Winger', descTr: 'Kanattan içe doğru kat ederek yarım alanları kullanır.', descEn: 'Cuts inside from the wing to exploit half-spaces.' },
    { tr: 'İçeri Kat Eden Kanat', en: 'Inside Winger', descTr: 'Kanattan içe katarak pas ve orta yapar.', descEn: 'Cuts inside to pass or cross, links up with teammates.' },
    { tr: 'İçeri Katıp Kontra Başlatan', en: 'Inverting Outlet Winger', descTr: 'Defansa çok dönmez, kontralarda tehlikeli merkez alanlarda bulunur.', descEn: 'Stays forward to exploit central areas during counters.' },
    { tr: 'Defansif Takipçi Kanat', en: 'Tracking Winger', descTr: 'Rakip hücumda bek ve savunmaya destek için geriye döner.', descEn: 'Drops back to support the full-back and defense.' },
    { tr: 'Geniş Dış Oyuncu Kanat', en: 'Wide Outlet Winger', descTr: 'Defansa çok dönmez, pozisyonunu korur, kanadı açık tutar.', descEn: 'Stays wide and forward to provide an outlet.' },
    { tr: 'Geniş Oyun Kurucu', en: 'Wide Playmaker', descTr: 'Genişten içeri katılarak kritik paslar atan yaratıcı kaynak.', descEn: 'Creative source that cuts inside to play key passes.' },
    { tr: 'Geniş Forvet', en: 'Wide Forward', descTr: 'Hücumda genişlik sağlar, son üçüncü bölgede tehlikeli koşular yapar.', descEn: 'Provides width and makes dangerous runs in the final third.' },
    { tr: 'İçeri Kat Eden Forvet', en: 'Inside Forward', descTr: 'Kanattan içe kat ederek savunma arkasına sarkar, gol arar.', descEn: 'Cuts inside to run behind defense and score.' },
  ],
  LW: [
    { tr: 'Kanat Forvet', en: 'Winger', descTr: 'Genişlik sağlar, bekle bire bir mücadele eder, dripling ve orta yapar.', descEn: 'Provides width, takes on full-backs 1v1, crosses and dribbles.' },
    { tr: 'Yarım Alan Kanat', en: 'Half-Space Winger', descTr: 'Kanattan içe doğru kat ederek yarım alanları kullanır.', descEn: 'Cuts inside from the wing to exploit half-spaces.' },
    { tr: 'İçeri Kat Eden Kanat', en: 'Inside Winger', descTr: 'Kanattan içe katarak pas ve orta yapar.', descEn: 'Cuts inside to pass or cross, links up with teammates.' },
    { tr: 'İçeri Katıp Kontra Başlatan', en: 'Inverting Outlet Winger', descTr: 'Defansa çok dönmez, kontralarda tehlikeli merkez alanlarda bulunur.', descEn: 'Stays forward to exploit central areas during counters.' },
    { tr: 'Defansif Takipçi Kanat', en: 'Tracking Winger', descTr: 'Rakip hücumda bek ve savunmaya destek için geriye döner.', descEn: 'Drops back to support the full-back and defense.' },
    { tr: 'Geniş Dış Oyuncu Kanat', en: 'Wide Outlet Winger', descTr: 'Defansa çok dönmez, pozisyonunu korur, kanadı açık tutar.', descEn: 'Stays wide and forward to provide an outlet.' },
    { tr: 'Geniş Oyun Kurucu', en: 'Wide Playmaker', descTr: 'Genişten içeri katılarak kritik paslar atan yaratıcı kaynak.', descEn: 'Creative source that cuts inside to play key passes.' },
    { tr: 'Geniş Forvet', en: 'Wide Forward', descTr: 'Hücumda genişlik sağlar, son üçüncü bölgede tehlikeli koşular yapar.', descEn: 'Provides width and makes dangerous runs in the final third.' },
    { tr: 'İçeri Kat Eden Forvet', en: 'Inside Forward', descTr: 'Kanattan içe kat ederek savunma arkasına sarkar, gol arar.', descEn: 'Cuts inside to run behind defense and score.' },
  ],
  CF: [
    { tr: 'Sahte Dokuz', en: 'False Nine', descTr: 'Çizgiden iner, ileri oyun kurucu gibi hareket eder.', descEn: 'Drops deep from the front line, acts like an advanced playmaker.' },
    { tr: 'Geri Çekilen Forvet', en: 'Deep-Lying Forward', descTr: 'Hücum ile orta saha arasındaki bağlantıyı sağlar.', descEn: 'Links midfield and attack, acts as a passing outlet.' },
    { tr: 'Forvet - Numara 9', en: 'Centre Forward', descTr: 'Klasik numara 9, hücumların lideri ve gol sorumlusu.', descEn: 'Classic number 9, leader of the attack and goal scorer.' },
    { tr: 'Ceza Sahası Avcısı', en: 'Poacher', descTr: 'Savunma arkasında sürekli pozisyon arar, gol odaklıdır.', descEn: 'Constantly looks for positions behind the defense.' },
    { tr: 'Hedef Forvet', en: 'Target Forward', descTr: 'Fizik gücüyle savunmayı zorlar, uzun topların hedefi olur.', descEn: 'Uses physical strength to harass defense, outlet for long balls.' },
  ],
  ST: [
    { tr: 'Sahte Dokuz', en: 'False Nine', descTr: 'Çizgiden iner, ileri oyun kurucu gibi hareket eder.', descEn: 'Drops deep from the front line, acts like an advanced playmaker.' },
    { tr: 'Geri Çekilen Forvet', en: 'Deep-Lying Forward', descTr: 'Hücum ile orta saha arasındaki bağlantıyı sağlar.', descEn: 'Links midfield and attack, acts as a passing outlet.' },
    { tr: 'Yarım Alan Forveti', en: 'Half-Space Forward', descTr: 'Kanattan içe kat ederek savunmanın arkasına sarkar.', descEn: 'Cuts inside from wide to run behind the defense.' },
    { tr: 'İkinci Forvet', en: 'Second Striker', descTr: 'Hücumu destekler, savunma ve orta saha arasındaki boşluklarda oynar.', descEn: 'Supports the attack, plays in pockets between lines.' },
    { tr: 'Kanal Forvet', en: 'Channel Forward', descTr: 'Rakip savunmanın kanallarına koşular yaparak hızlı hücum oluşturur.', descEn: 'Makes runs into channels to create quick attacks.' },
    { tr: 'Forvet - Numara 9', en: 'Centre Forward', descTr: 'Klasik numara 9, hücumların lideri ve gol sorumlusu.', descEn: 'Classic number 9, leader of the attack and goal scorer.' },
    { tr: 'Merkezi Bekleyen Forvet', en: 'Central Outlet CF', descTr: 'Defansa yardım etmez, kontra ataklarda tehlikeli bölgede bekler.', descEn: 'Doesn\'t aid defense, waits in dangerous areas for counters.' },
    { tr: 'Yanlara Açılan Forvet', en: 'Splitting Outlet CF', descTr: 'Defansa dönmez, kanallara kayarak kontra atak başlatır.', descEn: 'Doesn\'t drop deep, drifts into channels to start counters.' },
    { tr: 'Defansif Takipçi Forvet', en: 'Tracking CF', descTr: 'Rakip hücumda orta sahaya destek için geriye döner.', descEn: 'Drops back to support the midfield during defense.' },
    { tr: 'Hedef Forvet', en: 'Target Forward', descTr: 'Fizik gücüyle savunmayı zorlar, uzun topların hedefi olur.', descEn: 'Uses physical strength to harass defense, outlet for long balls.' },
    { tr: 'Ceza Sahası Avcısı', en: 'Poacher', descTr: 'Savunma arkasında sürekli pozisyon arar, gol odaklıdır.', descEn: 'Constantly looks for positions behind the defense.' },
  ],
};

export function getRolesForPosition(pos: string, lang: string): string[] {
  const roles = positionRolesMap[pos];
  if (!roles) return [];
  return roles.map(r => lang === 'tr' ? r.tr : r.en);
}

export function getRoleDescription(pos: string, roleName: string, lang: string): string {
  const roles = positionRolesMap[pos];
  if (!roles) return '';
  const role = roles.find(r => (lang === 'tr' ? r.tr : r.en) === roleName);
  if (!role) return '';
  return lang === 'tr' ? role.descTr : role.descEn;
}
