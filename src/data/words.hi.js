/**
 * Hindi word list for reading task
 * Each word has marked (with matras) and unmarked versions for assessment
 */

export const hindiWords = [
  // SIMPLE MATRA WORDS
  { id: 'word_hi_9', unmarked: 'घर', marked: 'घर', english: 'House', difficulty: 'easy', tests: 'base_consonant' },
  { id: 'word_hi_10', unmarked: 'पेड़', marked: 'पेड़', english: 'Tree', difficulty: 'easy', tests: 'e_matra' },
  { id: 'word_hi_11', unmarked: 'गाय', marked: 'गाय', english: 'Cow', difficulty: 'easy', tests: 'aa_matra' },
  { id: 'word_hi_12', unmarked: 'गीत', marked: 'गीत', english: 'Song', difficulty: 'easy', tests: 'ii_matra' },
  { id: 'word_hi_13', unmarked: 'हाथ', marked: 'हाथ', english: 'Hand', difficulty: 'easy', tests: 'aa_matra' },
  { id: 'word_hi_14', unmarked: 'फूल', marked: 'फूल', english: 'Flower', difficulty: 'easy', tests: 'uu_matra' },
  { id: 'word_hi_15', unmarked: 'दूध', marked: 'दूध', english: 'Milk', difficulty: 'easy', tests: 'uu_matra' },
  { id: 'word_hi_16', unmarked: 'भूख', marked: 'भूख', english: 'Hunger', difficulty: 'easy', tests: 'uu_matra' },

  // SIMILAR LETTER PAIRS — ब/व and ध/भ are the most confused in Hindi
  { id: 'word_hi_17', unmarked: 'बल', marked: 'बल', english: 'Strength', difficulty: 'medium', tests: 'similar_ba_va' },
  { id: 'word_hi_18', unmarked: 'वन', marked: 'वन', english: 'Forest', difficulty: 'medium', tests: 'similar_ba_va' },
  { id: 'word_hi_19', unmarked: 'धन', marked: 'धन', english: 'Wealth', difficulty: 'medium', tests: 'similar_dha_bha' },
  { id: 'word_hi_20', unmarked: 'भाई', marked: 'भाई', english: 'Brother', difficulty: 'medium', tests: 'similar_dha_bha' },
  { id: 'word_hi_21', unmarked: 'गाँव', marked: 'गाँव', english: 'Village', difficulty: 'medium', tests: 'aa_matra' },
  { id: 'word_hi_22', unmarked: 'चिड़िया', marked: 'चिड़िया', english: 'Bird', difficulty: 'medium', tests: 'ii_matra' },
  { id: 'word_hi_23', unmarked: 'बादल', marked: 'बादल', english: 'Cloud', difficulty: 'medium', tests: 'aa_matra' },

  // CONJUNCTS
  { id: 'word_hi_24', unmarked: 'प्यार', marked: 'प्यार', english: 'Love', difficulty: 'hard', tests: 'conjunct_pya' },
  { id: 'word_hi_25', unmarked: 'ध्यान', marked: 'ध्यान', english: 'Attention', difficulty: 'hard', tests: 'conjunct_dhya' },
  { id: 'word_hi_26', unmarked: 'स्कूल', marked: 'स्कूल', english: 'School', difficulty: 'hard', tests: 'conjunct_ska' },
  { id: 'word_hi_27', unmarked: 'ज्ञान', marked: 'ज्ञान', english: 'Knowledge', difficulty: 'hard', tests: 'conjunct_gya' },
  { id: 'word_hi_28', unmarked: 'क्षमा', marked: 'क्षमा', english: 'Forgiveness', difficulty: 'hard', tests: 'conjunct_ksha' },
];
