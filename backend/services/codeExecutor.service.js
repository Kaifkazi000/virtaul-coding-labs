import axios from "axios";

/**
 * Code Execution Service
 * Supports: Python, Java, C++, SQL, OS (C), OLAP
 * 
 * Phase 1: Piston API (Quick Start)
 * Phase 2: Custom Docker (Production)
 */

const ONECOMPILER_API_URL = "https://onecompiler.com/api/code/exec";

/**
 * Execute code using OneCompiler API (Fallback for Piston)
 */
export const executeCodeWithOneCompiler = async (code, language) => {
  try {
    const normalizedLang = language.toLowerCase();
    
    // OneCompiler mapping
    const languageMap = {
      python: { name: "Python", mode: "python", extension: "py" },
      java: { name: "Java", mode: "java", extension: "java" },
      cpp: { name: "C++", mode: "cpp", extension: "cpp" },
      "c++": { name: "C++", mode: "cpp", extension: "cpp" },
      c: { name: "C", mode: "c", extension: "c" },
      os: { name: "C", mode: "c", extension: "c" },
      javascript: { name: "JavaScript", mode: "javascript", extension: "js" },
      js: { name: "JavaScript", mode: "javascript", extension: "js" },
      sql: { name: "MySQL", mode: "mysql", extension: "sql" }
    };

    const langConfig = languageMap[normalizedLang];
    if (!langConfig) throw new Error(`Unsupported language: ${language}`);

    const payload = {
      name: langConfig.name,
      title: `Main.${langConfig.extension}`,
      version: "latest",
      mode: langConfig.mode,
      extension: langConfig.extension,
      languageType: "programming",
      active: true,
      properties: {
        language: langConfig.mode,
        files: [{ name: `Main.${langConfig.extension}`, content: code }]
      }
    };

    const response = await axios.post(ONECOMPILER_API_URL, payload, { timeout: 15000 });
    const result = response.data;

    // Strict status detection: fail if there's an exception, stderr, or non-zero exit code (if provided)
    const hasError = !!(result.exception || result.stderr?.trim());
    const executionStatus = hasError ? "failed" : "success";
    
    const output = result.stdout || "";
    const error = result.stderr || result.exception || "";

    return {
      execution_status: executionStatus,
      output: output.trim(),
      error: error.trim(),
      execution_time_ms: result.executionTime || 0,
      memory_used_kb: result.memoryUsed || 0,
    };
  } catch (err) {
    console.error("[OneCompiler] Error:", err.message);
    return {
      execution_status: "error",
      output: "",
      error: err.message || "Execution failed",
      execution_time_ms: 0,
      memory_used_kb: 0,
    };
  }
};

/**
 * Execute code using Piston API (Optional fallback)
 */
export const executeCodeWithPiston = async (code, language, version = null) => {
  // We keep this but default to OneCompiler for now due to Piston 401
  return await executeCodeWithOneCompiler(code, language);
};

/**
 * Get filename based on language
 */
const getFileName = (normalizedLang) => {
  const fileMap = {
    python: "main.py",
    java: "Main.java",
    cpp: "main.cpp",
    "c++": "main.cpp",
    c: "main.c",
    os: "main.c",
    javascript: "main.js",
    js: "main.js",
  };
  return fileMap[normalizedLang] || "main.txt";
};

/**
 * Execute SQL queries (Custom handler)
 * For now, basic validation. In production, connect to test database.
 */
const executeSQL = async (code) => {
  // Basic SQL validation
  const sqlKeywords = ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP"];
  const hasValidKeyword = sqlKeywords.some((keyword) =>
    code.toUpperCase().includes(keyword)
  );

  if (!hasValidKeyword) {
    return {
      execution_status: "failed",
      output: "",
      error: "Invalid SQL query. Must contain a valid SQL keyword.",
      execution_time_ms: 0,
      memory_used_kb: 0,
    };
  }

  // TODO: In production, execute against test database
  // For now, mock successful execution
  return {
    execution_status: "success",
    output: "Query executed successfully (mock)\nRows affected: 0",
    error: "",
    execution_time_ms: 50,
    memory_used_kb: 0,
  };
};

/**
 * Execute OLAP queries (Mock for now)
 */
const executeOLAP = async (code) => {
  // Mock execution - can be enhanced later
  return {
    execution_status: "success",
    output: "OLAP query executed successfully (mock)",
    error: "",
    execution_time_ms: 100,
    memory_used_kb: 0,
  };
};

/**
 * Main execution function
 */
export const executeCode = async (code, language, version = null) => {
  if (!code || code.trim().length === 0) {
    return {
      execution_status: "failed",
      output: "",
      error: "Code cannot be empty",
      execution_time_ms: 0,
      memory_used_kb: 0,
    };
  }

  // Use Piston API for execution
  return await executeCodeWithPiston(code, language, version);
};
