/**
 * Similarity Calculation Service
 * Implements Jaccard Similarity and template-aware comparison.
 */

import { getTokenFrequencies } from "./tokenizer.js";

/**
 * Calculates Jaccard Similarity between two sets of tokens.
 * J(A, B) = |A ∩ B| / |A ∪ B|
 */
export const calculateJaccardSimilarity = (tokensA, tokensB) => {
               if (!tokensA.length || !tokensB.length) return 0;

               const setA = new Set(tokensA);
               const setB = new Set(tokensB);

               const intersection = new Set([...setA].filter(x => setB.has(x)));
               const union = new Set([...setA, ...setB]);

               return (intersection.size / union.size) * 100;
};

/**
 * Alternative: Weighted Similarity based on frequencies
 * This is better if multiple loops or if-statements are used.
 */
export const calculateWeightedSimilarity = (tokensA, tokensB) => {
               if (!tokensA.length || !tokensB.length) return 0;

               const freqA = getTokenFrequencies(tokensA);
               const freqB = getTokenFrequencies(tokensB);

               const allTokens = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);

               let intersectionCount = 0;
               let unionCount = 0;

               allTokens.forEach(token => {
                              const countA = freqA[token] || 0;
                              const countB = freqB[token] || 0;

                              intersectionCount += Math.min(countA, countB);
                              unionCount += Math.max(countA, countB);
               });

               if (unionCount === 0) return 0;
               return (intersectionCount / unionCount) * 100;
};

/**
 * "Subtracts" template tokens from the student's tokens.
 * This ensures we only grade/compare the code the student actually wrote.
 */
export const subtractTemplateTokens = (studentTokens, templateTokens) => {
               if (!templateTokens.length) return studentTokens;

               const templateFreq = getTokenFrequencies(templateTokens);
               const studentFreq = getTokenFrequencies(studentTokens);

               const originalTokens = [...studentTokens];
               const resultingTokens = [];

               // We maintain a tracker of how many template tokens we've "used up"
               const usedTemplateFreq = { ...templateFreq };

               originalTokens.forEach(token => {
                              if (usedTemplateFreq[token] > 0) {
                                             // This token is part of the template, so we skip adding it
                                             usedTemplateFreq[token]--;
                              } else {
                                             // This token is unique to the student
                                             resultingTokens.push(token);
                              }
               });

               return resultingTokens;
};

/**
 * Main similarity check function
 */
export const compareSubmissions = (studentTokens, otherTokens, templateTokens = []) => {
               // 1. Remove template tokens from both sides
               const studentUnique = subtractTemplateTokens(studentTokens, templateTokens);
               const otherUnique = subtractTemplateTokens(otherTokens, templateTokens);

               // 2. If after subtraction, the student has very little code left, 
               // it means they only used the template.
               if (studentUnique.length < 1) return 0;

               // 3. Calculate similarity
               return calculateWeightedSimilarity(studentUnique, otherUnique);
};
