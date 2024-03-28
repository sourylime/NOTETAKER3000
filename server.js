const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
// Serve 'notes.html' for '/notes' route
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html')); // Ensure 'notes.html' exists in the 'public' directory
});

// Serve 'index.html' for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure 'index.html' exists in the 'public' directory
});

// Read notes from 'db.json'
app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes from db.json');
        } else {
            try {
                const notes = JSON.parse(data);
                console.log('notes:', notes);
                res.json(notes);
            } catch (error) {
                console.error(error);
                res.status(500).send('Error parsing notes from db.json');
            }
        }
    });
});

// Create a new note and save to 'db.json'
app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    newNote.id = uuidv4(); // Assign a unique ID using the 'uuid' package

    fs.readFile(path.join(__dirname, 'db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading notes from db.json');
        } else {
            try {
                const notes = JSON.parse(data) || []; // Handle empty files gracefully
                notes.push(newNote);
                fs.writeFile(path.join(__dirname, 'db.json'), JSON.stringify(notes), err => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Error saving notes to db.json');
                    } else {
                        res.json(newNote); // Send the saved note back to the client
                    }
                });
            } catch (error) {
                console.error(error);
                res.status(500).send('Error parsing notes from db.json');
            }
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
