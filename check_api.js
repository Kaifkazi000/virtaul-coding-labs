const fetch = require('node-fetch');

async function checkApi() {
    const endpoints = [
        'http://localhost:5000/api/hod/stats',
        'http://localhost:5000/api/hod/master-subjects',
        'http://localhost:5000/api/hod/teachers'
    ];

    for (const url of endpoints) {
        console.log(`Checking ${url}...`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status} ${res.statusText}`);
            if (res.ok) {
                const data = await res.json();
                console.log('Data:', JSON.stringify(data, null, 2).substring(0, 500));
            } else {
                const text = await res.text();
                console.log('Error Body:', text);
            }
        } catch (err) {
            console.log('Fetch Error:', err.message);
        }
        console.log('-------------------');
    }
}

checkApi();
