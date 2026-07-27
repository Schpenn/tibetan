export interface TibetanLetter {
  id: string;
  tibetan: string;
  wylie: string;
  pronunciation: string;
  category: 'consonant' | 'vowel';
}

export const CONSONANTS: TibetanLetter[] = [
  { id: 'ka',  tibetan: 'ཀ', wylie: 'ka',  pronunciation: 'ka (like "car")',         category: 'consonant' },
  { id: 'kha', tibetan: 'ཁ', wylie: 'kha', pronunciation: 'kha (aspirated k)',       category: 'consonant' },
  { id: 'ga',  tibetan: 'ག', wylie: 'ga',  pronunciation: 'ga (like "go")',           category: 'consonant' },
  { id: 'nga', tibetan: 'ང', wylie: 'nga', pronunciation: 'nga (like "sing-a")',      category: 'consonant' },
  { id: 'ca',  tibetan: 'ཅ', wylie: 'ca',  pronunciation: 'ca (like "ch" soft)',      category: 'consonant' },
  { id: 'cha', tibetan: 'ཆ', wylie: 'cha', pronunciation: 'cha (aspirated ch)',       category: 'consonant' },
  { id: 'ja',  tibetan: 'ཇ', wylie: 'ja',  pronunciation: 'ja (like "jar")',          category: 'consonant' },
  { id: 'nya', tibetan: 'ཉ', wylie: 'nya', pronunciation: 'nya (like "canyon")',      category: 'consonant' },
  { id: 'ta',  tibetan: 'ཏ', wylie: 'ta',  pronunciation: 'ta (like "top")',          category: 'consonant' },
  { id: 'tha', tibetan: 'ཐ', wylie: 'tha', pronunciation: 'tha (aspirated t)',        category: 'consonant' },
  { id: 'da',  tibetan: 'ད', wylie: 'da',  pronunciation: 'da (like "dog")',          category: 'consonant' },
  { id: 'na',  tibetan: 'ན', wylie: 'na',  pronunciation: 'na (like "no")',           category: 'consonant' },
  { id: 'pa',  tibetan: 'པ', wylie: 'pa',  pronunciation: 'pa (like "pot")',          category: 'consonant' },
  { id: 'pha', tibetan: 'ཕ', wylie: 'pha', pronunciation: 'pha (aspirated p)',        category: 'consonant' },
  { id: 'ba',  tibetan: 'བ', wylie: 'ba',  pronunciation: 'ba (like "bat")',          category: 'consonant' },
  { id: 'ma',  tibetan: 'མ', wylie: 'ma',  pronunciation: 'ma (like "map")',          category: 'consonant' },
  { id: 'tsa', tibetan: 'ཙ', wylie: 'tsa', pronunciation: 'tsa (like "cats")',        category: 'consonant' },
  { id: 'tsha',tibetan: 'ཚ', wylie: 'tsha',pronunciation: 'tsha (aspirated ts)',      category: 'consonant' },
  { id: 'dza', tibetan: 'ཛ', wylie: 'dza', pronunciation: 'dza (like "adze")',        category: 'consonant' },
  { id: 'wa',  tibetan: 'ཝ', wylie: 'wa',  pronunciation: 'wa (like "water")',        category: 'consonant' },
  { id: 'zha', tibetan: 'ཞ', wylie: 'zha', pronunciation: 'zha (like "measure")',     category: 'consonant' },
  { id: 'za',  tibetan: 'ཟ', wylie: 'za',  pronunciation: 'za (like "zebra")',        category: 'consonant' },
  { id: "'a",  tibetan: 'འ', wylie: "'a",  pronunciation: "'a (soft glottal)",        category: 'consonant' },
  { id: 'ya',  tibetan: 'ཡ', wylie: 'ya',  pronunciation: 'ya (like "yes")',          category: 'consonant' },
  { id: 'ra',  tibetan: 'ར', wylie: 'ra',  pronunciation: 'ra (like "row")',           category: 'consonant' },
  { id: 'la',  tibetan: 'ལ', wylie: 'la',  pronunciation: 'la (like "law")',           category: 'consonant' },
  { id: 'sha', tibetan: 'ཤ', wylie: 'sha', pronunciation: 'sha (like "shoe")',        category: 'consonant' },
  { id: 'sa',  tibetan: 'ས', wylie: 'sa',  pronunciation: 'sa (like "sun")',           category: 'consonant' },
  { id: 'ha',  tibetan: 'ཧ', wylie: 'ha',  pronunciation: 'ha (like "hat")',           category: 'consonant' },
  { id: 'a',   tibetan: 'ཨ', wylie: 'a',   pronunciation: 'a (like "ah")',             category: 'consonant' },
];

export const VOWELS: TibetanLetter[] = [
  { id: 'i',  tibetan: 'ཨི', wylie: 'i',  pronunciation: 'i (like "ee")',  category: 'vowel' },
  { id: 'u',  tibetan: 'ཨུ', wylie: 'u',  pronunciation: 'u (like "oo")',  category: 'vowel' },
  { id: 'e',  tibetan: 'ཨེ', wylie: 'e',  pronunciation: 'e (like "ay")',  category: 'vowel' },
  { id: 'o',  tibetan: 'ཨོ', wylie: 'o',  pronunciation: 'o (like "oh")',  category: 'vowel' },
];

export const ALL_LETTERS = [...CONSONANTS, ...VOWELS];
