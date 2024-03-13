const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const connection = require("../Plataforma de perguntas/database/database")
const Game = require("./database/Game")
const cors = require("cors")

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

// Find all games
app.get("/games", (req, res) => {
  Game.findAll().then((games) => {
    res.json(games)
    res.statusCode = 200
  })
})

// Find one by id
app.get("/game/:id", (req, res) => {
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
app.post("/game", (req, res) => {
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
app.delete("/game/:id", (req, res) => {
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
app.put("/game/:id", (req, res) => {
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

app.listen(3000, () => {
  console.log("Servidor rodando")
})