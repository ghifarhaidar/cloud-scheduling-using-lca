const path = require('path');

const WEB_DIR = process.env.WEB_DIR || path.resolve(__dirname, '..');
const MAIN_DIR = process.env.MAIN_DIR || path.resolve(WEB_DIR, '..');
const RESULTS_DIR = path.join(MAIN_DIR, 'results');

module.exports = {
    WEB_DIR,
    MAIN_DIR,
    RESULTS_DIR,
    PORT: process.env.PORT || 3000,
};