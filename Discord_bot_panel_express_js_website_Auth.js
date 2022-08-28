const {Client, Intents, Collection, Permissions} = require("discord.js")
const bot = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]})
const express = require("express")
const axios = require("axios").default
const querystring = require("querystring")
const session = require("express-session")
const fs = require("fs")
const auth = require("./util/auth.js")
const calculator = require('discord-bitfield-calculator');

var app = express()

app.set("view engine", "ejs")
app.set("views", "./pages")

app.use(express.static("./public"))
app.use(
  session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 155520000,
    }
  })
);

app.get("/", async(req, res) => {
    res.render("index", {u: await auth(req, res, bot)})
})

app.get("/login", async(req, res) => {
    const u = await auth(req, res, bot)
    if(!u.login) res.redirect("https://discord.com/api/oauth2/authorize?client_id=788082772375896086&redirect_uri=https%3A%2F%2Fsakizbot.cf%2Fcallback&response_type=code&scope=identify%20email%20guilds")
    else res.redirect("/")
})

app.get("/logout", async(req, res) => {
    const u = await auth(req, res, bot)
    if(u){
        delete req.session.discorduser
        delete req.session.userguilds
        delete req.session.expires
    }
    res.redirect("/")
})

app.get("/panel", async(req, res) => {
    let u = await auth(req, res, bot)
    if(!u.login) return res.redirect("/login")
    let hasbot = []
    let nobot = []
    u.guilds.forEach(g => {
        if(calculator.permissions(g.permissions).includes("MANAGE_GUILD")){
            let guild = bot.guilds.cache.get(g.id)
            let topush = {
                guild: g,
                icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.webp` : "./discord.png"
            }
            if(guild){
                hasbot.push(topush)
            }else{
                nobot.push(topush)
            }
        }
    })
    let any = nobot || hasbot ? true : false;
    res.render("panellist", {any: any, u: u, nobot: nobot, hasbot: hasbot})
})

app.get("/panel/:guildid", async(req, res) => {
    const u = await auth(req, res, bot)
    if(!u.login) return res.redirect("/login")
    const guildid = req.params.guildid
    if(!guildid) return res.redirect("/panel")
    const guild = bot.guilds.cache.get(guildid)
    if(!guild) return res.send("Sunucu bulunamadı")
    res.render("panel", {u: u, guild: guild})
})

app.get("/callback", (req, res) => {
    const code = req.query.code
    if(!code) return res.send("Auth kodu bulunamadı")
    axios.post("https://discord.com/api/oauth2/token",  querystring.stringify({
        client_id: process.env.client_id,
        client_secret: process.env.client_secret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "https://sakizbot.cf/callback"
    }))
        .catch(err => {res.send("Rate-limit ulaşıldı")})
        .then(response => {
            if(!response) return
        const {token_type, access_token, expires_in} = response.data
        axios.get("https://discord.com/api/users/@me", {
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })
            .then(user => {
            req.session.discorduser = user.data
            req.session.expires = Date.now() + expires_in
            axios.get("https://discord.com/api/users/@me/guilds", {
            headers: {
                authorization: `${token_type} ${access_token}`
            }}).then(response => {
                req.session.userguilds = response.data
                res.redirect("/")
            })
        })
    })
})

/* PANEL API */


/* BOT */

require("./util/events.js")(bot)
//bot.on("debug", console.log)

const log = msg => {
    if(!msg) return
    let date = new Date()
    let hours = date.getHours()+3
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    console.log(`[${hours}:${minutes}:${seconds}] ${msg}`) 
}

bot.as = new Collection()
bot.cmds = new Collection()

fs.readdir("./cmds", (err, files) => {
    if(err) return console.error(err)
    files = files.filter(n => n.endsWith(".js"))
    files.forEach(f => {
        const file = require(`./cmds/${f}`)
        log(`Yüklenen komut: ${file.conf.name.toLowerCase()}`)
        file.conf.aliases.forEach(a => {
            bot.as.set(a.toLowerCase(), file.conf.name.toLowerCase())
        })
        bot.cmds.set(file.conf.name.toLowerCase(), file)
    })
})

//bot.login(process.env.token)
app.listen(process.env.port || 3000)

module.exports.log = log 
