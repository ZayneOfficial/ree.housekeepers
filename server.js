const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CREATE DATABASE FOLDER
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SETUP DATABASE
const dbPath = path.join(dbDir, 'bookings.db');
const db = new sqlite3.Database(dbPath);

db.run(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    source TEXT DEFAULT 'website',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
  } else {
    console.log('✅ Database ready');
  }
});

// ===== API ROUTES =====
// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ API test called');
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  console.log('📊 Getting all bookings');
  db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('❌ Query error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, bookings: rows || [] });
  });
});

// Submit booking
app.post('/api/bookings', (req, res) => {
  console.log('📩 New booking received');
  console.log('📝 Data:', req.body);
  
  const { name, email, phone, service, date, time, message, source } = req.body;
  
  // Validate
  if (!name || !phone || !service || !date) {
    return res.status(400).json({ 
      success: false, 
      error: 'Name, phone, service, and date are required' 
    });
  }

  const sql = `
    INSERT INTO bookings (name, email, phone, service, date, time, message, source, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    name.trim(),
    email ? email.trim() : null,
    phone.trim(),
    service,
    date,
    time || null,
    message ? message.trim() : null,
    source || 'website',
    'new'
  ];

  db.run(sql, values, function(err) {
    if (err) {
      console.error('❌ Insert error:', err);
      return res.status(500).json({ 
        success: false, 
        error: 'Database error: ' + err.message 
      });
    }
    
    console.log('✅ Booking saved with ID:', this.lastID);
    res.json({
      success: true,
      id: this.lastID,
      message: 'Booking saved successfully'
    });
  });
});

// Update booking status
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log(`🔄 Updating booking ${id} to ${status}`);
  
  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  db.run(
    'UPDATE bookings SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        console.error('❌ Update error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ success: false, error: 'Booking not found' });
      }
      
      res.json({ success: true, message: 'Booking updated successfully' });
    }
  );
});

// Delete booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting booking ${id}`);
  
  db.run('DELETE FROM bookings WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  });
});

// Get stats
app.get('/api/stats', (req, res) => {
  const stats = {};
  let completed = 0;
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM bookings',
    new: 'SELECT COUNT(*) as count FROM bookings WHERE status = "new"',
    confirmed: 'SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"',
    quotes: 'SELECT COUNT(*) as count FROM bookings WHERE status = "quote"'
  };

  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, (err, row) => {
      if (err) {
        stats[key] = 0;
      } else {
        stats[key] = row ? row.count : 0;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json({ success: true, stats });
      }
    });
  });
});

// ===== SERVE STATIC FILES =====
// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ===== HTML ROUTES =====
// Route for the quote page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quote.html'));
});

app.get('/quote', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'quote.html'));
});

// Route for the dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Catch-all for 404 - must be last
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});