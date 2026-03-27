// Bible books data structure
export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
  abbreviation: string;
}

export const bibleBooks: BibleBook[] = [
  // Old Testament
  { name: "Genesis", chapters: 50, testament: "old", abbreviation: "Gen" },
  { name: "Exodus", chapters: 40, testament: "old", abbreviation: "Exo" },
  { name: "Leviticus", chapters: 27, testament: "old", abbreviation: "Lev" },
  { name: "Numbers", chapters: 36, testament: "old", abbreviation: "Num" },
  { name: "Deuteronomy", chapters: 34, testament: "old", abbreviation: "Deu" },
  { name: "Joshua", chapters: 24, testament: "old", abbreviation: "Jos" },
  { name: "Judges", chapters: 21, testament: "old", abbreviation: "Jdg" },
  { name: "Ruth", chapters: 4, testament: "old", abbreviation: "Rut" },
  { name: "1 Samuel", chapters: 31, testament: "old", abbreviation: "1Sa" },
  { name: "2 Samuel", chapters: 24, testament: "old", abbreviation: "2Sa" },
  { name: "1 Kings", chapters: 22, testament: "old", abbreviation: "1Ki" },
  { name: "2 Kings", chapters: 25, testament: "old", abbreviation: "2Ki" },
  { name: "1 Chronicles", chapters: 29, testament: "old", abbreviation: "1Ch" },
  { name: "2 Chronicles", chapters: 36, testament: "old", abbreviation: "2Ch" },
  { name: "Ezra", chapters: 10, testament: "old", abbreviation: "Ezr" },
  { name: "Nehemiah", chapters: 13, testament: "old", abbreviation: "Neh" },
  { name: "Esther", chapters: 10, testament: "old", abbreviation: "Est" },
  { name: "Job", chapters: 42, testament: "old", abbreviation: "Job" },
  { name: "Psalms", chapters: 150, testament: "old", abbreviation: "Psa" },
  { name: "Proverbs", chapters: 31, testament: "old", abbreviation: "Pro" },
  { name: "Ecclesiastes", chapters: 12, testament: "old", abbreviation: "Ecc" },
  { name: "Song of Solomon", chapters: 8, testament: "old", abbreviation: "Sol" },
  { name: "Isaiah", chapters: 66, testament: "old", abbreviation: "Isa" },
  { name: "Jeremiah", chapters: 52, testament: "old", abbreviation: "Jer" },
  { name: "Lamentations", chapters: 5, testament: "old", abbreviation: "Lam" },
  { name: "Ezekiel", chapters: 48, testament: "old", abbreviation: "Eze" },
  { name: "Daniel", chapters: 12, testament: "old", abbreviation: "Dan" },
  { name: "Hosea", chapters: 14, testament: "old", abbreviation: "Hos" },
  { name: "Joel", chapters: 3, testament: "old", abbreviation: "Joe" },
  { name: "Amos", chapters: 9, testament: "old", abbreviation: "Amo" },
  { name: "Obadiah", chapters: 1, testament: "old", abbreviation: "Oba" },
  { name: "Jonah", chapters: 4, testament: "old", abbreviation: "Jon" },
  { name: "Micah", chapters: 7, testament: "old", abbreviation: "Mic" },
  { name: "Nahum", chapters: 3, testament: "old", abbreviation: "Nah" },
  { name: "Habakkuk", chapters: 3, testament: "old", abbreviation: "Hab" },
  { name: "Zephaniah", chapters: 3, testament: "old", abbreviation: "Zep" },
  { name: "Haggai", chapters: 2, testament: "old", abbreviation: "Hag" },
  { name: "Zechariah", chapters: 14, testament: "old", abbreviation: "Zec" },
  { name: "Malachi", chapters: 4, testament: "old", abbreviation: "Mal" },
  // New Testament
  { name: "Matthew", chapters: 28, testament: "new", abbreviation: "Mat" },
  { name: "Mark", chapters: 16, testament: "new", abbreviation: "Mar" },
  { name: "Luke", chapters: 24, testament: "new", abbreviation: "Luk" },
  { name: "John", chapters: 21, testament: "new", abbreviation: "Joh" },
  { name: "Acts", chapters: 28, testament: "new", abbreviation: "Act" },
  { name: "Romans", chapters: 16, testament: "new", abbreviation: "Rom" },
  { name: "1 Corinthians", chapters: 16, testament: "new", abbreviation: "1Co" },
  { name: "2 Corinthians", chapters: 13, testament: "new", abbreviation: "2Co" },
  { name: "Galatians", chapters: 6, testament: "new", abbreviation: "Gal" },
  { name: "Ephesians", chapters: 6, testament: "new", abbreviation: "Eph" },
  { name: "Philippians", chapters: 4, testament: "new", abbreviation: "Phi" },
  { name: "Colossians", chapters: 4, testament: "new", abbreviation: "Col" },
  { name: "1 Thessalonians", chapters: 5, testament: "new", abbreviation: "1Th" },
  { name: "2 Thessalonians", chapters: 3, testament: "new", abbreviation: "2Th" },
  { name: "1 Timothy", chapters: 6, testament: "new", abbreviation: "1Ti" },
  { name: "2 Timothy", chapters: 4, testament: "new", abbreviation: "2Ti" },
  { name: "Titus", chapters: 3, testament: "new", abbreviation: "Tit" },
  { name: "Philemon", chapters: 1, testament: "new", abbreviation: "Phm" },
  { name: "Hebrews", chapters: 13, testament: "new", abbreviation: "Heb" },
  { name: "James", chapters: 5, testament: "new", abbreviation: "Jam" },
  { name: "1 Peter", chapters: 5, testament: "new", abbreviation: "1Pe" },
  { name: "2 Peter", chapters: 3, testament: "new", abbreviation: "2Pe" },
  { name: "1 John", chapters: 5, testament: "new", abbreviation: "1Jo" },
  { name: "2 John", chapters: 1, testament: "new", abbreviation: "2Jo" },
  { name: "3 John", chapters: 1, testament: "new", abbreviation: "3Jo" },
  { name: "Jude", chapters: 1, testament: "new", abbreviation: "Jud" },
  { name: "Revelation", chapters: 22, testament: "new", abbreviation: "Rev" },
];

export interface Translation {
  id: string;
  name: string;
  abbreviation: string;
  source: "bible-api" | "helloao";
  language: string;
}

export const translationLanguages = [
  "All",
  "English",
  "Portuguese",
  "Spanish",
  "Cherokee",
  "Latin",
  "Chinese",
  "Czech",
] as const;

export type TranslationLanguage = (typeof translationLanguages)[number];

export const translations: Translation[] = [
  // bible-api.com translations
  { id: "kjv", name: "King James Version", abbreviation: "KJV", source: "bible-api", language: "English" },
  { id: "web", name: "World English Bible", abbreviation: "WEB", source: "bible-api", language: "English" },
  { id: "bbe", name: "Bible in Basic English", abbreviation: "BBE", source: "bible-api", language: "English" },
  { id: "asv", name: "American Standard Version", abbreviation: "ASV", source: "bible-api", language: "English" },
  { id: "ylt", name: "Young's Literal Translation", abbreviation: "YLT", source: "bible-api", language: "English" },
  { id: "darby", name: "Darby Bible", abbreviation: "DARBY", source: "bible-api", language: "English" },
  { id: "dra", name: "Douay-Rheims 1899 American Edition", abbreviation: "DRA", source: "bible-api", language: "English" },
  { id: "webbe", name: "World English Bible (British)", abbreviation: "WEBBE", source: "bible-api", language: "English" },
  { id: "oeb-us", name: "Open English Bible (US)", abbreviation: "OEB-US", source: "bible-api", language: "English" },
  { id: "oeb-cw", name: "Open English Bible (CW)", abbreviation: "OEB-CW", source: "bible-api", language: "English" },
  { id: "almeida", name: "João Ferreira de Almeida", abbreviation: "JFA", source: "bible-api", language: "Portuguese" },
  { id: "rva", name: "Reina Valera", abbreviation: "RVA", source: "bible-api", language: "Spanish" },
  { id: "cherokee", name: "Cherokee New Testament", abbreviation: "CHR", source: "bible-api", language: "Cherokee" },
  { id: "clementine", name: "Clementine Latin Vulgate", abbreviation: "VULG", source: "bible-api", language: "Latin" },
  { id: "cuv", name: "Chinese Union Version", abbreviation: "CUV", source: "bible-api", language: "Chinese" },
  { id: "bkr", name: "Bible Kralická (Czech)", abbreviation: "BKR", source: "bible-api", language: "Czech" },
  // bible.helloao.org translations
  { id: "BSB", name: "Berean Standard Bible", abbreviation: "BSB", source: "helloao", language: "English" },
  { id: "BibleWeek", name: "BibleWeek", abbreviation: "BW", source: "helloao", language: "English" },
  { id: "FBV", name: "Free Bible Version", abbreviation: "FBV", source: "helloao", language: "English" },
  { id: "LSV", name: "Literal Standard Version", abbreviation: "LSV", source: "helloao", language: "English" },
  { id: "WMB", name: "World Messianic Bible", abbreviation: "WMB", source: "helloao", language: "English" },
  { id: "WMBBE", name: "World Messianic Bible British Ed.", abbreviation: "WMBBE", source: "helloao", language: "English" },
  { id: "T4T", name: "Translation for Translators", abbreviation: "T4T", source: "helloao", language: "English" },
];

export const bibleStories = [
  {
    id: "creation",
    title: "The Creation",
    description: "In the beginning, God created the heavens and the earth...",
    book: "Genesis",
    chapter: "1-2",
    image: "🌍",
  },
  {
    id: "noah",
    title: "Noah's Ark",
    description: "God commanded Noah to build an ark to save his family and the animals from a great flood...",
    book: "Genesis",
    chapter: "6-9",
    image: "🚢",
  },
  {
    id: "moses",
    title: "Moses & The Exodus",
    description: "God chose Moses to lead the Israelites out of slavery in Egypt...",
    book: "Exodus",
    chapter: "1-15",
    image: "🌊",
  },
  {
    id: "david-goliath",
    title: "David & Goliath",
    description: "A young shepherd boy defeats a giant warrior with faith and a single stone...",
    book: "1 Samuel",
    chapter: "17",
    image: "⚔️",
  },
  {
    id: "daniel-lions",
    title: "Daniel in the Lions' Den",
    description: "Daniel's unwavering faith protects him in the lions' den...",
    book: "Daniel",
    chapter: "6",
    image: "🦁",
  },
  {
    id: "birth-jesus",
    title: "The Birth of Jesus",
    description: "In Bethlehem, the Savior is born in a humble manger...",
    book: "Luke",
    chapter: "2",
    image: "⭐",
  },
  {
    id: "resurrection",
    title: "The Resurrection",
    description: "On the third day, Jesus rose from the dead, conquering death forever...",
    book: "Matthew",
    chapter: "28",
    image: "✝️",
  },
  {
    id: "good-samaritan",
    title: "The Good Samaritan",
    description: "A parable about showing mercy and kindness to all people...",
    book: "Luke",
    chapter: "10",
    image: "❤️",
  },
];

// Map book names to helloao.org format
function bookToHelloaoId(bookName: string): string {
  const map: Record<string, string> = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
    "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI",
    "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
    "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
    "Ecclesiastes": "ECC", "Song of Solomon": "SNG", "Isaiah": "ISA", "Jeremiah": "JER",
    "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS",
    "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA", "Jonah": "JON",
    "Micah": "MIC", "Nahum": "NAM", "Habakkuk": "HAB", "Zephaniah": "ZEP",
    "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
    "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
    "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL",
    "1 Thessalonians": "1TH", "2 Thessalonians": "2TH", "1 Timothy": "1TI", "2 Timothy": "2TI",
    "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS",
    "1 Peter": "1PE", "2 Peter": "2PE", "1 John": "1JN", "2 John": "2JN",
    "3 John": "3JN", "Jude": "JUD", "Revelation": "REV",
  };
  return map[bookName] || bookName;
}

async function fetchFromHelloao(
  translationId: string,
  book: string,
  chapter: number
): Promise<{ verses: { verse: number; text: string }[] }> {
  const bookId = bookToHelloaoId(book);
  const response = await fetch(
    `https://bible.helloao.org/api/${translationId}/${bookId}/${chapter}.json`
  );
  if (!response.ok) throw new Error("Failed to fetch from helloao");
  const data = await response.json();
  const content = data.chapter?.content;
  if (!content) throw new Error("No content");
  
  const verses: { verse: number; text: string }[] = [];
  for (const item of content) {
    if (item.type === "verse") {
      const verseNum = parseInt(item.number, 10);
      const text = (item.content || [])
        .filter((c: any) => typeof c === "string" || c.text)
        .map((c: any) => (typeof c === "string" ? c : c.text))
        .join("");
      if (text.trim()) verses.push({ verse: verseNum, text: text.trim() });
    }
  }
  return { verses };
}

async function fetchFromBibleApi(
  translationId: string,
  book: string,
  chapter: number
): Promise<{ verses: { verse: number; text: string }[] }> {
  const response = await fetch(
    `https://bible-api.com/${book}+${chapter}?translation=${translationId}`
  );
  if (!response.ok) throw new Error("Failed to fetch");
  const data = await response.json();
  return {
    verses: data.verses?.map((v: any) => ({
      verse: v.verse,
      text: v.text,
    })) || [],
  };
}

// API helper to fetch Bible text
export async function fetchBibleText(
  translation: string,
  book: string,
  chapter: number
): Promise<{ verses: { verse: number; text: string }[] }> {
  const t = translations.find((tr) => tr.id === translation);
  try {
    if (t?.source === "helloao") {
      return await fetchFromHelloao(translation, book, chapter);
    }
    return await fetchFromBibleApi(translation, book, chapter);
  } catch {
    return {
      verses: Array.from({ length: 10 }, (_, i) => ({
        verse: i + 1,
        text: `[Verse ${i + 1} — unable to load. Try another translation.]`,
      })),
    };
  }
}
