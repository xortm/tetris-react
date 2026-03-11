/**
 * 方块类型定义
 */
export interface Cell {
  id: number
  type: 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z'
  x: number
  y: number
}

export interface Piece {
  id: number
  type: string
  shape: number[][]
  color: string
  x: number
  y: number
}

export interface GameBoard {
  board: (number | null)[][]
  lines: number
  score: number
  level: number
  currentPiece: Piece | null
  nextPiece: Piece | null
  isPaused: boolean
  isGameOver: boolean
  isMobile: boolean
}

export type Direction = 'left' | 'right' | 'up' | 'down' | 'rotate' | 'drop' | 'pause'
