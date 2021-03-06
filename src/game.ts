/// --- Set up a system ---
//Get player data
import { getUserData } from '@decentraland/Identity'
//Get player public Ethereum key
import { getUserPublicKey } from '@decentraland/Identity'

//REST API server TODO
import { getUsers, createUser, getUser, deleteUser, updateUser } from '../controllers/users.js'

import USERS from '../user.json'

// Create screenspace
const canvas = new UICanvas()

// Canvas variables
const score = new UIText(canvas)
const name = new UIText(canvas)
const Highscore = new UIText(canvas)
const playerHighScore = new UIText(canvas)

//Global variables
let scorevalue = 0
const users: Player[] = []
let stringedPlayers = ''
//Cube Rotate System
class RotatorSystem {
  // this group will contain every entity that has a Transform component
  group = engine.getComponentGroup(Transform)

  update(dt: number) {
    // iterate over the entities of the group
    for (const entity of this.group.entities) {
      // get the Transform component of the entity
      const transform = entity.getComponent(Transform)

      // mutate the rotation
      transform.rotate(Vector3.Up(), dt * 10)
    }
  }
}
//Player Class
class Player {
  playerKey: string
  playerName: string
  playerScore: number

  constructor() {
    this.playerKey = ''
    this.playerName = ''
    this.playerScore = 0
  }
}

const mainPlayer = new Player()

// Add a new instance of the system to the engine
engine.addSystem(new RotatorSystem())

/// --- Spawner function ---

function spawnCube(x: number, y: number, z: number) {
  // create the entity
  const cube = new Entity()

  // add a transform to the entity
  cube.addComponent(new Transform({ position: new Vector3(x, y, z) }))

  // add a shape to the entity
  cube.addComponent(new BoxShape())

  // add OnPointerDown to the entity
  cube.addComponent(
    new OnPointerDown(() => {
      //Create a new cube on random position
      spawnCube(Math.random() * 8 + 1, 1, Math.random() * 8 + 1)
      //Remove pressed cube
      engine.removeEntity(cube)

      scorevalue++
      mainPlayer.playerScore = scorevalue
      score.value = 'Score: ' + mainPlayer.playerScore
    })
  )

  // add the entity to the engine
  engine.addEntity(cube)

  return cube
}

void executeTask(async () => {
  const data = await getUserData()
  const publicKey = await getUserPublicKey()

  if (data !== null) {
    mainPlayer.playerName = data.displayName
    name.value = mainPlayer.playerName
  }

  users[0] = mainPlayer
  mainPlayer.playerKey = '' + publicKey
  USERS.Player.push(JSON.parse(JSON.stringify(users[0])))

  const sortedPlayers = USERS.Player.sort((a, b) => (a.playerScore > b.playerScore ? -1 : 1))
  USERS.Player = sortedPlayers
  for (let i = 0; i < USERS.Player.length; i++) {
    stringedPlayers = stringedPlayers + USERS.Player[i].playerName + ' ===== ' + USERS.Player[i].playerScore + '\n\n'
  }
})

// Define the system
export class UpdateSystem implements ISystem {
  // This function is executed on every frame
  update() {
    // IF found that mainPlayer has change highscore
    if (users[0].playerScore !== USERS.Player[3].playerScore) {
      stringedPlayers = ''
      log('changed score')
      for (let i = 0; i < USERS.Player.length; i++) {
        if (users[0].playerName === USERS.Player[i].playerName) {
          USERS.Player[i].playerScore = users[0].playerScore
          log('yes yes')
        }
      }
      const sortedPlayers = USERS.Player.sort((a, b) => (a.playerScore > b.playerScore ? -1 : 1))
      USERS.Player = sortedPlayers
      for (let i = 0; i < USERS.Player.length; i++) {
        stringedPlayers =
          stringedPlayers + USERS.Player[i].playerName + ' ===== ' + USERS.Player[i].playerScore + '\n\n'
      }
    }
    playerHighScore.value = stringedPlayers
  }
}

// Add system to engine
engine.addSystem(new UpdateSystem())
/// --- Spawn a cube ---

spawnCube(8, 1, 8)

// Canvas TextStyle
playerHighScore.fontSize = 15
playerHighScore.hAlign = 'left'
playerHighScore.positionY = -100

Highscore.value = 'Highscore List'
Highscore.hAlign = 'left'
Highscore.fontSize = 40
Highscore.positionY = 100

score.value = 'Score: 0'
score.vAlign = 'top'
score.fontSize = 30

name.vAlign = 'top'
name.fontSize = 30
name.positionX = -300
//Enter REST API
void executeTask(async () => {
  try {
    const response = await fetch('http://localhost:5000/users')

    log(response + 'this is inside')
  } catch {
    log('failed to reach URL 5000')
  }
})
