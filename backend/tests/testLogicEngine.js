import { analyzeLogic, checkIntegrity } from '../services/logicEngine/index.js';

const sampleCode = `
# Boilerplate
def main():
    pass
`;

const student1 = `
def sum_numbers(a, b):
    # This is a comment
    result = a + b
    for i in range(10):
        print(i)
    if result > 0:
        return True
    return False
`;

const student2 = `
def add_nums(x, y):
    val = x + y
    for k in range(10):
        print(k)
    if val > 0:
        return True
    return False
`;

const student3 = `
def process():
    print("Different logic")
    while True:
        break
`;

console.log("--- Testing Student 1 ---");
const res1 = analyzeLogic(student1, 'Python');
console.log("Tokens 1:", res1.tokens);

console.log("\n--- Testing Student 2 (Renamed Variables) ---");
const res2 = analyzeLogic(student2, 'Python');
console.log("Tokens 2:", res2.tokens);

console.log("\n--- Integrity Check: Student 2 (Renamed Vars) against Student 1 ---");
const integrity = checkIntegrity(student2, 'Python', [{ code: student1, logic_hash: res1.logicHash, id: 'sub_1' }], sampleCode);
console.log("Similarity Score:", integrity.similarityScore + "%");
console.log("Flagged:", integrity.flagged);
console.log("Matching ID:", integrity.matchingSubmissionId);

console.log("\n--- Integrity Check: Student 3 (Different Logic) against Student 1 ---");
const integrity3 = checkIntegrity(student3, 'Python', [{ code: student1, logic_hash: res1.logicHash, id: 'sub_1' }], sampleCode);
console.log("Similarity Score:", integrity3.similarityScore + "%");
console.log("Flagged:", integrity3.flagged);
console.log("Matching ID:", integrity3.matchingSubmissionId);
