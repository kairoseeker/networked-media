const express = require('express')
const parser = require('body-parser')
const encodedParser = parser.urlencoded({ extended: true })
const fs = require('fs')
const path = require('path')

const app = express()

app.use(express.static('public'))
app.use(express.static('assets'))
app.use(express.json())
app.use(encodedParser)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const postsFile = path.join(__dirname, 'posts.json')
const stringsFile = path.join(__dirname, 'strings.json')
const suggestionsFile = path.join(__dirname, 'suggestions.json')

function loadPosts() {
    try {
        const data = fs.readFileSync(postsFile, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        return []
    }
}

function savePosts(posts) {
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2))
}

function loadStrings() {
    try {
        const data = fs.readFileSync(stringsFile, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        return []
    }
}

function saveStrings(strings) {
    fs.writeFileSync(stringsFile, JSON.stringify(strings, null, 2))
}

function loadSuggestions() {
    try {
        const data = fs.readFileSync(suggestionsFile, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        return []
    }
}

function saveSuggestions(suggestions) {
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2))
}

let posts = loadPosts()
let strings = loadStrings()
let suggestions = loadSuggestions()

app.get('/', (req, res) => {
    res.render('index', { allPosts: posts, allStrings: strings })
})

app.get('/future', (req, res) => {
    res.render('future', { allPosts: posts, allStrings: strings })
})

app.get('/past', (req, res) => {
    res.render('past', { allPosts: posts, allStrings: strings })
})

app.post('/add-note', (req, res) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    let note = {
        text: req.body.status,
        x: parseFloat(req.body.x),
        y: parseFloat(req.body.y),
        time: now
    }
    
    posts.push(note)
    savePosts(posts)
    
    res.json({ time: now })
})

app.post('/add-string', (req, res) => {
    let string = {
        x1: req.body.x1,
        y1: req.body.y1,
        x2: req.body.x2,
        y2: req.body.y2
    }
    
    strings.push(string)
    saveStrings(strings)
    
    res.json({ success: true })
})

app.post('/add-suggestion', (req, res) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    let suggestion = {
        name: req.body.name,
        prompt: req.body.prompt,
        time: now
    }
    
    suggestions.push(suggestion)
    saveSuggestions(suggestions)
    
    res.json({ 
        message: 'Thank you for your suggestion, ' + req.body.name + '!'
    })
})

app.listen(7777, () => {
    console.log('Server started on port 7777')
    console.log('Posts loaded:', posts.length)
})