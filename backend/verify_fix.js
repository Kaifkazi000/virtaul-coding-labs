import { executeCode } from './services/codeExecutor.service.js';

async function test() {
  console.log("--- Testing Java Practical with Python Code ---");
  const pyInJava = await executeCode('print("hello world")', 'java');
  console.log("Java Mode (Python Code) Result:", pyInJava.execution_status);
  console.log("Error Output:", pyInJava.error);

  console.log("\n--- Testing Valid Python Code ---");
  const validPy = await executeCode('print("hello world")', 'python');
  console.log("Python Mode (Python Code) Result:", validPy.execution_status);
  console.log("Output:", validPy.output);

  console.log("\n--- Testing Java Compilation Error ---");
  const invalidJava = await executeCode('public class Main { public static void main(String[] args) { System.out.println("hi") } }', 'java'); // Missing semicolon
  console.log("Java Mode (Invalid Code) Result:", invalidJava.execution_status);
  console.log("Error Output:", invalidJava.error);
}

test();
