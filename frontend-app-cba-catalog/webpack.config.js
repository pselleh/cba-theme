const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig({
  dotenvFiles: [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.development'),
  ],
});
