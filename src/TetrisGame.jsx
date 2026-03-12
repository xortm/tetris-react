import React, { useRef, useEffect, useState, useCallback } from 'react'
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
} from './utils/gameLogic.js'

export default function TetrisGame() {
  const canvasRef = useRef(null)
  const nextCanvasRef = useRef(null)
  
  // 游戏状态
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  
  // 游戏数据 refs
  const boardRef = useRef(null)
  const currentPieceRef = useRef(null)
  const nextPieceRef = useRef(null)
  const gameLoopRef = useRef(null)
  const lastTimeRef = useRef(0)
  const dropCounterRef = useRef(0)
  const dropIntervalRef = useRef(1000)

  // 绘制单个方块
  const drawBlock = useCallback((ctx, x, y, color) => {
    ctx.fillStyle = color
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1)
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, 3)
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE - 1)
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE + BLOCK_SIZE - 3, BLOCK_SIZE - 1, 3)
    ctx.fillRect(x * BLOCK_SIZE + BLOCK_SIZE - 3, y * BLOCK_SIZE, 3, BLOCK_SIZE - 1)
  }, [])

  // 绘制棋盘
  const drawBoard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !boardRef.current) return
    
    const ctx = canvas.getContext('2d')
    const board = boardRef.current
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
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
    
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          drawBlock(ctx, x, y, cell)
        }
      })
    })
    
    if (currentPieceRef.current) {
      const piece = currentPieceRef.current
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, piece.x + x, piece.y + y, piece.color)
          }
        })
      })
    }
  }, [drawBlock])

  // 绘制下一个方块
  const drawNextPiece = useCallback(() => {
    const canvas = nextCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const nextPiece = nextPieceRef.current
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    if (!nextPiece) return
    
    const offsetX = (4 - nextPiece.shape[0].length) / 2
    const offsetY = (4 - nextPiece.shape.length) / 2
    
    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          drawBlock(ctx, offsetX + x, offsetY + y, nextPiece.color)
        }
      })
    })
  }, [drawBlock])

  // 渲染
  const render = useCallback(() => {
    drawBoard()
    drawNextPiece()
  }, [drawBoard, drawNextPiece])

  // 停止游戏循环
  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }, [])

  // 游戏循环
  const gameLoop = useCallback((timestamp) => {
    if (!gameStarted || isPaused || gameOver) {
      return
    }
    
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    
    dropCounterRef.current += deltaTime
    
    if (dropCounterRef.current > dropIntervalRef.current) {
      dropCounterRef.current = 0
      
      // 下落逻辑
      if (currentPieceRef.current) {
        const piece = currentPieceRef.current
        const newPiece = { ...piece, y: piece.y + 1 }
        
        if (checkCollision(boardRef.current, newPiece)) {
          // 碰撞，合并方块
          const newBoard = mergePiece(boardRef.current, piece)
          const { board: clearedBoard, linesCleared } = clearLines(newBoard)
          
          // 更新分数
          const newLines = lines + linesCleared
          const newScore = score + linesCleared * 100 * level
          const newLevel = Math.floor(newLines / 10) + 1
          
          boardRef.current = clearedBoard
          
          // 生成下一个方块
          currentPieceRef.current = nextPieceRef.current
          nextPieceRef.current = createPiece()
          
          setLines(newLines)
          setScore(newScore)
          setLevel(newLevel)
          
          // 检查游戏结束
          if (checkCollision(boardRef.current, currentPieceRef.current)) {
            setGameOver(true)
            stopGameLoop()
          }
        } else {
          currentPieceRef.current = newPiece
        }
      }
    }
    
    render()
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameStarted, isPaused, gameOver, lines, score, level, render, stopGameLoop])

  // 开始游戏循环
  const startGameLoop = useCallback(() => {
    lastTimeRef.current = performance.now()
    dropCounterRef.current = 0
    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  // 移动方块
  const movePiece = useCallback((direction) => {
    if (!currentPieceRef.current || isPaused || gameOver) return
    
    const piece = currentPieceRef.current
    const newPiece = { ...piece, x: piece.x + direction }
    
    if (!checkCollision(boardRef.current, newPiece)) {
      currentPieceRef.current = newPiece
      render()
    }
  }, [isPaused, gameOver, render])

  // 旋转方块
  const rotatePiece = useCallback(() => {
    if (!currentPieceRef.current || isPaused || gameOver) return
    
    const piece = currentPieceRef.current
    const rotated = rotate(piece)
    
    // 墙踢
    const kicks = [0, -1, 1, -2, 2]
    for (const kick of kicks) {
      const newPiece = { ...rotated, x: piece.x + kick }
      if (!checkCollision(boardRef.current, newPiece)) {
        currentPieceRef.current = newPiece
        render()
        break
      }
    }
  }, [isPaused, gameOver, render])

  // 快速下落
  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current || isPaused || gameOver) return
    
    const piece = currentPieceRef.current
    let newY = piece.y
    while (!checkCollision(boardRef.current, { ...piece, y: newY + 1 })) {
      newY++
    }
    
    const newPiece = { ...piece, y: newY }
    const newBoard = mergePiece(boardRef.current, newPiece)
    const { board: clearedBoard, linesCleared } = clearLines(newBoard)
    
    // 更新分数
    const newLines = lines + linesCleared
    const newScore = score + linesCleared * 100 * level
    const newLevel = Math.floor(newLines / 10) + 1
    
    boardRef.current = clearedBoard
    currentPieceRef.current = nextPieceRef.current
    nextPieceRef.current = createPiece()
    
    setLines(newLines)
    setScore(newScore)
    setLevel(newLevel)
    
    // 检查游戏结束
    if (checkCollision(boardRef.current, currentPieceRef.current)) {
      setGameOver(true)
      stopGameLoop()
    }
    
    render()
  }, [isPaused, gameOver, lines, score, level, render, stopGameLoop])

  // 开始游戏
  const startGame = useCallback(() => {
    console.log('开始游戏')
    
    boardRef.current = createBoard()
    currentPieceRef.current = createPiece()
    nextPieceRef.current = createPiece()
    
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(true)
    
    setTimeout(() => {
      startGameLoop()
      render()
    }, 100)
  }, [startGameLoop, render])

  // 重新开始游戏
  const restartGame = useCallback(() => {
    stopGameLoop()
    setGameStarted(false)
    setGameOver(false)
    
    setTimeout(() => {
      startGame()
    }, 100)
  }, [stopGameLoop, startGame])

  // 键盘事件
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
          gameLoopRef.current && cancelAnimationFrame(gameLoopRef.current)
          gameLoopRef.current = requestAnimationFrame(gameLoop)
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
            if (!prev) {
              stopGameLoop()
            } else {
              startGameLoop()
            }
            return !prev
          })
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, movePiece, rotatePiece, hardDrop, gameLoop, startGameLoop, stopGameLoop])

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
              <button onClick={() => setIsPaused(prev => {
                if (!prev) {
                  stopGameLoop()
                } else {
                  startGameLoop()
                }
                return !prev
              })} className="control-btn">
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
