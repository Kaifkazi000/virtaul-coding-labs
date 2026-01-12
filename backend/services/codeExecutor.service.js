import axios from "axios";

/**
 * Code Execution Service
 * Supports: Python, Java, C++, SQL, OS (C), OLAP
 * 
 * Phase 1: Piston API (Quick Start)
 * Phase 2: Custom Docker (Production)
 */

const PISTON_API_URL = process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";

/**
 * Execute code using Piston API
 */
export const executeCodeWithPiston = async (code, language, version = null) => {
  try {
    // Language mapping
    const languageMap = {
      Python: { name: "python", defaultVersion: "3.10.0" },
      Java: { name: "java", defaultVersion: "15.0.2" },
      "C++": { name: "cpp", defaultVersion: "10.2.0" },
      C: { name: "c", defaultVersion: "10.2.0" },
      OS: { name: "c", defaultVersion: "10.2.0" }, // OS uses C
      SQL: { name: "sql", defaultVersion: null }, // Custom handler
      OLAP: { name: "python", defaultVersion: "3.10.0" }, // Mock for now
    };

    const langConfig = languageMap[language];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // SQL requires custom handling
    if (language === "SQL") {
      return await executeSQL(code);
    }

    // OLAP - mock execution for now
    if (language === "OLAP") {
      return await executeOLAP(code);
    }

    const langName = langConfig.name;
    const langVersion = version || langConfig.defaultVersion;

    // Execute via Piston API
    const response = await axios.post(`${PISTON_API_URL}/execute`, {
      language: langName,
      version: langVersion,
      files: [
        {
          name: getFileName(language),
          content: code,
        },
      ],
      stdin: "",
      args: [],
      run_timeout: 5000, // 5 seconds
      memory_limit: 128 * 1024 * 1024, // 128 MB
    }, {
      timeout: 10000, // 10 seconds total timeout
    });

    const result = response.data;

    // Parse execution result
    const executionStatus = result.run?.code === 0 ? "success" : "failed";
    const output = result.run?.stdout || "";
    const error = result.run?.stderr || "";
    const executionTime = result.run?.time ? parseFloat(result.run.time) * 1000 : 0; // Convert to ms

    return {
      execution_status: executionStatus,
      output: output.trim(),
      error: error.trim(),
      execution_time_ms: Math.round(executionTime),
      memory_used_kb: 0, // Piston doesn't provide this
    };
  } catch (err) {
    // Handle timeout or API errors
    if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
      return {
        execution_status: "timeout",
        output: "",
        error: "Execution timeout: Code took too long to execute",
        execution_time_ms: 5000,
        memory_used_kb: 0,
      };
    }

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
 * Get filename based on language
 */
const getFileName = (language) => {
  const fileMap = {
    Python: "main.py",
    Java: "Main.java",
    "C++": "main.cpp",
    C: "main.c",
    OS: "main.c",
  };
  return fileMap[language] || "main.py";
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
