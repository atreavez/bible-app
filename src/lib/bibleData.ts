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

export const translations = [
  { id: "kjv", name: "King James Version", abbreviation: "KJV" },
  { id: "web", name: "World English Bible", abbreviation: "WEB" },
  { id: "bbe", name: "Bible in Basic English", abbreviation: "BBE" },
  { id: "asv", name: "American Standard Version", abbreviation: "ASV" },
  { id: "ylt", name: "Young's Literal Translation", abbreviation: "YLT" },
  { id: "darby", name: "Darby Translation", abbreviation: "DARBY" },
  { id: "web", name: "Webster's Bible", abbreviation: "WBT" },
  { id: "almeida", name: "João Ferreira de Almeida", abbreviation: "JFA" },
  { id: "rva", name: "Reina Valera", abbreviation: "RVA" },
  { id: "cherokee", name: "Cherokee New Testament", abbreviation: "CHR" },
  { id: "oeb-us", name: "Open English Bible (US)", abbreviation: "OEB-US" },
  { id: "oeb-cw", name: "Open English Bible (CW)", abbreviation: "OEB-CW" },
  { id: "webbe", name: "World English Bible (British)", abbreviation: "WEBBE" },
  { id: "clementine", name: "Clementine Latin Vulgate", abbreviation: "VULG" },
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

// API helper to fetch Bible text
export async function fetchBibleText(
  translation: string,
  book: string,
  chapter: number
): Promise<{ verses: { verse: number; text: string }[] }> {
  try {
    const response = await fetch(
      `https://bible-api.com/${book}+${chapter}?translation=${translation}`
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return {
      verses: data.verses?.map((v: any) => ({
        verse: v.verse,
        text: v.text,
      })) || [],
    };
  } catch {
    // Fallback sample verses
    return {
      verses: Array.from({ length: 10 }, (_, i) => ({
        verse: i + 1,
        text: `[Verse ${i + 1} — select a book and chapter to load verses from the ${translation.toUpperCase()} translation]`,
      })),
    };
  }
}
