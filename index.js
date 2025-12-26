const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;
const users = require('./users.json')
const usersFilePath = path.join(__dirname, 'users.json');

app.use(express.json());

// Add New User
app.post('/AddUser', (req, res) => {
    
    const {email} = req.body;
    //Check if email already exists in users.json by find method
    const user = users.find((data) => data.email === email);
    
    // if exists, return error response
    if(user) {
        return res.status(400).json({ message: "User Already Exist" });
    }
    
    // if not exists, add user to users.json and return success response
    let newId = 1;
    if(users.length > 0){
        const lastUser = users.reduce((max, user) => {
                const userID = parseInt(user.id);
                return userID > max ? userID : max;
            }, 0);
            newId = lastUser + 1;
    }
    const newUser = {id:newId , ...req.body};
    users.push(newUser);
    
    // write the updated users list back to users.json
    fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to save user" });
            }
        });
        return res.status(200).json({ message: "User Added Successfully", user: newUser });
});

// Update User data by ID
app.patch('/updateUser',(req, res, next) => {
    const {id} = req.query;
    const user = users.find((data) => data.id == id);

    // if user not found, return error response
    if(!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    // update user details
    req.user = user;
    next();
}, (req, res, next) => {
    const user = req.user;

    // get new data from request body
    const { newName, newEmail, newPassword, newAge } = req.body;
    if (newName) user.name = newName;
    if (newEmail) user.email = newEmail;
    if (newPassword) user.password = newPassword;
    if (newAge) user.age = newAge;

    //Check if updated email already exists in users.json by find method
    const emailExists = users.find((data) => data.email === user.email && data.id != user.id);
    
    // if exists, return error response
    if(emailExists) {
        return res.status(400).json({ message: "Email Already Exist" });
    }

    // write the updated users list back to users.json
    fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
            if (err) {
                return res.status(500).json({ message: "Failed to update user" });
            }
    });
    return res.status(200).json({ message: "User Updated Successfully", user: user });
});

//Delete User by ID
app.delete('/deleteUser',(req, res, next) => {
    const {id} = req.query;
    const user = users.find((data) => data.id == id);
    
    // if user not found, return error response
    if(!user) {
        return res.status(404).json({ message: "User Not Found" });
    }

    req.user = user;

    next();
} , (req, res, next) => {
    const user = req.user;
    const index = users.findIndex((data) => data.id == user.id);
    
    // safety check (should never happen, but protects you)
    if (index === -1) {
        return res.status(500).json({ message: "User index not found" });
    }

    users.splice(index, 1);

    // write the updated users list back to users.json
    fs.writeFile(usersFilePath, JSON.stringify(users), (err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete user" });
        }
        return res.status(200).json({ message: "User Deleted Successfully" });
    });
});

//Gets a user by their name
app.get('/getUserByName', (req, res) => {
    const {name} = req.query;
    const user = users.find((data) => data.name === name);
    // if user not found, return error response
    if(!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "User Found Successfully", user: user });
});

// Gets all users
app.get('/getAllUsers', (req, res) => {
    return res.status(200).json({ message: "All Users Retrieved Successfully", users: users });
});

// Gets a user by their ID
app.get('/getUserById', (req, res) => {
    const {id} = req.query;
    const user = users.find((data) => data.id == id);
    // if user not found, return error response
    if(!user) {
        return res.status(404).json({ message: "User Not Found" });
    }
    return res.status(200).json({ message: "User Found Successfully", user: user });
});

// Filters users by minimum age
app.get('/filterUsersByAge', (req, res) => {
    const {minAge} = req.query;
    const filteredUsers = users.filter((data) => data.age >= minAge);

    // if no users found, return error response
    if(filteredUsers.length === 0) {
        return res.status(404).json({ message: "No Users Found with the given age criteria" });
    }

    return res.status(200).json({ message: "Users Filtered Successfully", users: filteredUsers });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});