
import os

filepath = r"c:\Users\kaifo\OneDrive\Desktop\virtuallabback\backend\controllers\hod.controller.js"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if '.match({ semester: Number(semester), admission_year: Number(academic_year) });' in line:
        # Preserve indentation
        indent = line[:line.find('.match')]
        new_lines.append(f'{indent}.eq("semester", Number(semester))\n')
        new_lines.append(f'{indent}.eq("status", "active");\n')
    elif 'if (!semester || !academic_year) {' in line and 'getAvailableBatches' in "".join(lines[max(0, lines.index(line)-5):lines.index(line)]):
         # Make academic year optional in validation
         new_lines.append(line.replace('!semester || !academic_year', '!semester'))
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Batch allocation fix applied.")
