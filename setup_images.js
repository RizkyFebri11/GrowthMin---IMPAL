import fs from 'fs';
import path from 'path';

const srcFolder = 'C:\\Users\\orang\\.gemini\\antigravity\\brain\\c905e8d6-8008-4deb-8e2c-971dd6151141';
const destFolder = 'd:/Febri/Kuliah/Semester 4 (2026)/[IMPAL]/Tugas/Tubes/Code/[CODE GrowthMin]/public';

if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

fs.copyFileSync(path.join(srcFolder, 'login_bg_blur_1775828703116.png'), path.join(destFolder, 'login_bg_blur.png'));
fs.copyFileSync(path.join(srcFolder, 'login_illustration_1775828864171.png'), path.join(destFolder, 'login_illustration.png'));
