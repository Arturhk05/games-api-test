const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("../Plataforma de perguntas/database/database")
const cors = require("cors")
const jwt = require("jsonwebtoken")

const secret = "sdasdasdasdawed"

const Game = require("./database/Game")

// Cors
app.use(cors())

// Body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Database connection
connection
  .authenticate()
  .then(() => {
    console.log("Banco de dados conectado")
  })
  .catch((err) => {
    console.log(err)
  })

var DB = {
  users: [
    {
      id: 1,
      name: "Artur Krauspenhar",
      email: "arturhandow@gmail.com",
      password: "123456"
    }
  ]
}

// Find all games
app.get("/games", auth, (req, res) => {
  Game.findAll().then((games) => {
    res.json(games)
    res.statusCode = 200
  })
})

// Find one by id
app.get("/game/:id", auth, (req, res) => {
  if (!isNaN(req.params.id)) {
    const id = parseInt(req.params.id)
    Game.findOne({where: {id: id}})
    .then(game => {
      if (game) {
        res.json(game)
        res.statusCode = 200
      } else {
        res.sendStatus(404)
      }
    })
    .catch(err => {
      console.log(err)
    })
  } else {
    res.sendStatus(400)
  }
})

// New game
app.post("/game", auth, (req, res) => {
  const {title, price, year} = req.body

  Game.create({
    title: title,
    year: year,
    price: price
  }).then(() => {
    console.log("Jogo criado")
  })

  res.sendStatus(200)
})

// Delete game by id
app.delete("/game/:id", auth, (req, res) => {
  if (!isNaN(req.params.id)) {
    const id = parseInt(req.params.id)
    Game.destroy({where: {id: id}})
    .then(() => {
      res.sendStatus(200)
    })
    .catch(err => {
      res.sendStatus(403)
    })
  } else {
    res.sendStatus(400)
  }
})

// Update game by id
app.put("/game/:id", auth, (req, res) => {
  if (!isNaN(req.params.id)) {
    const id = parseInt(req.params.id)
    const {title, year, price} = req.body

    if (title) {
      Game.update({title: title}, {
        where: {
          id: id
        }
      })
    }
    if (price) {
      Game.update({price: price}, {
        where: {
          id: id
        }
      })
    }
    if (year) {
      Game.update({year: year}, {
        where: {
          id: id
        }
      })
    }
    res.sendStatus(200)
  } else {
    res.sendStatus(404)
  }
})

app.post("/auth", (req, res) => {
  const {email, password} = req.body

  if (email) {
    const user = DB.users.find(u => u.email == email)

    if (user) {
      if(user.password == password) {
        jwt.sign({id: user.id, email: user.email}, secret, {expiresIn: "1h"}, (err, token) => {
          if (err) {
            res.status(400)
            res.json({token: "Falha interna"})
          } else {
            res.status(200)
            res.json({token: token})
          }
        })
      } else {
        res.sendStatus(401)
      }
    } else {
      res.sendStatus(404)
    }
  } else {
    res.sendStatus(400)
  }
})

function auth(req, res, next) {
  const authToken = req.headers['authorization']

  if (authToken) {
    const bearer = authToken.split(' ')
    const token = bearer[1]

    jwt.verify(token, secret, (err, data) => {
      if (err) {
        res.sendStatus(401)
      } else {
        res.status(200)
        req.token = token
        req.loggedUser = [{id: data.id, email: data.email}]
        next()
      }
    })
  } else {
    res.sendStatus(401)
  }
}

app.listen(3000, () => {
  console.log("Servidor rodando")
})