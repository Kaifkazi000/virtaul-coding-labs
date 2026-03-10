const fetch = require('node-fetch');

async function testPrnLogin() {
               const loginData = {
                              email: "202303365449", // Valid PRN found in DB
                              password: "202303365449" // Default password is PRN
               };

               console.log("--- TESTING PRN LOGIN ---");
               console.log("Identifier:", loginData.email);

               try {
                              const res = await fetch('http://localhost:5000/api/auth/student/login', {
                                             method: 'POST',
                                             headers: { 'Content-Type': 'application/json' },
                                             body: JSON.stringify(loginData)
                              });

                              const data = await res.json();
                              if (res.ok) {
                                             console.log("✅ Login Successful!");
                                             console.log("User Email:", data.user.email);
                                             console.log("Token received:", data.session.access_token ? "YES" : "NO");
                              } else {
                                             console.error("❌ Login Failed:", data.message);
                              }
               } catch (err) {
                              console.error("❌ Fetch Error:", err.message);
               }
}

testPrnLogin();
