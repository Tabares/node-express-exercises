const express = require('express');
const app = express(); //cretate the app

const fs = require('fs'); // The fs module provides an API for interacting with the file system in a manner closely modeled around standard POSIX functions.
const path = require('path') //The path module provides utilities for working with file and directory paths. It can be accessed using:

const _ = require('lodash');
const engines = require('consolidate');
const bodyParser = require('body-parser') // body-parser extract the entire body portion of an incoming request stream and exposes it on req.body.
// The middleware was a part of Express.js earlier but now you have to install it separately.
const users = [];
/*
fs.readFile('user.json', {encoding: 'utf8'}, (err, data) =>  {
    if (err) throw err;

    JSON.parse(data).forEach( user => {
        user.name.full = _.startCase(user.name.first + ' ' + user.name.last);
        users.push(user);
    });
});*/

const getUserFilePath = (username) => {
    return path.join(__dirname, 'users', username) + '.json'
}

const getUser = (username) => {
    let user = JSON.parse(fs.readFileSync(getUserFilePath(username), {encoding: 'utf8'}))
    user.name.full = _.startCase(user.name.first + ' ' + user.name.last)
        _.keys(user.location).forEach(function (key) {
        user.location[key] = _.startCase(user.location[key])
    })
    return user
}

const saveUser = (username, data) => {
    const fp = getUserFilePath(username)
    fs.unlinkSync(fp) // delete the file
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding: 'utf8'})
}

app.engine('hbs', engines.handlebars)
app.set('views', './views')
app.set('view engine', 'hbs')


app.get('/', (req, res) => {
    const users = []
    fs.readdir('users', (err, files) => {
      files.forEach( (file) => {
        fs.readFile(path.join(__dirname, 'users', file), {encoding: 'utf8'}, (err, data) => {
          const user = JSON.parse(data)
          user.name.full = _.startCase(user.name.first + ' ' + user.name.last)
          users.push(user)
          if (users.length === files.length) res.render('index', {users: users})
        })
      })
    })
})

// app.get('/', (req, res) => {
    
    // res.render('index', {users: users})
    /*
    let buffer = ''

    users.map( (user) => {
        buffer += '<a href="/' + user.username + '">' + user.name.full + '</a><br>'
    })
    res.send(buffer)*/
// });

app.use('/profilepics', express.static('images'))
app.use(bodyParser.urlencoded({ extended: true }))
app.get('/favicon.ico', (req, res) => {
    res.end()
})

app.get(/big.*/, (req, res, next) => {
    console.log('BIG USER ACCESS')
    next()
})

app.get(/.*dog.*/, (req, res, next) => {
    console.log('DOGS GO WOOF')
    next()
})

app.get('/:username', (req, res) => {
    const username = req.params.username
    const user = getUser(username)
    res.render('user', {
        user: user,
        address: user.location
    })
    // res.send(username)
    // res.render('user', {username: username})
})

  
app.put('/:username', (req, res) => {
    const username = req.params.username
    const user = getUser(username)
    user.location = req.body
    saveUser(username, user)
    res.sendStatus(200)
    //res.end()
})
  
app.delete('/:username', (req, res) => {
    const fp = getUserFilePath(req.params.username)
    fs.unlinkSync(fp) // delete the file
    res.sendStatus(200)
})


app.get('/yo', (req, res) => {
    res.send('YO');
})

const server = app.listen(3000, () => {
    console.log('Server is running on ', server.address().port)
});