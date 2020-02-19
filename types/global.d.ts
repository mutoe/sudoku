import Game from '../src/class/Game'

declare global {
  interface Window {
    game: Game
  }
}
