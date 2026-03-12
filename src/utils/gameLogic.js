// 游戏常量
export const COLS = 10
export const ROWS = 20
export const BLOCK_SIZE = 30

// 方块定义
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

export const COLORS = {
  I: '#00f5ff',
  J: '#ffeb3b',
  L: '#ffa600',
  O: '#ffcd01',
  S: '#00ff00',
  T: '#2db6f0',
  Z: '#ff0000'
}

/**
 * 获取随机方块
 */
export const getRandomPiece = () => {
  const types = Object.keys(SHAPES)
  const type = types[Math.floor(Math.random() * types.length)]
  return {
    type: type,
    shape: SHAPES[type],
    color: COLORS[type],
    x: Math.floor((COLS - SHAPES[type][0].length) / 2),
    y: 0
  }
}

/**
 * 旋转方块
 */
export const rotate = (piece) => {
  const newShape = piece.shape[0].map((_, idx) =>
    piece.shape.map(row => row[idx]).reverse()
  )
  return { ...piece, shape: newShape }
}

/**
 * 检测碰撞
 */
export const checkCollision = (board, piece) => {
  if (!board || !piece) return false
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        const y = row + piece.y
        const x = col + piece.x
        
        // 检查边界或重叠
        if (
          y >= ROWS ||
          x < 0 ||
          x >= COLS ||
          (board[y] && board[y][x])
        ) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * 创建新方块（别名）
 */
export const createPiece = getRandomPiece

/**
 * 创建游戏棋盘
 */
export const createBoard = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0))
}

/**
 * 合并方块到棋盘
 */
export const mergePiece = (board, piece) => {
  const newBoard = board.map(row => [...row])
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        newBoard[row + piece.y][col + piece.x] = piece.color
      }
    }
  }
  
  return newBoard
}

/**
 * 消除行检测（别名）
 */
export const clearLines = checkLines
