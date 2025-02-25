const excludedKeywords = [
  'vietsub',
  'thuyết minh',
  'full',
  'hd',
  'phimmoi',
  'phimmoi1s',
  'tập',
  'full hd',
  'fullhd',
  'episode',
  'thuyet minh',
  '2024',
  'cotranghoangu',
];

export const filterSearchQuery = (search: string): string => {
  const keywords = search
    .split(/\s+/)
    .filter((word) => !excludedKeywords.includes(word.toLowerCase()));
  // .map((word) => {
  //   if (word.match(/^\d+$/)) {
  //     return undefined;
  //   }
  //   return word;
  // })
  // .filter((word) => word);
  return keywords.join(' ');
};
