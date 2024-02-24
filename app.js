const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error : ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

const convertDBObjectTOResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const GetQuery = `
  SELECT * FROM cricket_team;`
  const team = await db.all(GetQuery)
  response.send(
    team.map(eachPlayer => convertDBObjectTOResponseObject(eachPlayer)),
  )
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {player_name, jersey_number, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${player_name}',
         ${jersey_number},
         ${role}
      );`

  const dbresponse = await db.run(addPlayerQuery)

  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const GetQuery = `
  SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const player = await db.get(GetQuery)
  response.send(convertDBObjectTOResponseObject(player))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body

  const {playerName, jerseyNumber, role} = playerDetails

  const updatePlayerQuery = `
  UPDATE cricket_team 
  SET player_name ="${playerName}",
      jersey_number = "${jerseyNumber}",
      role = "${role}"
  WHERE player_id = ${playerId};
  `

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteQuery = `
  DELETE FROM cricket_team WHERE player_id = ${playerId};`

  await db.run(deleteQuery)
  response.send('Player Removed')
})

module.exports = app
