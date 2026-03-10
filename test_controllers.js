import { getStats, getMasterSubjects } from './backend/controllers/hod.controller.js';

async function testControllers() {
    const mockRes = {
        json: (data) => console.log('JSON:', JSON.stringify(data, null, 2)),
        status: (code) => {
            console.log('Status:', code);
            return mockRes;
        }
    };

    console.log('--- Testing getStats ---');
    await getStats({}, mockRes);

    console.log('\n--- Testing getMasterSubjects ---');
    await getMasterSubjects({}, mockRes);
}

testControllers();
