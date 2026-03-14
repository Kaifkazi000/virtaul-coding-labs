const fs = require('fs');
const path = 'c:/Users/kaifo/OneDrive/Desktop/virtuallabback/frontend/my-app/app/dashboard/hod/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Simple replacement
const updatedContent = content.replace('/api/hod/master-practical"', '/api/hod/master-practicals"');

if (content !== updatedContent) {
               fs.writeFileSync(path, updatedContent);
               console.log('Successfully updated page.tsx');
} else {
               // Try without quote just in case
               const updatedContent2 = content.replace('/api/hod/master-practical', '/api/hod/master-practicals');
               if (content !== updatedContent2) {
                              fs.writeFileSync(path, updatedContent2);
                              console.log('Successfully updated page.tsx (via secondary match)');
               } else {
                              console.log('No changes needed or pattern not found');
               }
}
