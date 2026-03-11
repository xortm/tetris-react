// 游戏常量
export const COLS = 10
export const ROWS = 20
export const BLOCK_SIZE = 30

// 方块定义
export const SHAPES = {
  I: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1], [0, 0, 0, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 0, 0, 0], [0, 1, 1, 1]],
  J: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 1], [0, 0, 0, 0], [0, 1, 1, 1]],
  L: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 1], [0, 0, 0, 0], [0, 1, 1, 1]],
  O: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 1, 1]],
  S: [[0, 1, 1, 0], [0, 1, 1, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 1, 1]],
  T: [[0, 1, 1, 1], [0, 1, 1, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 1, 1]],
  Z: [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 1], [0, 1, 1, 1], [0, 1, 1, 1]]
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
 * 检测碰撞
 */
export const checkCollision = (board, piece) => {
  if (!board || !piece) return false
  
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col] && board[row + piece.y + 1][col + piece.x]) {
        return true
      }
    }
  }
  return false
}

/**
 * 消除行检测
 */
export const checkLines = (board) => {
  let linesCleared = 0
  
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell !== 0)) {
      // 移除这一行
      board.splice(row, 1)
      // 添加新的空行在顶部
      board.unshift(new Array(COLS).fill(0))
      linesCleared++
    }
  }
  
  return { board, linesCleared }
}
