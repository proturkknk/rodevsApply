const express = require("express")
const path = require("path")
const axios = require("axios")
const parser = require("body-parser")

var app = express()

app.use(parser.urlencoded({extended: true}))

app.use(parser.json())

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "pages"))

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/api/webhooks/:id/:token", (req, res) => {
    axios.get(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}`)

    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.patch("/api/webhooks/:id/:token", (req, res) => {
    axios.patch(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}`, req.body, {headers:{"content-type":"application/json"}})
    
    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.delete("/api/webhooks/:id/:token", (req, res) => {
    axios.delete(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}`)

    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.post("/api/webhooks/:id/:token", (req, res) => {
    axios.post(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}`, req.body, {headers:{"content-type":"application/json"}})
    
    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.get("/api/webhooks/:id/:token/messages/:message", (req, res) => {
    axios.get(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}/messages/${req.params.message}`)
    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.patch("/api/webhooks/:id/:token/messages/:message", (req, res) => {
    axios.patch(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}/messages/${req.params.message}`, req.body, {headers:{"content-type":"application/json"}})
    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.delete("/api/webhooks/:id/:token/messages/:message", (req, res) => {
    axios.delete(`https://discord.com/api/webhooks/${req.params.id}/${req.params.token}/messages/${req.params.message}`)
    .catch(failResponse => {
        res.send(failResponse.response.data)
    })
    .then(response => {
        if(response) res.send(response.data)
    })
})

app.get("*", (req, res) => {
    res.send("<h1>Page Not Found</h1>")
})

app.listen(process.env.PORT || 80, () => {
    console.log(`Server is listening on port ${process.env.PORT || 80}`)
})
