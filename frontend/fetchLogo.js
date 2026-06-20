const axios = require('axios');
const fs = require('fs');

axios.get('https://www.theemcoe.org/wp-content/uploads/2021/11/logo.png', {
  responseType: 'arraybuffer',
  headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(res => {
  const base64 = Buffer.from(res.data, 'binary').toString('base64');
  const fileContent = `export const logoBase64 = "data:image/png;base64,${base64}";\n`;
  fs.writeFileSync('src/logoBase64.js', fileContent);
  console.log('Logo downloaded and converted to src/logoBase64.js');
}).catch(err => console.error('Error fetching logo:', err.message));
