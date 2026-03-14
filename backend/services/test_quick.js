import { executeCode } from "./codeExecutor.service.js";

async function run() {
    console.log("Starting quick test...");
    const res = await executeCode("print('fast test')", "python");
    console.log("Quick Result:", res.execution_status);
    console.log("Output:", res.output);
}
run();
