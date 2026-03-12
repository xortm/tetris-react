import React, { useState } from 'react'

export default function TetrisGame() {
  const [gameStarted, setGameStarted] = useState(false)

  // 直接返回简单的HTML，防止黑屏
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#38bdf8', marginBottom: '10px' }}>🎮 俄罗斯方块</h1>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '30px' }}>
        版本号 v1.0.3 | 2026-03-12 13:57 构建
      </div>

      {!gameStarted ? (
        <div>
          <h2 style={{ color: '#38bdf8', marginBottom: '20px' }}>俄罗斯方块</h2>
          <button 
            onClick={() => {
              alert('按钮点击成功！游戏即将开始')
              setGameStarted(true)
            }}
            style={{
              fontSize: '24px',
              padding: '20px 40px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            👉 开始游戏 👈
          </button>
        </div>
      ) : (
        <div>
          <h3>游戏正在加载...</h3>
          <p>功能开发中，敬请期待！</p>
          <button 
            onClick={() => setGameStarted(false)}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            返回主页
          </button>
        </div>
      )}

      <div style={{ 
        marginTop: '50px', 
        padding: '20px', 
        border: '2px dashed #ccc', 
        display: 'inline-block',
        borderRadius: '8px'
      }}>
        <h3>调试信息</h3>
        <p>如果按钮点击有反应，说明功能正常</p>
        <p>如果没有反应，请打开F12控制台查看错误</p>
      </div>
    </div>
  )
}
