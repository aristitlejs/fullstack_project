const express = require('express');
const bodyParser = require('body-parser');
const mysql = require("mysql2/promise");
const multer = require('multer');
const path = require('path');
const app = express();

// Use body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"))
  
app.use(express.static('css'));
app.set('view engine', 'ejs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'student_database',
    port: 3306  // <== default 3306
});

app.get('/', async (req, res) => {
    try {
        const connection = await dbConn
        const users = await connection.query('SELECT * from students')
        res.render('index', { users:users[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/add-user', (req, res) => {
    res.render('add-user');
});

app.post('/add-user',upload.single('image'), async (req, res) => {
    const { name, age, phone, email } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const connection = await dbConn;
        rows = await connection.query(
            "INSERT INTO students (name, age, phone, email, image) VALUES (?, ?, ?, ?, ?)",
            [name, age, phone, email, image ]
        );
        
        //res.redirect('/');
        res.status(201).send("<h1 style=\"color:blue;\">  Create ID success! </h1> <br> <a href=\"/\"> กลับหน้าหลัก </a>")

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/edit-user', async (req, res) => {
    const id = req.query.id;

    const connection = await dbConn
    const users = await connection.query('SELECT * from students  Where id = ' + id )
    
    //console.log(users);
    res.render('edit-user', { users:users[0] });
});

app.post('/edit-user', upload.single('image'), async (req, res) => {
    const { id, name, age, phone, email } = req.body;

    const image = req.file ? req.file.filename : null;

    console.log(req.file);
    
    try {
        const connection = await dbConn;
        rows = await connection.query(
            "UPDATE students SET name = ?, age = ?, phone = ?, email = ? ,image = ? WHERE id = ?",
            [name, age, phone, email, image, id]
        );
        
        //res.redirect('/');
        res.status(201).send("<h1 style=\"color:green;\">  Edit ID " + [id] + " success! </h1> <br> <a href=\"/\"> กลับหน้าหลัก </a>")

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.get('/delete-user', async (req, res) => {
    const id = req.query.id;

    const connection = await dbConn
    const users = await connection.query('SELECT * from students  Where id = ' + id )
    
    //console.log(users);
    res.render('delete-user', { users:users[0] });
});

app.post('/delete-user', async (req, res) => {
    const { id, name, age, phone, email } = req.body;
    try {
        const connection = await dbConn;
        const users = await connection.query('DELETE FROM students WHERE id = ?', [id]);
        
        //res.redirect('/');
        res.status(201).send("<h1 style=\"color:red;\">  Delete ID " + [id] + " success! </h1> <br> <a href=\"/\"> กลับหน้าหลัก </a>")
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


app.listen(3000, () => console.log('Server running on port 3000'));