// Daily devotional verses with reflections
export interface Devotional {
  verse: string;
  reference: string;
  reflection: string;
  prayer: string;
  theme: string;
}

export const devotionals: Devotional[] = [
  {
    verse: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    reference: "Proverbs 3:5-6",
    reflection: "In a world that demands self-reliance, God invites us to a deeper trust — one that surrenders control and embraces divine guidance. When we acknowledge Him in every decision, He faithfully illuminates our path.",
    prayer: "Lord, I surrender my plans to You. Guide my steps today and give me the courage to trust even when I cannot see the way ahead. Amen.",
    theme: "Trust",
  },
  {
    verse: "The LORD is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul.",
    reference: "Psalm 23:1-3",
    reflection: "Like a shepherd who knows each sheep by name, God tends to our deepest needs. In seasons of weariness, He leads us to places of rest and restoration — not because we've earned it, but because He loves us.",
    prayer: "Good Shepherd, lead me to Your still waters today. Restore my weary soul and remind me that in You, I have everything I need. Amen.",
    theme: "Peace",
  },
  {
    verse: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13",
    reflection: "This verse isn't a promise of worldly success, but something far greater — the assurance that Christ's strength sustains us through every trial, every joy, every season of life. His power is made perfect in our weakness.",
    prayer: "Jesus, fill me with Your strength today. Help me face every challenge knowing that Your power works through me. Amen.",
    theme: "Strength",
  },
  {
    verse: "Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
    reference: "Joshua 1:9",
    reflection: "God's command to be courageous is always paired with a promise: His presence. We are never asked to face our fears alone. The same God who parted seas and moved mountains walks beside us in every battle.",
    prayer: "Father, replace my fear with holy courage. Remind me that wherever I go, You are already there. Amen.",
    theme: "Courage",
  },
  {
    verse: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28",
    reflection: "Jesus doesn't call the rested — He calls the weary. His invitation is not to try harder but to come closer. In His presence, the burdens we carry find a place to rest.",
    prayer: "Lord Jesus, I come to You with all my burdens. Grant me the rest that only You can give. Amen.",
    theme: "Rest",
  },
  {
    verse: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reference: "Romans 8:28",
    reflection: "Even in our darkest moments, God is weaving a tapestry of grace. What seems like chaos to us is purposeful in His hands. This promise doesn't remove pain, but it redeems it.",
    prayer: "God, help me trust that You are working all things together for my good, even when I cannot see it. Amen.",
    theme: "Purpose",
  },
  {
    verse: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
    reference: "Psalm 34:18",
    reflection: "God doesn't stand distant from our pain — He draws near. In our brokenness, we find His most tender presence. A contrite heart is not weakness; it is the doorway to divine comfort.",
    prayer: "Lord, draw near to me in my brokenness. Let me feel Your presence and know Your healing touch. Amen.",
    theme: "Comfort",
  },
  {
    verse: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary.",
    reference: "Isaiah 40:31",
    reflection: "Waiting is not passive — it is an act of faith. When we wait upon the Lord, we exchange our limited strength for His limitless power. Like eagles rising on thermals, we are lifted by a force greater than ourselves.",
    prayer: "Lord, teach me to wait on You. Renew my strength and help me soar above my circumstances. Amen.",
    theme: "Patience",
  },
  {
    verse: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.",
    reference: "Jeremiah 29:11",
    reflection: "God's plans for us are born from love, not punishment. Even in exile, even in hardship, He holds a future full of hope. His thoughts toward us are always redemptive.",
    prayer: "Father, thank You that Your plans for me are good. Help me rest in Your promises for my future. Amen.",
    theme: "Hope",
  },
  {
    verse: "Create in me a clean heart, O God; and renew a right spirit within me.",
    reference: "Psalm 51:10",
    reflection: "David's prayer after his greatest failure becomes our own daily cry. We don't need to clean ourselves up before coming to God — we come as we are, and He does the transforming work.",
    prayer: "Create in me a clean heart, O God. Renew my spirit and restore the joy of Your salvation. Amen.",
    theme: "Renewal",
  },
  {
    verse: "The earth is the LORD's, and the fulness thereof; the world, and they that dwell therein.",
    reference: "Psalm 24:1",
    reflection: "Everything belongs to God — every mountain, every ocean, every soul. When we grasp this truth, gratitude replaces entitlement, and stewardship replaces ownership.",
    prayer: "Lord, help me remember that all I have is Yours. Make me a faithful steward of Your blessings. Amen.",
    theme: "Gratitude",
  },
  {
    verse: "Let all that you do be done in love.",
    reference: "1 Corinthians 16:14",
    reflection: "Love is not merely a feeling — it is the foundation of every godly action. When love motivates our words, our work, and our worship, everything we do takes on eternal significance.",
    prayer: "Lord, let love be the motivation behind everything I do today. Amen.",
    theme: "Love",
  },
];

export function getDailyDevotional(): Devotional {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return devotionals[dayOfYear % devotionals.length];
}

export function getRandomDevotional(): Devotional {
  return devotionals[Math.floor(Math.random() * devotionals.length)];
}
