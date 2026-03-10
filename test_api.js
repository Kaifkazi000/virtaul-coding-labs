const fetch = require('node-fetch');

async function testApi() {
               try {
                              const res = await fetch('http://localhost:5000/api/hod/students');
                              const text = await res.text();
                              console.log("Raw Response:", text);
                              try {
                                             const data = JSON.parse(text);
                                             console.log("Is Array:", Array.isArray(data));
                                             if (Array.isArray(data)) {
                                                            console.log("Count:", data.length);
                                                            if (data.length > 0) console.log("First:", JSON.stringify(data[0], null, 2));
                                             }
                              } catch (e) {
                                             console.log("Not valid JSON");
                              }
               } catch (err) {
                              console.error("Fetch Error:", err.message);
               }
}

testApi();
