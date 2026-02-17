/**
 * Code Normalization Service
 * Handles stripping comments and normalizing whitespace for different languages.
 */

/**
 * Strips comments from the code string based on common patterns.
 * Supports C-style (//, /* * /) and Python-style (#).
 */
export const stripComments = (code, language = "") => {
               if (!code) return "";

               let cleaned = code;

               // Remove C-style multi-line comments: /* ... */
               cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "");

               // Remove C-style single-line comments: // ...
               cleaned = cleaned.replace(/\/\/.*$/gm, "");

               // Remove Python-style single-line comments: # ...
               if (language.toLowerCase() === "python" || !language) {
                              cleaned = cleaned.replace(/#.*$/gm, "");
               }

               // Remove Python-style docstrings/multi-line strings used as comments
               if (language.toLowerCase() === "python") {
                              cleaned = cleaned.replace(/'''[\s\S]*?'''/g, "");
                              cleaned = cleaned.replace(/"""[\s\S]*?"""/g, "");
               }

               return cleaned;
};

/**
 * Normalizes' whitespace and removes empty lines.
 */
export const normalizeWhitespace = (code) => {
               if (!code) return "";

               return code
                              .split("\n")
                              .map((line) => line.trim()) // Trim each line
                              .filter((line) => line.length > 0) // Remove empty lines
                              .join("\n") // Join back with single newlines
                              .replace(/[ \t]+/g, " "); // Replace multiple spaces/tabs with a single space
};

/**
 * Placeholder substitution (Logic-Only mode)
 * Replaces potential variable/function names with generic placeholders.
 * Note: This is a basic implementation. A full AST parser would be more accurate.
 */
export const applyPlaceholders = (code) => {
               // Simple regex to find words that aren't keywords (very basic)
               const keywords = [
                              "if", "else", "for", "while", "return", "def", "function", "class",
                              "public", "private", "int", "float", "char", "void", "import", "from",
                              "include", "main", "printf", "cout", "cin", "System", "out", "println"
               ];

               // This is a simplified version; for production, we'd use a real tokenizer.
               return code;
};

/**
 * Main normalize function
 */
export const normalizeCode = (code, language) => {
               let normalized = stripComments(code, language);
               normalized = normalizeWhitespace(normalized);
               // We keep variable names for now to allow for partial matching later, 
               // but we strip them in the tokenizer step.
               return normalized;
};
