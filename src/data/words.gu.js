/**
 * Gujarati word list for reading task
 * Each word has marked (with matras) and unmarked versions for assessment
 */

export const gujaratiWords = [
  // SIMPLE MATRA WORDS — child must read the vowel diacritic correctly
  // These are the most sensitive dyslexia indicators in Indic scripts
  { id: 'word_gu_9', unmarked: 'ઘર', marked: 'ઘર', english: 'House', difficulty: 'easy', tests: 'base_consonant' },
  { id: 'word_gu_10', unmarked: 'ઝાડ', marked: 'ઝાડ', english: 'Tree', difficulty: 'easy', tests: 'aa_matra' },
  { id: 'word_gu_11', unmarked: 'ગાય', marked: 'ગાય', english: 'Cow', difficulty: 'easy', tests: 'aa_matra' },
  { id: 'word_gu_12', unmarked: 'ગીત', marked: 'ગીત', english: 'Song', difficulty: 'easy', tests: 'ii_matra' },
  { id: 'word_gu_13', unmarked: 'ઘી', marked: 'ઘી', english: 'Ghee', difficulty: 'easy', tests: 'ii_matra' },
  { id: 'word_gu_14', unmarked: 'ફૂલ', marked: 'ફૂલ', english: 'Flower', difficulty: 'easy', tests: 'uu_matra' },
  { id: 'word_gu_15', unmarked: 'દૂધ', marked: 'દૂધ', english: 'Milk', difficulty: 'easy', tests: 'uu_matra' },
  { id: 'word_gu_16', unmarked: 'ભૂખ', marked: 'ભૂખ', english: 'Hunger', difficulty: 'easy', tests: 'uu_matra' },

  // SIMILAR LETTER PAIRS — ઘ/ધ and ણ/ન are the most confused in Gujarati
  // Present these in sequence; a child with dyslexia will flip them
  { id: 'word_gu_17', unmarked: 'ઘર', marked: 'ઘર', english: 'House', difficulty: 'medium', tests: 'similar_gha_dha' },
  { id: 'word_gu_18', unmarked: 'ધન', marked: 'ધન', english: 'Wealth', difficulty: 'medium', tests: 'similar_gha_dha' },
  { id: 'word_gu_19', unmarked: 'ઘણ', marked: 'ઘણ', english: 'Hammer', difficulty: 'medium', tests: 'similar_na_na' },
  { id: 'word_gu_20', unmarked: 'ઘણું', marked: 'ઘણું', english: 'Much', difficulty: 'medium', tests: 'similar_na_na' },
  { id: 'word_gu_21', unmarked: 'ચકલી', marked: 'ચકલી', english: 'Sparrow', difficulty: 'medium', tests: 'ii_matra' },
  { id: 'word_gu_22', unmarked: 'ગામ', marked: 'ગામ', english: 'Village', difficulty: 'medium', tests: 'aa_matra' },
  { id: 'word_gu_23', unmarked: 'બારી', marked: 'બારી', english: 'Window', difficulty: 'medium', tests: 'ii_matra' },

  // CONJUNCTS — ordered by frequency; ત્ર is the most common, start there
  { id: 'word_gu_24', unmarked: 'ત્રણ', marked: 'ત્રણ', english: 'Three', difficulty: 'hard', tests: 'conjunct_tra' },
  { id: 'word_gu_25', unmarked: 'પ્રેમ', marked: 'પ્રેમ', english: 'Love', difficulty: 'hard', tests: 'conjunct_pra' },
  { id: 'word_gu_26', unmarked: 'સ્કૂલ', marked: 'સ્કૂલ', english: 'School', difficulty: 'hard', tests: 'conjunct_ska' },
  { id: 'word_gu_27', unmarked: 'ખ્યાલ', marked: 'ખ્યાલ', english: 'Thought', difficulty: 'hard', tests: 'conjunct_khya' },
  { id: 'word_gu_28', unmarked: 'જ્ઞાન', marked: 'જ્ઞાન', english: 'Knowledge', difficulty: 'hard', tests: 'conjunct_gya' },
];
