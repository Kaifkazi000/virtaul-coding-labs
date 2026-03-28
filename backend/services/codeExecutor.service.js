import axios from "axios";

/**
 * Code Execution Service using Judge0
 * Supports: Python, Java, C, C++, JavaScript, SQL, Lex/Flex
 */

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com"; // Default to public CE
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";

/**
 * Map of language names to Judge0 Language IDs
 */
const LANGUAGE_ID_MAP = {
  "c": 75,           // C (Clang 7.0.1) or (GCC 9.2.0)
  "cpp": 76,         // C++ (Clang 7.0.1) or (GCC 9.2.0)
  "c++": 76,
  "java": 62,        // Java (OpenJDK 13.0.1)
  "python": 71,      // Python (3.8.1)
  "javascript": 63,  // JavaScript (Node.js 12.14.0)
  "js": 63,
  "sql": 82,         // SQL (SQLite 3.31.1)
  "lex": 75,         // Lex is usually run as C after flex processing, but Judge0 extra-ce has it. 
                     // Falling back to C (75) for standard CE instances.
};

/**
 * Poll Judge0 for result
 */
const pollResult = async (token) => {
  const maxTries = 10;
  const interval = 1500; // 1.5s
  
  for (let i = 0; i < maxTries; i++) {
    const config = {
      headers: RAPIDAPI_KEY ? {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
      } : {}
    };

    const response = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false&wait=false`, config);
    const result = response.data;
    
    // Status IDs: 1: In Queue, 2: Processing, 3: Accepted, etc.
    if (result.status.id >= 3) {
      return result;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error("Execution timed out (polling)");
};

export const executeCode = async (code, language, version = null, stdin = "") => {
  try {
    if (!code || code.trim().length === 0) {
      return { execution_status: "failed", output: "", error: "Code cannot be empty" };
    }

    const normalizedLang = language.toLowerCase();
    const languageId = LANGUAGE_ID_MAP[normalizedLang];

    if (!languageId) {
      return { execution_status: "error", output: "", error: `Unsupported language: ${language}` };
    }

    console.log(`[Judge0] Submitting ${normalizedLang} code (stdin length: ${stdin?.length || 0})...`);
    
    const payload = {
      source_code: code,
      language_id: languageId,
      stdin: stdin || "",
    };

    const config = {
      headers: RAPIDAPI_KEY ? {
        "content-type": "application/json",
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
      } : {
        "content-type": "application/json"
      }
    };

    // 1. Submit
    const submitResponse = await axios.post(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, payload, config);
    const { token } = submitResponse.data;
    console.log(`[Judge0] Submission Token: ${token}`);

    if (!token) throw new Error("Failed to get submission token from Judge0");

    // 2. Poll
    const result = await pollResult(token);

    // 3. Parse Result
    const status = result.status.description.toLowerCase();
    let execution_status = "failed";
    
    if (status === "accepted") {
      execution_status = "success";
    }

    const output = (result.stdout || "").trim();
    const error = (result.stderr || result.compile_output || result.message || "").trim();

    return {
      execution_status,
      output,
      error,
      execution_time_ms: Math.round(parseFloat(result.time || "0") * 1000),
      memory_used_kb: result.memory || 0,
    };

  } catch (err) {
    console.error("[Judge0] Error:", err.response?.data || err.message);
    return {
       execution_status: "error",
       output: "",
       error: err.response?.data?.message || err.message || "Execution service unavailable",
       execution_time_ms: 0,
       memory_used_kb: 0
    };
  }
};
