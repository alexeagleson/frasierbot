export const ARG_0_OPTS = ["!f", "!frasierbot", "f!"] as const;
export const ARG_1_OPTS = ["learn", "forget", "list"] as const;
export const ARG_2_OPTS = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "character",
  "exclamation",
  "quote"
] as const;

export type ARG_0 = typeof ARG_0_OPTS[number];
export type ARG_1 = typeof ARG_1_OPTS[number];
export type ARG_2 = typeof ARG_2_OPTS[number];
export type ARG_3 = string;
