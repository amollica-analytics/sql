const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Connect to SQLite database
const db = new sqlite3.Database('university.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to university.db');
  }
});

// -------------------- API Endpoints --------------------

// GET /api/courses - Retrieve all courses
app.get('/api/courses', (req, res) => {
  db.all('SELECT * FROM courses', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET /api/courses/:id - Retrieve a course by ID
app.get('/api/courses/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM courses WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ message: 'Course not found' });
    } else {
      res.json(row);
    }
  });
});

// POST /api/courses - Insert a new course
app.post('/api/courses', (req, res) => {
  const { courseCode, title, credits, description, semester } = req.body;
  const sql = `
    INSERT INTO courses (courseCode, title, credits, description, semester)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [courseCode, title, credits, description, semester], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: this.lastID, message: 'Course added successfully' });
    }
  });
});

// PUT /api/courses/:id - Update an existing course
app.put('/api/courses/:id', (req, res) => {
  const id = req.params.id;
  const { courseCode, title, credits, description, semester } = req.body;
  const sql = `
    UPDATE courses
    SET courseCode = ?, title = ?, credits = ?, description = ?, semester = ?
    WHERE id = ?
  `;
  db.run(sql, [courseCode, title, credits, description, semester, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Course not found' });
    } else {
      res.json({ message: 'Course updated successfully' });
    }
  });
});

// DELETE /api/courses/:id - Delete a course
app.delete('/api/courses/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM courses WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: 'Course not found' });
    } else {
      res.json({ message: 'Course deleted successfully' });
    }
  });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});