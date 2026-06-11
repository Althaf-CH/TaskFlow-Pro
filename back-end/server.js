const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./taskflow.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            priority TEXT,
            status TEXT,
            due_date TEXT,
            user_id INTEGER
        )
    `);

});

app.get("/", (req, res) => {

    res.send("TaskFlow Pro Backend Running");

});
//register 
app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    const hashedPassword =
    await bcrypt.hash(password, 10);

    db.run(
        `
        INSERT INTO users
        (name,email,password)
        VALUES(?,?,?)
        `,
        [name, email, hashedPassword],

        function(err){

            if(err){

                return res.status(400).json({
                    message:"Email already exists"
                });

            }

            res.json({
                message:"User Registered"
            });

        }
    );

});

//login route

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.get(
        `
        SELECT * FROM users
        WHERE email = ?
        `,
        [email],

        async (err, user) => {

            if(!user){

                return res.status(404).json({
                    message:"User not found"
                });

            }

            const match =
            await bcrypt.compare(
                password,
                user.password
            );

            if(!match){

                return res.status(401).json({
                    message:"Invalid password"
                });

            }

            res.json({
                message:"Login Successful",
                userId:user.id,
                name:user.name
            });

        }
    );

});

 //task api

app.post("/tasks", (req, res) => {

    const {
        title,
        description,
        priority,
        due_date,
        user_id
    } = req.body;

    db.run(
        `
        INSERT INTO tasks
        (
            title,
            description,
            priority,
            status,
            due_date,
            user_id
        )
        VALUES(?,?,?,?,?,?)
        `,
        [
            title,
            description,
            priority,
            "Pending",
            due_date,
            user_id
        ],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"Task Added"
            });

        }
    );

});
//get tasks for a user
app.get("/tasks/:userId", (req, res) => {

    db.all(
        `
        SELECT * FROM tasks
        WHERE user_id = ?
        ORDER BY id DESC
        `,
        [req.params.userId],

        (err, rows) => {

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

});
//delete task
app.delete("/tasks/:id", (req, res) => {

    db.run(
        `
        DELETE FROM tasks
        WHERE id = ?
        `,
        [req.params.id],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"Task Deleted"
            });

        }
    );

});


// mark task as completed

app.put("/tasks/:id", (req, res) => {

    db.run(
        `
        UPDATE tasks
        SET status = 'Completed'
        WHERE id = ?
        `,
        [req.params.id],

        function(err){

            if(err){

                return res.status(500).json(err);

            }

            res.json({
                message:"Task Completed"
            });

        }
    );

});
// edit task
app.put("/edit-task/:id", (req, res) => {

    const {
        title,
        description,
        priority,
        due_date
    } = req.body;

    db.run(
        `
        UPDATE tasks
        SET
            title = ?,
            description = ?,
            priority = ?,
            due_date = ?
        WHERE id = ?
        `,
        [
            title,
            description,
            priority,
            due_date,
            req.params.id
        ],

        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                message:"Task Updated"
            });

        }
    );

});
app.listen(5000, () => {

    console.log("Server running on port 5000");

});