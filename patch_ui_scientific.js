import fs from 'fs';

const filePath = 'c:/Users/kaifo/OneDrive/Desktop/virtuallabback/frontend/my-app/app/dashboard/hod/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldBlock = `                                                            headers.forEach((header, i) => {
                                                                           if (header.includes('name')) student.full_name = values[i];
                                                                           if (header.includes('email')) student.email = values[i];
                                                                           if (header.includes('prn')) student.prn = values[i];
                                                                           if (header.includes('roll')) student.roll_no = values[i];
                                                            });`;

const newBlock = `                                                            headers.forEach((header, i) => {
                                                                           let val = values[i];
                                                                           if (header.includes('name')) student.full_name = val;
                                                                           if (header.includes('email')) student.email = val;
                                                                           if (header.includes('prn')) {
                                                                                          // Handle scientific notation from Excel (e.g. 4.5E+13)
                                                                                          if (val && val.toString().includes('E+')) {
                                                                                                         student.prn = Number(val).toLocaleString('fullwide', {useGrouping:false});
                                                                                          } else {
                                                                                                         student.prn = val;
                                                                                          }
                                                                           }
                                                                           if (header.includes('roll')) student.roll_no = val;
                                                            });`;

// Since exact match might fail due to tabs/spaces, we use a more flexible search
const searchMarker = "if (header.includes('prn')) student.prn = values[i];";
if (content.includes(searchMarker)) {
               console.log("Found scientific notation vulnerability. Patching...");

               // Replace the specific lines
               const lines = content.split('\n');
               for (let i = 0; i < lines.length; i++) {
                              if (lines[i].includes("if (header.includes('prn')) student.prn = values[i];")) {
                                             // Found the line, let's replace the whole forEach block
                                             let start = i;
                                             while (start > 0 && !lines[start].includes("headers.forEach")) start--;
                                             let end = i;
                                             while (end < lines.length && !lines[end].includes("});")) end++;

                                             if (start > 0 && end < lines.length) {
                                                            console.log(`Patching lines ${start + 1} to ${end + 1}`);
                                                            const head = lines.slice(0, start);
                                                            const tail = lines.slice(end + 1);
                                                            const patched = [
                                                                           lines[start], // headers.forEach line
                                                                           "                                                                           let val = values[i];",
                                                                           "                                                                           if (header.includes('name')) student.full_name = val;",
                                                                           "                                                                           if (header.includes('email')) student.email = val;",
                                                                           "                                                                           if (header.includes('prn')) {",
                                                                           "                                                                                          if (val && val.toString().includes('E+')) {",
                                                                           "                                                                                                         student.prn = Number(val).toLocaleString('fullwide', {useGrouping:false});",
                                                                           "                                                                                          } else {",
                                                                           "                                                                                                         student.prn = val;",
                                                                           "                                                                                          }",
                                                                           "                                                                           }",
                                                                           "                                                                           if (header.includes('roll')) student.roll_no = val;",
                                                                           lines[end] // }); line
                                                            ];
                                                            fs.writeFileSync(filePath, [...head, ...patched, ...tail].join('\n'));
                                                            console.log("Successfully patched hod/page.tsx");
                                                            break;
                                             }
                              }
               }
} else {
               console.error("Could not find target line in hod/page.tsx. It might already be patched or the structure changed.");
}
