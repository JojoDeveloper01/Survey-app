import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const host = process.env.HOST || '0.0.0.0';
const adminPassword = process.env.SURVEY_ADMIN_PASSWORD;

app.use(cors());
app.use(express.json());

function requireAdmin(req, res, next) {
    if (!adminPassword) {
        return res.status(503).json({ message: 'Dashboard disabled: SURVEY_ADMIN_PASSWORD is not configured' });
    }

    const auth = req.headers.authorization || '';
    const [scheme, encoded] = auth.split(' ');
    if (scheme !== 'Basic' || !encoded) {
        res.set('WWW-Authenticate', 'Basic realm="Survey Dashboard"');
        return res.status(401).send('Authentication required');
    }

    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [_user, password] = decoded.split(':');
    if (password !== adminPassword) {
        res.set('WWW-Authenticate', 'Basic realm="Survey Dashboard"');
        return res.status(401).send('Authentication required');
    }

    next();
}

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

app.get('/dashboard', requireAdmin, (req, res) => {
    res.sendFile(join(__dirname, '../public', 'dashboard.html'));
});

// Endpoint to get all survey responses
app.get('/api/responses', requireAdmin, async (req, res) => {
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

app.listen(port, host, () => {
    console.log(`App listening on http://${host}:${port}`);
});
