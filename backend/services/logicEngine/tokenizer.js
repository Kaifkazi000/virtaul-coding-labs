/**
 * Logic Tokenizer Service
 * Extracts logical patterns from normalized code.
 */

const LOGIC_PATTERNS = [
               { type: "L_IF", regex: /\bif\s*\(/g },
               { type: "L_ELSE", regex: /\belse\b/g },
               { type: "L_FOR", regex: /\bfor\s*\(/g },
               { type: "L_WHILE", regex: /\bwhile\s*\(/g },
               { type: "L_DO", regex: /\bdo\s*\{/g },
               { type: "L_SWITCH", regex: /\bswitch\s*\(/g },
               { type: "L_CASE", regex: /\bcase\b/g },
               { type: "L_BREAK", regex: /\bbreak\b/g },
               { type: "L_CONTINUE", regex: /\bcontinue\b/g },
               { type: "L_RETURN", regex: /\breturn\b/g },
               { type: "L_TRY", regex: /\btry\s*\{/g },
               { type: "L_CATCH", regex: /\bcatch\s*\(/g },
               { type: "L_FUNC_DEF", regex: /\b(def|function|void|int|float|double|char|public|private)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g },
               { type: "L_ASSIGN", regex: /[a-zA-Z_][a-zA-Z0-9_]*\s*=[^=]/g }, // Matches 'x = 5' but not 'x == 5'
               { type: "L_COMPARE", regex: /(==|!=|<=|>=|<|>)/g },
               { type: "L_MATH", regex: /(\+|\-|\*|\/|%|\+\+|\-\-)/g },
               { type: "L_LOGIC", regex: /(&&|\|\||!)/g },
               { type: "L_PRINT", regex: /\b(printf|cout|System\.out\.println|print)\s*\(/g },
               { type: "L_CLASS", regex: /\bclass\s+[a-zA-Z_][a-zA-Z0-9_]*/g },
               { type: "L_MAIN", regex: /\bmain\s*\(/g },
];

/**
 * Converts code into an array of logic tokens.
 */
export const tokenizeLogic = (normalizedCode) => {
               if (!normalizedCode) return [];

               const tokens = [];

               // We'll scan the code line by line and find matches
               // A better approach would be char-by-char or word-by-word, 
               // but for similarity detection, sequence of structures is usually enough.

               const lines = normalizedCode.split("\n");

               lines.forEach((line) => {
                              LOGIC_PATTERNS.forEach((pattern) => {
                                             const matches = line.match(pattern.regex);
                                             if (matches) {
                                                            matches.forEach(() => {
                                                                           tokens.push(pattern.type);
                                                            });
                                             }
                              });
               });

               return tokens;
};

/**
 * Generates a frequency map of tokens for Jaccard Similarity.
 */
export const getTokenFrequencies = (tokens) => {
               const frequencies = {};
               tokens.forEach((token) => {
                              frequencies[token] = (frequencies[token] || 0) + 1;
               });
               return frequencies;
};

/**
 * Generates a unique string representation of the logic flow.
 */
export const getLogicFingerprint = (tokens) => {
               return tokens.join("|");
};
