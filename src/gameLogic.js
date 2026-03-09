// 俄罗斯方块游戏逻辑
export const COLS = 10
export const ROWS = 20
export const BLOCK_SIZE = 30

// 方块形状
export const SHAPES = {
  I: [
    [1, 1, 1, 1]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1]
  ]
}

// 方块颜色
export const COLORS = {
  I: '#00f0f0',
  J: '#0000f0',
  L: '#f0a000',
  O: '#f0f000',
  S: '#00f000',
  T: '#a000f0',
  Z: '#f00000'
}

// 方块类型
export const PIECE_TYPES = ['I', 'J', 'L', 'O', 'S', 'T', 'Z']

// 创建新方块
export function createPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  return {
    shape: SHAPES[type],
    color: COLORS[type],
    type,
    x: Math.floor((COLS - SHAPES[type][0].length) / 2),
    y: 0
  }
}

// 旋转方块
export function rotate(piece) {
  const newShape = piece.shape[0].map((_, i) =>
    piece.shape.map(row => row[i]).reverse()
  )
  return { ...piece, shape: newShape }
}

// 碰撞检测
export function checkCollision(board, piece, offsetX = 0, offsetY = 0) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const newX = piece.x + col + offsetX
        const newY = piece.y + row + offsetY

        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          (newY >= 0 && board[newY][newX])
        ) {
          return true
        }
      }
    }
  }
  return false
}

// 合并方块到棋盘
export function mergePiece(board, piece) {
  const newBoard = board.map(row => [...row])
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const y = piece.y + row
        const x = piece.x + col
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
          newBoard[y][x] = piece.color
        }
      }
    }
  }
  
  return newBoard
}

// 消除行
export function clearLines(board) {
  let linesCleared = 0
  const newBoard = []
  
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      linesCleared++
    } else {
      newBoard.unshift(board[row])
    }
  }
  
  // 在顶部添加空行
  while (newBoard.length < ROWS) {
    newBoard.unshift(new Array(COLS).fill(0))
  }
  
  return { board: newBoard, linesCleared }
}

// 初始化棋盘
export function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}
