import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// Ensure table exists
let db;
getDb().then(async (database) => {
    db = database;
    await db.run(`CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
        data TEXT
    )`);
});

app.post('/api/submit', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ message: 'Database not ready' });
        }
        const responseData = JSON.stringify(req.body);
        await db.run('INSERT INTO responses (data) VALUES (?)', responseData);
        res.status(200).json({ message: 'Survey response saved to database!' });
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Failed to save response' });
    }
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
    app.use(express.static(join(__dirname, '../public')));
    res.sendFile(join(__dirname, '../public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(join(__dirname, '../public', 'dashboard.html'));
});

// Endpoint to get all survey responses
app.get('/api/responses', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ message: 'Database not ready' });
        }
        const rows = await db.all('SELECT id, submitted_at, data FROM responses ORDER BY submitted_at DESC');
        // Parse the JSON data for each row
        const responses = rows.map(row => ({
            id: row.id,
            submitted_at: row.submitted_at,
            data: JSON.parse(row.data)
        }));
        res.json(responses);
    } catch (err) {
        console.error('DB error:', err);
        res.status(500).json({ message: 'Failed to fetch responses' });
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
