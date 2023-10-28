
const express = require("express");
const app = express();
const db = require(`../models/db`);
const port = 8080;
app.use(express.json());

let userloggedin=null


app.get('/home', async (req, res) => {
    try {
      let result = await db.query(`SELECT * from users`);
      res.json(result.rows);
    }
    catch (err) {
      console.error(err);
      res.status(500).send('error in get the home');
    }
});


app.post('/addBlog', async (req, res) => {
    const {description,url,title} = req.body;
    try {
        const query = `
            INSERT INTO blogs (description,user_id,url,title)
            VALUES ($1, $2, $3,$4)
            RETURNING id`;
        const values = [description,userloggedin,url,title];
        if(userloggedin!=null){
             const result = await db.query(query, values);
             const newBlogId = result.rows[0].blog_id;
             res.status(201).json({ message: 'Blog added successfully', blog_id : newBlogId });
        }
        else{
            res.json("The user is not login")
        }
    } catch (error) {
        console.error('Error adding blog:', error);
        res.status(500).json({ error: 'Failed to add the blog' });
    }
});



app.post('/register', async(req, res) => {
    const {name, email, password} = req.body;
    try{
        const query = `INSERT INTO users (name, email, password)
                            VALUES ($1, $2, $3)
                            RETURNING id`;
        const values = [name, email, password];
        let pattern = /^[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
        if (name.length < 3){
            res.json("very short name, add more then 3 characters");
        } else if (!pattern.test(email)){
            res.json("your email is not valid!");
        } else if (password.length < 8){
            res.json("very short password, add more then 8 characters");
        } else {
            const result = await db.query(query, values);
            const newUserId = result.rows[0].id;
            res.status(201).json({ message: 'User added successfully', user_id: newUserId });
        }
    } catch (error){
        console.error('Failed to register : ', error);
        res.status(500).json({ error: 'Failed to register'});
    };
});





app.get('/getblog/:id', async(req, res) => {
    try{
        const query = 'select * from blogs where id = $1';
        const blogId = req.params.id;
        const result = await db.query(query, [blogId]); 
        res.json(result.rows);
    } catch (error){
        console.error('Failed to get one blog: ', error);
        res.status(500).json({ error: 'Failed to get one blog'});
    }
});






app.get('/login', async(req, res) => {
    const {email, password} = req.body;
    try{
        const query = `select * from users where email=$1 and password=$2
        `;
        const values = [email, password];
        const result = await db.query(query, values);
      const theUser=result.rows[0];
      if(theUser.email==email&& theUser.password==password){
        userloggedin=theUser.id
        res.json("The user is found")
      }
    } catch (error){
        console.error('Failed to login : ', error);
        res.status(500).json({ error: 'Failed to login'});
    };
});



app.listen(port, () => {
    console.log(`server running in port ${port}`);
})