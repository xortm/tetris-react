import React, { useRef, useEffect, useCallback } from 'react'
import {
  createPiece,
  rotate,
  checkCollision,
  mergePiece,
  clearLines,
  createBoard,
  COLS,
  ROWS,
  BLOCK_SIZE
} from './gameLogic.js'

export default function TetrisGame() {
  const canvasRef = useRef(null)
  const nextCanvasRef = useRef(null)
  const requestRef = useRef(null)
  
  // 游戏状态
  const [board, setBoard] = React.useState(createBoard())
  const [currentPiece, setCurrentPiece] = React.useState(null)
  const [nextPiece, setNextPiece] = React.useState(null)
  const [score, setScore] = React.useState(0)
  const [level, setLevel] = React.useState(1)
  const [lines, setLines] = React.useState(0)
  const [gameOver, setGameOver] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  
  // 计时器引用
  const dropCounterRef = useRef(0)
  const dropIntervalRef = useRef(1000)
  const lastTimeRef = useRef(0)
  const isPausedRef = useRef(false)

  // 绘制单个方块
  const drawBlock = useCallback((ctx, x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1)
    
    // 添加高光效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, 3)
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE - 1)
    
    // 添加阴影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(x * BLOCK_SIZE, (y + 1) * BLOCK_SIZE - 4, BLOCK_SIZE - 1, 3)
    ctx.fillRect((x + 1) * BLOCK_SIZE - 4, y * BLOCK_SIZE, 3, BLOCK_SIZE - 1)
  }, [])

  // 绘制棋盘
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 绘制网格
    ctx.strokeStyle = '#2a2a4e'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * BLOCK_SIZE, 0)
      ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE)
      ctx.stroke()
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * BLOCK_SIZE)
      ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE)
      ctx.stroke()
    }
    
    // 绘制已固定的方块
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock(ctx, x, y, cell)
        }
      })
    })
    
    // 绘制当前方块
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color)
          }
        })
      })
    }
  }, [board, currentPiece, drawBlock])

  // 绘制下一个方块
  const drawNextPiece = useCallback(() => {
    const canvas = nextCanvasRef.current
    const ctx = canvas.getContext('2d')
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!nextPiece) return
    
    // 计算居中位置
    const offsetX = (canvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2
    const offsetY = (canvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2
    
    // 绘制方块
    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, offsetX + x, offsetY + y, nextPiece.color)
        }
      })
    })
  }, [nextPiece, drawBlock])

  // 方块下落
  const dropPiece = useCallback(() => {
    if (!currentPiece || isPaused) return
    
    const newPiece = { ...currentPiece, y: currentPiece.y + 1 }
    
    if (checkCollision(board, newPiece)) {
      // 碰撞，合并方块
      const newBoard = mergePiece(board, currentPiece)
      const { board: clearedBoard, linesCleared } = clearLines(newBoard)
      
      setBoard(clearedBoard)
      setLines(prev => prev + linesCleared)
      setScore(prev => prev + linesCleared * 100 * level)
      setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1)
      
      // 生成新方块
      const newNextPiece = createPiece()
      setCurrentPiece(nextPiece)
      setNextPiece(newNextPiece)
      
      // 检查游戏结束
      if (checkCollision(clearedBoard, nextPiece)) {
        setGameOver(true)
      }
    } else {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, board, level, lines, isPaused])

  // 移动方块
  const movePiece = useCallback((direction) => {
    if (!currentPiece || isPaused || gameOver) return
    
    const newPiece = { ...currentPiece, x: currentPiece.x + direction }
    
    if (!checkCollision(board, newPiece)) {
      setCurrentPiece(newPiece)
    }
  }, [currentPiece, board, isPaused, gameOver])

  // 旋转方块
  const rotatePiece = useCallback(() => {
    if (!currentPiece || isPaused) return
    
    const rotated = rotate(currentPiece)
    
    // 墙踢（wall kick）- 尝试多个位置
    const kicks = [0, -1, 1, -2, 2]
    for (const kick of kicks) {
      const newPiece = { ...rotated, x: currentPiece.x + kick }
      if (!checkCollision(board, newPiece)) {
        setCurrentPiece(newPiece)
        break
      }
    }
  }, [currentPiece, board, isPaused])

  // 快速下落
  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    
    let newY = currentPiece.y
    while (!checkCollision(board, { ...currentPiece, y: newY + 1 })) {
      newY++
    }
    
    const newPiece = { ...currentPiece, y: newY }
    const newBoard = mergePiece(board, newPiece)
    const { board: clearedBoard, linesCleared } = clearLines(newBoard)
    
    setBoard(clearedBoard)
    setLines(prev => prev + linesCleared)
    setScore(prev => prev + linesCleared * 100 * level)
    setLevel(prev => Math.floor((lines + linesCleared) / 10) + 1)
    
    const newNextPiece = createPiece()
    setCurrentPiece(nextPiece)
    setNextPiece(newNextPiece)
    
    if (checkCollision(clearedBoard, nextPiece)) {
      setGameOver(true)
    }
  }, [currentPiece, board, level, lines, isPaused, gameOver])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1)
          break
        case 'ArrowDown':
          e.preventDefault()
          dropPiece()
          break
        case 'ArrowUp':
          e.preventDefault()
          rotatePiece()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          setIsPaused(prev => {
            isPausedRef.current = !prev
            return !prev
          })
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [movePiece, dropPiece, rotatePiece, hardDrop])

  // 游戏循环
  const update = useCallback((time = 0) => {
    if (isPaused) return
    
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    
    dropCounterRef.current += deltaTime
    
    if (dropCounterRef.current > dropIntervalRef.current) {
      dropPiece()
      dropCounterRef.current = 0
    }
    
    drawBoard()
    drawNextPiece()
    
    requestRef.current = requestAnimationFrame(update)
  }, [dropPiece, drawBoard, drawNextPiece, isPaused])

  // 初始化游戏
  useEffect(() => {
    const initGame = () => {
      setBoard(createBoard())
      const piece = createPiece()
      setCurrentPiece(piece)
      setNextPiece(createPiece())
      setScore(0)
      setLevel(1)
      setLines(0)
      setGameOver(false)
      setIsPaused(false)
      dropCounterRef.current = 0
      lastTimeRef.current = 0
    }
    
    initGame()
    
    requestRef.current = requestAnimationFrame(update)
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])

  // 重新开始游戏
  const restartGame = () => {
    setBoard(createBoard())
    const piece = createPiece()
    setCurrentPiece(piece)
    setNextPiece(createPiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    dropCounterRef.current = 0
    lastTimeRef.current = 0
  }

  // 切换暂停
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <div className="game-container">
      <h1>🎮 俄罗斯方块</h1>
      
      <div className="game-area">
        <canvas
          ref={canvasRef}
          width={COLS * BLOCK_SIZE}
          height={ROWS * BLOCK_SIZE}
          className="game-canvas"
        />
        
        <div className="side-panel">
          <div className="info-box">
            <div className="info-label">下一个</div>
            <canvas
              ref={nextCanvasRef}
              width={4 * BLOCK_SIZE}
              height={4 * BLOCK_SIZE}
              className="next-canvas"
            />
          </div>
          
          <div className="info-box">
            <div className="info-label">分数</div>
            <div className="info-value">{score}</div>
          </div>
          
          <div className="info-box">
            <div className="info-label">等级</div>
            <div className="info-value">{level}</div>
          </div>
          
          <div className="info-box">
            <div className="info-label">行数</div>
            <div className="info-value">{lines}</div>
          </div>
          
          <div className="controls">
            <button onClick={togglePause} className="control-btn">
              {isPaused ? '▶️ 继续' : '⏸️ 暂停'}
            </button>
            <button onClick={restartGame} className="control-btn">
              🔄 重新开始
            </button>
          </div>
        </div>
      </div>
      
      <div className="instructions">
        <h3>🎯 操作说明</h3>
        <div className="instruction-grid">
          <div className="instruction-item">
            <span className="key">←</span>
            <span className="description">左移</span>
          </div>
          <div className="instruction-item">
            <span className="key">→</span>
            <span className="description">右移</span>
          </div>
          <div className="instruction-item">
            <span className="key">↓</span>
            <span className="description">下落</span>
          </div>
          <div className="instruction-item">
            <span className="key">↑</span>
            <span className="description">旋转</span>
          </div>
          <div className="instruction-item">
            <span className="key">空格</span>
            <span className="description">快速下落</span>
          </div>
          <div className="instruction-item">
            <span className="key">P</span>
            <span className="description">暂停</span>
          </div>
        </div>
      </div>
      
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>游戏结束</h2>
            <p>最终分数：<span className="final-score">{score}</span></p>
            <button onClick={restartGame} className="restart-btn">
              重新开始
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
