import type { LocalityEntry } from "@/types";

/**
 * Israeli localities gazetteer with WGS-84 centroids.
 * Compiled from Israel Central Bureau of Statistics (CBS) localities dataset
 * and OpenStreetMap admin boundaries.
 *
 * countdown_seconds values are based on Pikud HaOref shelter time allocations
 * by geographic zone:
 *   - Gaza envelope: 15s
 *   - Western Negev / Southern coast: 30s
 *   - Central Israel (Tel Aviv, Gush Dan): 90s
 *   - Northern Israel (near Lebanon border): 15-30s
 *   - Haifa / Northern coast: 60s
 *   - Jerusalem / Central hills: 90s
 *   - Jordan Valley / Dead Sea: 90s
 *   - Upper Galilee: 30s
 *
 * This is a representative subset. A production deployment would include
 * the full ~1,200 locality dataset.
 */
export const GAZETTEER: LocalityEntry[] = [
  // === Major Cities ===
  { name_he: "תל אביב - יפו", name_en: "Tel Aviv - Yafo", lat: 32.0853, lng: 34.7818, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "ירושלים", name_en: "Jerusalem", lat: 31.7683, lng: 35.2137, countdown_seconds: 90, region: "Jerusalem" },
  { name_he: "חיפה", name_en: "Haifa", lat: 32.7940, lng: 34.9896, countdown_seconds: 60, region: "Haifa" },
  { name_he: "באר שבע", name_en: "Beer Sheva", lat: 31.2530, lng: 34.7915, countdown_seconds: 60, region: "Northern Negev" },
  { name_he: "אשדוד", name_en: "Ashdod", lat: 31.8040, lng: 34.6553, countdown_seconds: 45, region: "Southern Coast" },
  { name_he: "נתניה", name_en: "Netanya", lat: 32.3215, lng: 34.8532, countdown_seconds: 90, region: "Sharon" },
  { name_he: "ראשון לציון", name_en: "Rishon LeZion", lat: 31.9642, lng: 34.8046, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "פתח תקווה", name_en: "Petah Tikva", lat: 32.0841, lng: 34.8878, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "אשקלון", name_en: "Ashkelon", lat: 31.6688, lng: 34.5743, countdown_seconds: 30, region: "Southern Coast" },
  { name_he: "חולון", name_en: "Holon", lat: 32.0114, lng: 34.7748, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "בני ברק", name_en: "Bnei Brak", lat: 32.0834, lng: 34.8342, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "רמת גן", name_en: "Ramat Gan", lat: 32.0700, lng: 34.8246, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "בת ים", name_en: "Bat Yam", lat: 32.0171, lng: 34.7517, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "הרצליה", name_en: "Herzliya", lat: 32.1629, lng: 34.7919, countdown_seconds: 90, region: "Sharon" },
  { name_he: "כפר סבא", name_en: "Kfar Saba", lat: 32.1750, lng: 34.9075, countdown_seconds: 90, region: "Sharon" },
  { name_he: "רעננה", name_en: "Ra'anana", lat: 32.1841, lng: 34.8703, countdown_seconds: 90, region: "Sharon" },
  { name_he: "מודיעין-מכבים-רעות", name_en: "Modi'in-Maccabim-Re'ut", lat: 31.8979, lng: 35.0104, countdown_seconds: 90, region: "Central" },
  { name_he: "לוד", name_en: "Lod", lat: 31.9515, lng: 34.8953, countdown_seconds: 90, region: "Central" },
  { name_he: "רמלה", name_en: "Ramla", lat: 31.9275, lng: 34.8677, countdown_seconds: 90, region: "Central" },
  { name_he: "רחובות", name_en: "Rehovot", lat: 31.8928, lng: 34.8113, countdown_seconds: 90, region: "Central" },
  { name_he: "נצרת", name_en: "Nazareth", lat: 32.6996, lng: 35.3035, countdown_seconds: 60, region: "Lower Galilee" },
  { name_he: "עכו", name_en: "Acre", lat: 32.9279, lng: 35.0764, countdown_seconds: 30, region: "Western Galilee" },
  { name_he: "טבריה", name_en: "Tiberias", lat: 32.7922, lng: 35.5312, countdown_seconds: 30, region: "Lower Galilee" },
  { name_he: "צפת", name_en: "Safed", lat: 32.9646, lng: 35.4954, countdown_seconds: 30, region: "Upper Galilee" },
  { name_he: "קריית שמונה", name_en: "Kiryat Shmona", lat: 33.2087, lng: 35.5711, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "נהריה", name_en: "Nahariya", lat: 33.0063, lng: 35.0958, countdown_seconds: 30, region: "Western Galilee" },
  { name_he: "כרמיאל", name_en: "Karmiel", lat: 32.9191, lng: 35.2948, countdown_seconds: 30, region: "Upper Galilee" },
  { name_he: "אילת", name_en: "Eilat", lat: 29.5577, lng: 34.9519, countdown_seconds: 90, region: "Southern Negev" },
  { name_he: "דימונה", name_en: "Dimona", lat: 31.0700, lng: 35.0300, countdown_seconds: 90, region: "Northern Negev" },
  { name_he: "ערד", name_en: "Arad", lat: 31.2561, lng: 35.2124, countdown_seconds: 90, region: "Northern Negev" },
  // === Gush Dan metro ===
  { name_he: "גבעתיים", name_en: "Givatayim", lat: 32.0715, lng: 34.8099, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "קריית אונו", name_en: "Kiryat Ono", lat: 32.0633, lng: 34.8554, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "אור יהודה", name_en: "Or Yehuda", lat: 32.0286, lng: 34.8617, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "יהוד-מונוסון", name_en: "Yehud-Monosson", lat: 32.0318, lng: 34.8880, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "גני תקווה", name_en: "Ganei Tikva", lat: 32.0578, lng: 34.8719, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "קריית אתא", name_en: "Kiryat Ata", lat: 32.8058, lng: 35.1102, countdown_seconds: 60, region: "Haifa" },
  { name_he: "קריית ביאליק", name_en: "Kiryat Bialik", lat: 32.8309, lng: 35.0873, countdown_seconds: 60, region: "Haifa" },
  { name_he: "קריית מוצקין", name_en: "Kiryat Motzkin", lat: 32.8371, lng: 35.0786, countdown_seconds: 60, region: "Haifa" },
  { name_he: "קריית ים", name_en: "Kiryat Yam", lat: 32.8465, lng: 35.0698, countdown_seconds: 60, region: "Haifa" },
  { name_he: "טירת כרמל", name_en: "Tirat Carmel", lat: 32.7605, lng: 34.9712, countdown_seconds: 60, region: "Haifa" },
  // === Northern border towns ===
  { name_he: "מטולה", name_en: "Metula", lat: 33.2803, lng: 35.5780, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "שלומי", name_en: "Shlomi", lat: 33.0758, lng: 35.1439, countdown_seconds: 15, region: "Western Galilee" },
  { name_he: "מעלות-תרשיחא", name_en: "Ma'alot-Tarshiha", lat: 33.0176, lng: 35.2715, countdown_seconds: 30, region: "Western Galilee" },
  { name_he: "חצור הגלילית", name_en: "Hazor HaGlilit", lat: 32.9870, lng: 35.5405, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "ראש פינה", name_en: "Rosh Pina", lat: 32.9681, lng: 35.5376, countdown_seconds: 15, region: "Upper Galilee" },
  // === Southern / Gaza envelope ===
  { name_he: "שדרות", name_en: "Sderot", lat: 31.5250, lng: 34.5963, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "נתיבות", name_en: "Netivot", lat: 31.4214, lng: 34.5878, countdown_seconds: 30, region: "Western Negev" },
  { name_he: "אופקים", name_en: "Ofakim", lat: 31.3150, lng: 34.6198, countdown_seconds: 30, region: "Western Negev" },
  { name_he: "קריית גת", name_en: "Kiryat Gat", lat: 31.6100, lng: 34.7642, countdown_seconds: 45, region: "Southern Coast" },
  { name_he: "קריית מלאכי", name_en: "Kiryat Malakhi", lat: 31.7294, lng: 34.7472, countdown_seconds: 45, region: "Southern Coast" },
  // === Central corridor ===
  { name_he: "גדרה", name_en: "Gedera", lat: 31.8119, lng: 34.7782, countdown_seconds: 60, region: "Central" },
  { name_he: "יבנה", name_en: "Yavne", lat: 31.8761, lng: 34.7383, countdown_seconds: 60, region: "Central" },
  { name_he: "נס ציונה", name_en: "Ness Ziona", lat: 31.9293, lng: 34.7915, countdown_seconds: 90, region: "Central" },
  { name_he: "ראש העין", name_en: "Rosh HaAyin", lat: 32.0953, lng: 34.9567, countdown_seconds: 90, region: "Central" },
  { name_he: "שוהם", name_en: "Shoham", lat: 31.9985, lng: 34.9470, countdown_seconds: 90, region: "Central" },
  { name_he: "בית שמש", name_en: "Beit Shemesh", lat: 31.7468, lng: 34.9889, countdown_seconds: 90, region: "Jerusalem Hills" },
  // === Sharon / Northern coast ===
  { name_he: "חדרה", name_en: "Hadera", lat: 32.4404, lng: 34.9213, countdown_seconds: 60, region: "Sharon" },
  { name_he: "הוד השרון", name_en: "Hod HaSharon", lat: 32.1503, lng: 34.8885, countdown_seconds: 90, region: "Sharon" },
  { name_he: "רמת השרון", name_en: "Ramat HaSharon", lat: 32.1464, lng: 34.8398, countdown_seconds: 90, region: "Sharon" },
  { name_he: "זכרון יעקב", name_en: "Zikhron Ya'akov", lat: 32.5714, lng: 34.9542, countdown_seconds: 60, region: "Sharon" },
  { name_he: "אור עקיבא", name_en: "Or Akiva", lat: 32.5074, lng: 34.9181, countdown_seconds: 60, region: "Sharon" },
  { name_he: "קיסריה", name_en: "Caesarea", lat: 32.5037, lng: 34.8908, countdown_seconds: 60, region: "Sharon" },
  // === Jordan Valley / Dead Sea ===
  { name_he: "בית שאן", name_en: "Beit She'an", lat: 32.4974, lng: 35.4976, countdown_seconds: 30, region: "Jordan Valley" },
  { name_he: "עין גדי", name_en: "Ein Gedi", lat: 31.4660, lng: 35.3870, countdown_seconds: 90, region: "Dead Sea" },
  { name_he: "עפולה", name_en: "Afula", lat: 32.6074, lng: 35.2888, countdown_seconds: 60, region: "Jezreel Valley" },
  { name_he: "מגדל העמק", name_en: "Migdal HaEmek", lat: 32.6746, lng: 35.2416, countdown_seconds: 60, region: "Jezreel Valley" },
  { name_he: "יקנעם עילית", name_en: "Yokneam Illit", lat: 32.6593, lng: 35.1103, countdown_seconds: 60, region: "Jezreel Valley" },
  // === Judea and Samaria ===
  { name_he: "אריאל", name_en: "Ariel", lat: 32.1048, lng: 35.1709, countdown_seconds: 90, region: "Samaria" },
  { name_he: "מעלה אדומים", name_en: "Ma'ale Adumim", lat: 31.7808, lng: 35.3019, countdown_seconds: 90, region: "Jerusalem" },
  { name_he: "ביתר עילית", name_en: "Beitar Illit", lat: 31.6948, lng: 35.1230, countdown_seconds: 90, region: "Jerusalem Hills" },
  // === Golan Heights ===
  { name_he: "קצרין", name_en: "Katzrin", lat: 32.9957, lng: 35.6919, countdown_seconds: 15, region: "Golan Heights" },
  // === Additional northern localities ===
  { name_he: "עתלית", name_en: "Atlit", lat: 32.6871, lng: 34.9380, countdown_seconds: 60, region: "Haifa" },
  { name_he: "נשר", name_en: "Nesher", lat: 32.7690, lng: 35.0373, countdown_seconds: 60, region: "Haifa" },
  { name_he: "דליית אל-כרמל", name_en: "Daliyat al-Karmel", lat: 32.6922, lng: 35.0449, countdown_seconds: 60, region: "Haifa" },
  // === Additional central localities ===
  { name_he: "כפר יונה", name_en: "Kfar Yona", lat: 32.3171, lng: 34.9355, countdown_seconds: 90, region: "Sharon" },
  { name_he: "אבן יהודה", name_en: "Even Yehuda", lat: 32.2724, lng: 34.8833, countdown_seconds: 90, region: "Sharon" },
  { name_he: "תל מונד", name_en: "Tel Mond", lat: 32.2563, lng: 34.9187, countdown_seconds: 90, region: "Sharon" },
  { name_he: "קלנסווה", name_en: "Qalansawe", lat: 32.2839, lng: 34.9812, countdown_seconds: 90, region: "Sharon" },
  { name_he: "טייבה", name_en: "Tayibe", lat: 32.2667, lng: 34.9873, countdown_seconds: 90, region: "Sharon" },
  // === Additional southern localities ===
  { name_he: "ירוחם", name_en: "Yeruham", lat: 30.9891, lng: 34.9292, countdown_seconds: 90, region: "Northern Negev" },
  { name_he: "מצפה רמון", name_en: "Mitzpe Ramon", lat: 30.6103, lng: 34.8014, countdown_seconds: 90, region: "Southern Negev" },
  { name_he: "ערערה בנגב", name_en: "Ar'ara BaNegev", lat: 31.1487, lng: 34.7499, countdown_seconds: 60, region: "Northern Negev" },
  { name_he: "רהט", name_en: "Rahat", lat: 31.3926, lng: 34.7542, countdown_seconds: 60, region: "Northern Negev" },
  { name_he: "להבים", name_en: "Lehavim", lat: 31.3750, lng: 34.8167, countdown_seconds: 60, region: "Northern Negev" },
  // === Kibbutzim / Gaza envelope ===
  { name_he: "ניר עוז", name_en: "Nir Oz", lat: 31.2870, lng: 34.3960, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "בארי", name_en: "Be'eri", lat: 31.4310, lng: 34.4920, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "כפר עזה", name_en: "Kfar Aza", lat: 31.4890, lng: 34.5280, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "נחל עוז", name_en: "Nahal Oz", lat: 31.4750, lng: 34.4750, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "כיסופים", name_en: "Kissufim", lat: 31.3750, lng: 34.4000, countdown_seconds: 15, region: "Western Negev" },
  { name_he: "יד מרדכי", name_en: "Yad Mordechai", lat: 31.5880, lng: 34.5570, countdown_seconds: 15, region: "Western Negev" },
  // === Lower Galilee ===
  { name_he: "נצרת עילית", name_en: "Nof HaGalil", lat: 32.7277, lng: 35.3166, countdown_seconds: 60, region: "Lower Galilee" },
  { name_he: "שפרעם", name_en: "Shefa-Amr", lat: 32.8053, lng: 35.1708, countdown_seconds: 60, region: "Western Galilee" },
  // === Remaining key localities ===
  { name_he: "מעלה אפרים", name_en: "Ma'ale Efraim", lat: 32.0722, lng: 35.3761, countdown_seconds: 90, region: "Jordan Valley" },
  { name_he: "בקה אל-גרבייה", name_en: "Baqa al-Gharbiyye", lat: 32.4133, lng: 35.0408, countdown_seconds: 60, region: "Wadi Ara" },
  { name_he: "אום אל-פחם", name_en: "Umm al-Fahm", lat: 32.5167, lng: 35.1500, countdown_seconds: 60, region: "Wadi Ara" },
  // === Tel Aviv sub-areas (Pikud HaOref splits these) ===
  { name_he: "תל אביב - מרכז", name_en: "Tel Aviv - Center", lat: 32.0731, lng: 34.7837, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "תל אביב - מזרח", name_en: "Tel Aviv - East", lat: 32.0784, lng: 34.8001, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "תל אביב - דרום", name_en: "Tel Aviv - South", lat: 32.0530, lng: 34.7699, countdown_seconds: 90, region: "Gush Dan" },
  { name_he: "תל אביב - צפון", name_en: "Tel Aviv - North", lat: 32.1050, lng: 34.7930, countdown_seconds: 90, region: "Gush Dan" },
  // === Haifa sub-areas ===
  { name_he: "חיפה - כרמל ועיר תחתית", name_en: "Haifa - Carmel & Lower City", lat: 32.7850, lng: 34.9800, countdown_seconds: 60, region: "Haifa" },
  { name_he: "חיפה - נווה שאנן", name_en: "Haifa - Neve Sha'anan", lat: 32.7750, lng: 35.0100, countdown_seconds: 60, region: "Haifa" },
  { name_he: "חיפה - קריית חיים", name_en: "Haifa - Kiryat Haim", lat: 32.8250, lng: 35.0600, countdown_seconds: 60, region: "Haifa" },
  // === Additional border/security-relevant towns ===
  { name_he: "יפתח", name_en: "Yiftah", lat: 33.1870, lng: 35.5180, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "מנרה", name_en: "Manara", lat: 33.2460, lng: 35.5440, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "דפנה", name_en: "Dafna", lat: 33.2340, lng: 35.6350, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "דן", name_en: "Dan", lat: 33.2490, lng: 35.6520, countdown_seconds: 15, region: "Upper Galilee" },
  { name_he: "שניר", name_en: "Snir", lat: 33.2400, lng: 35.6370, countdown_seconds: 15, region: "Golan Heights" },
  { name_he: "מג'דל שמס", name_en: "Majdal Shams", lat: 33.2714, lng: 35.7682, countdown_seconds: 15, region: "Golan Heights" },
];

/** Lookup map: Hebrew name → locality entry */
export const GAZETTEER_BY_NAME_HE = new Map<string, LocalityEntry>(
  GAZETTEER.map((entry) => [entry.name_he, entry])
);

/** Lookup map: English name → locality entry */
export const GAZETTEER_BY_NAME_EN = new Map<string, LocalityEntry>(
  GAZETTEER.map((entry) => [entry.name_en.toLowerCase(), entry])
);

/**
 * Fuzzy lookup: tries exact Hebrew match, then English (case-insensitive),
 * then partial match on either.
 */
export function lookupLocality(name: string): LocalityEntry | undefined {
  // Exact Hebrew match
  const heMatch = GAZETTEER_BY_NAME_HE.get(name);
  if (heMatch) return heMatch;

  // Exact English match (case-insensitive)
  const enMatch = GAZETTEER_BY_NAME_EN.get(name.toLowerCase());
  if (enMatch) return enMatch;

  // Partial match
  const lowerName = name.toLowerCase();
  return GAZETTEER.find(
    (entry) =>
      entry.name_he.includes(name) ||
      entry.name_en.toLowerCase().includes(lowerName)
  );
}
