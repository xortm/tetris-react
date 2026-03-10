import React, { useRef, useEffect, useCallback, useState } from 'react'
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
  const [board, setBoard] = useState(createBoard())
  const [currentPiece, setCurrentPiece] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  
  // 计时器引用
  const dropCounterRef = useRef(0)
  const dropIntervalRef = useRef(1000)
  const lastTimeRef = useRef(0)
  
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
    if (!canvas) return
    
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
    if (!canvas) return
    
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

  // 绘制游戏画面
  const render = useCallback(() => {
    drawBoard()
    drawNextPiece()
  }, [drawBoard, drawNextPiece])

  // 方块下落
  const dropPiece = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    
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
  }, [currentPiece, board, level, lines, nextPiece, isPaused, gameOver])

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
    if (!currentPiece || isPaused || gameOver) return
    
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
  }, [currentPiece, board, isPaused, gameOver])

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
  }, [currentPiece, board, level, lines, nextPiece, isPaused, gameOver])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted || gameOver) return
      
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
          setIsPaused(prev => !prev)
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, movePiece, dropPiece, rotatePiece, hardDrop])

  // 游戏循环
  const gameLoop = useCallback((time = 0) => {
    if (!gameStarted || isPaused || gameOver) {
      if (gameStarted && !isPaused && !gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop)
      }
      return
    }
    
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    
    dropCounterRef.current += deltaTime
    
    if (dropCounterRef.current > dropIntervalRef.current) {
      dropPiece()
      dropCounterRef.current = 0
    }
    
    render()
    
    requestRef.current = requestAnimationFrame(gameLoop)
  }, [gameStarted, isPaused, gameOver, dropPiece, render])

  // 当游戏状态改变时更新循环
  useEffect(() => {
    if (gameStarted && !isPaused && !gameOver) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      lastTimeRef.current = performance.now()
      requestRef.current = requestAnimationFrame(gameLoop)
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current)
      requestRef.current = null
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameStarted, isPaused, gameOver, gameLoop])

  // 初始化画面
  useEffect(() => {
    render()
  }, [render])

  // 开始游戏
  const startGame = () => {
    setBoard(createBoard())
    const piece = createPiece()
    setCurrentPiece(piece)
    setNextPiece(createPiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(true)
    dropCounterRef.current = 0
    lastTimeRef.current = performance.now()
  }

  // 重新开始游戏
  const restartGame = () => {
    startGame()
  }

  // 切换暂停
  const togglePause = () => {
    if (!gameStarted) return
    setIsPaused(prev => !prev)
  }

  return (
    <div className="game-container">
      <h1>🎮 俄罗斯方块</h1>
      
      {!gameStarted ? (
        <div className="start-overlay">
          <div className="start-content">
            <h2>俄罗斯方块</h2>
            <button onClick={startGame} className="start-btn">
              开始游戏
            </button>
          </div>
        </div>
      ) : (
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
      )}
      
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
