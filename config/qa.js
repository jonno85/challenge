require('dotenv').config();
const path = require('path');

module.exports = {
  db: {
    host: '0.0.0.0',
    port: 5432,
    database: 'test',
    user: 'local',
    password: 'local',
  },
  host: 'localhost:9001',
  knex: {
    migrationExtension: ['.ts'],
  },
  i18next: {
    translationFilePath: path.resolve(__dirname, '..', 'locales/{{lng}}/{{ns}}.json'),
  },
};
