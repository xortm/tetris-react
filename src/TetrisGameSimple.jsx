import React, { useState } from 'react'

export default function TetrisGameSimple() {
  const [gameStarted, setGameStarted] = useState(false)
  const [clicks, setClicks] = useState(0)

  console.log('组件渲染:', { gameStarted, clicks })

  const handleStartClick = () => {
    console.log('开始按钮被点击了!')
    setClicks(prev => prev + 1)
    setGameStarted(true)
  }

  const handleRestartClick = () => {
    console.log('重新开始按钮被点击了!')
    setClicks(prev => prev + 1)
    setGameStarted(false)
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎮 简化测试版</h1>
      <p>点击次数: {clicks}</p>
      <p>游戏状态: {gameStarted ? '已开始' : '未开始'}</p>

      {!gameStarted ? (
        <button
          onClick={handleStartClick}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          开始游戏
        </button>
      ) : (
        <button
          onClick={handleRestartClick}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          重新开始
        </button>
      )}

      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>调试信息</h3>
        <p>打开浏览器控制台（F12）查看日志</p>
        <p>如果按钮点击后数字没有变化，说明有 JavaScript 错误</p>
      </div>
    </div>
  )
}
