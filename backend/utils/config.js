const path = require('path');

const WEB_DIR = path.resolve(__dirname, '..');
const MAIN_DIR = path.resolve(WEB_DIR, '..');
const RESULTS_DIR = path.join(MAIN_DIR, 'results');

module.exports = {
    WEB_DIR,
    MAIN_DIR,
    RESULTS_DIR,
    PORT: 3000,
};