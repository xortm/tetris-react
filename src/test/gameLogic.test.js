import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createBoard,
  createPiece,
  rotate,
  checkCollision,
  mergePiece,
  clearLines,
  COLS,
  ROWS,
  SHAPES,
  COLORS,
  PIECE_TYPES
} from '../gameLogic.js'

describe('游戏逻辑模块测试', () => {
  describe('createBoard', () => {
    it('应该创建正确大小的棋盘', () => {
      const board = createBoard()
      expect(board).toHaveLength(ROWS)
      expect(board[0]).toHaveLength(COLS)
    })

    it('棋盘应该全部填充0', () => {
      const board = createBoard()
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBe(0)
        })
      })
    })
  })

  describe('createPiece', () => {
    it('应该创建有效的方块', () => {
      const piece = createPiece()
      expect(piece).toHaveProperty('shape')
      expect(piece).toHaveProperty('color')
      expect(piece).toHaveProperty('type')
      expect(piece).toHaveProperty('x')
      expect(piece).toHaveProperty('y')
    })

    it('方块类型应该是有效的', () => {
      const piece = createPiece()
      expect(PIECE_TYPES).toContain(piece.type)
      expect(SHAPES[piece.type]).toEqual(piece.shape)
      expect(COLORS[piece.type]).toBe(piece.color)
    })

    it('方块应该在水平方向居中', () => {
      const piece = createPiece()
      const expectedX = Math.floor((COLS - piece.shape[0].length) / 2)
      expect(piece.x).toBe(expectedX)
    })

    it('方块应该从顶部开始', () => {
      const piece = createPiece()
      expect(piece.y).toBe(0)
    })
  })

  describe('rotate', () => {
    it('应该顺时针旋转方块', () => {
      const piece = {
        shape: [[1, 0], [1, 0], [1, 1]],
        color: '#00f0f0',
        type: 'L',
        x: 0,
        y: 0
      }

      const rotated = rotate(piece)
      
      expect(rotated.shape).toEqual([
        [1, 1, 1],
        [1, 0, 0]
      ])
      expect(rotated.color).toBe(piece.color)
      expect(rotated.type).toBe(piece.type)
      expect(rotated.x).toBe(piece.x)
      expect(rotated.y).toBe(piece.y)
    })

    it('旋转应该保持不变性（旋转4次回到原样）', () => {
      const piece = {
        shape: [[1, 0.5], [1, 1]],
        color: '#00f0f0',
        type: 'L',
        x: 0,
        y: 0
      }

      let rotated = piece
      for (let i = 0; i < 4; i++) {
        rotated = rotate(rotated)
      }
      
      expect(rotated.shape).toEqual(piece.shape)
    })

    it('O型方块旋转应该保持不变', () => {
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: COLORS.O,
        type: 'O',
        x: 0,
        y: 0
      }

      const rotated = rotate(piece)
      
      expect(rotated.shape).toEqual(piece.shape)
    })
  })

  describe('checkCollision', () => {
    let board
    
    beforeEach(() => {
      board = createBoard()
    })

    it('空棋盘不应该有碰撞', () => {
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: COLORS.O,
        type: 'O',
        x: 4,
        y: 0
      }

      expect(checkCollision(board, piece)).toBe(false)
    })

    it('方块碰到左边应该返回true', () => {
      const piece = {
        shape: [[1, 1]],
        color: COLORS.I,
        type: 'I',
        x: -1,
        y: 0
      }

      expect(checkCollision(board, piece)).toBe(true)
    })

    it('方块碰到右边应该返回true', () => {
      const piece = {
        shape: [[1, 1]],
        color: COLORS.I,
        type: 'I',
        x: COLS - 1,
        y: 0
      }

      expect(checkCollision(board, piece)).toBe(true)
    })

    it('方块碰到底部应该返回true', () => {
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: COLORS.O,
        type: 'O',
x: 0,
        y: ROWS - 1
      }

      expect(checkCollision(board, piece)).toBe(true)
    })

    it('方块碰到已固定的方块应该返回true', () => {
      board[ROWS - 1][5] = '#00f0f0'
      
      const piece = {
        shape: [[1]],
        color: COLORS.O,
        type: 'O',
        x: 5,
        y: ROWS - 1
      }

      expect(checkCollision(board, piece)).toBe(true)
    })

    it('应该正确处理偏移量', () => {
      const piece = {
        shape: [[1]],
        color: COLORS.O,
        type: 'O',
        x: 0,
        y: 0
      }

      expect(checkCollision(board, piece, -1, 0)).toBe(true)
      expect(checkCollision(board, piece, 0, -1)).toBe(false)
    })
  })

  describe('mergePiece', () => {
    it('应该将方块合并到棋盘', () => {
      const board = createBoard()
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: COLORS.O,
        type: 'O',
        x: 0,
        y: 0
      }

      const newBoard = mergePiece(board, piece)
      
      expect(newBoard[0][0]).toBe(COLORS.O)
      expect(newBoard[0][1]).toBe(COLORS.O)
      expect(newBoard[1][0]).toBe(COLORS.O)
      expect(newBoard[1][1]).toBe(COLORS.O)
    })

    it('不应该修改原始棋盘', () => {
      const board = createBoard()
      const piece = {
        shape: [[1, 1], [1, 1]],
        color: COLORS.O,
        type: 'O',
        x: 0,
        y: 0
      }

      const newBoard = mergePiece(board, piece)
      
      expect(board[0][0]).toBe(0)
      expect(newBoard[0][0]).toBe(COLORS.O)
    })

    it('应该保留棋盘上已有的方块', () => {
      const board = createBoard()
      board[0][0] = COLORS.I
      
      const piece = {
        shape: [[1]],
        color: COLORS.O,
        type: 'O',
        x: 0,
        y: 1
      }

      const newBoard = mergePiece(board, piece)
      
      expect(newBoard[0][0]).toBe(COLORS.I)
      expect(newBoard[1][0]).toBe(COLORS.O)
    })
  })

  describe('clearLines', () => {
    it('应该清除完整的行', () => {
      const board = createBoard()
      
      // 填充底部两行
      for (let col = 0; col < COLS; col++) {
        board[ROWS - 1][col] = COLORS.I
        board[ROWS - 2][col] = COLORS.J
      }

      const result = clearLines(board)
      
      expect(result.linesCleared).toBe(2)
      expect(result.board[ROWS - 1]).toEqual(new Array(COLS).fill(0))
      expect(result.board[ROWS - 2]).toEqual(new Array(COLS).fill(0))
    })

    it('不应该清除不完整的行', () => {
      const board = createBoard()
      
      // 填充底部一行，但留一个空位
      for (let col = 0; col < COLS - 1; col++) {
        board[ROWS - 1][col] = COLORS.I
      }

      const result = clearLines(board)
      
      expect(result.linesCleared).toBe(0)
      expect(result.board[ROWS - 1]).not.toEqual(new Array(COLS).fill(0))
    })

    it('正确行数应该保持不变', () => {
      const board = createBoard()
      
      // 填充底部一行
      for (let col = 0; col < COLS; col++) {
        board[ROWS - 1][col] = COLORS.I
      }

      const result = clearLines(board)
      
      expect(result.board).toHaveLength(ROWS)
    })

    it('清除多行时应该正确计数', () => {
      const board = createBoard()
      
      // 填充底部三行
      for (let row = ROWS - 3; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          board[row][col] = COLORS.I
        }
      }

      const result = clearLines(board)
      
      expect(result.linesCleared).toBe(3)
    })
  })

  describe('常量验证', () => {
    it('PIECE_TYPES应该包含所有7种方块', () => {
      expect(PIECE_TYPES).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z'])
    })

    it('SHAPES应该包含所有7种方块的形状', () => {
      PIECE_TYPES.forEach(type => {
        expect(SHAPES).toHaveProperty(type)
        expect(SHAPES[type]).toBeInstanceOf(Array)
        expect(SHAPES[type].length).toBeGreaterThan(0)
      })
    })

    it('COLORS应该包含所有7种方块的颜色', () => {
      PIECE_TYPES.forEach(type => {
        expect(COLORS).toHaveProperty(type)
        expect(COLORS[type]).toMatch(/^#[0-9a-fA-F]{6}$/)
      })
    })
  })
})
