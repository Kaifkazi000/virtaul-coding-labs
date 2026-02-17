/**
 * Logic Engine Entry Point
 * Provides a unified API for code logic analysis.
 */

import { normalizeCode } from "./normalize.js";
import { tokenizeLogic, getLogicFingerprint } from "./tokenizer.js";
import { compareSubmissions } from "./similarity.js";

/**
 * Analyzes a single piece of code and returns its logic fingerprint and tokens.
 */
export const analyzeLogic = (code, language) => {
               const normalized = normalizeCode(code, language);
               const tokens = tokenizeLogic(normalized);
               const fingerprint = getLogicFingerprint(tokens);

               return {
                              normalized,
                              tokens,
                              fingerprint,
               };
};

/**
 * Compares a new submission against a set of existing submissions.
 * Returns the highest similarity score and the ID of the matched submission.
 * 
 * @param {string} newCode - The code being submitted
 * @param {string} language - Programming language
 * @param {Array} existingSubmissions - Array of { id, code, tokens }
 * @param {string} sampleCode - The teacher provided template code
 */
export const checkIntegrity = (newCode, language, existingSubmissions, sampleCode = "") => {
               const studentResult = analyzeLogic(newCode, language);
               const templateResult = sampleCode ? analyzeLogic(sampleCode, language) : { tokens: [] };

               let maxSimilarity = 0;
               let matchingSubmissionId = null;

               existingSubmissions.forEach((existing) => {
                              // We assume existing submissions are already tokenized to save time,
                              // but if not, we tokenize them here.
                              const existingTokens = existing.tokens || analyzeLogic(existing.code, existing.language || language).tokens;

                              const similarity = compareSubmissions(
                                             studentResult.tokens,
                                             existingTokens,
                                             templateResult.tokens
                              );

                              if (similarity > maxSimilarity) {
                                             maxSimilarity = similarity;
                                             matchingSubmissionId = existing.id;
                              }
               });

               return {
                              similarityScore: Math.round(maxSimilarity),
                              flagged: maxSimilarity >= 70,
                              logicHash: studentResult.fingerprint, // Storing the full fingerprint/hash
                              matchingSubmissionId,
               };
};
