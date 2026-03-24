const db = require('./db');
db.prepare("UPDATE questions SET image_filename='Buhotech -  ENFOQUE CUANTITATIVO.png' WHERE id='q_3_2'").run();
console.log('Database image filename fixed.');
