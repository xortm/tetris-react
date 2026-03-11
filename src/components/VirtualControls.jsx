import React, { useState, useCallback } from 'react'
import './VirtualControls.css'

/**
 * 虚拟方向键组件 - 专为移动设备优化
 * 提供触摸友好的 D-Pad 方向键和操作按钮
 */
export default function VirtualControls({ onMove, onRotate, onHardDrop, onPause }) {
  const [activeKey, setActive setActiveKey] = useState(null)
  
  // 处理触摸开始
  const handleTouchStart = useCallback((key) => {
    setActiveKey(key)
  }, [])
  
  // 处理触摸结束
  const handleTouchEnd = useCallback(() => {
    setActiveKey(null)
  }, [])
  
  // 处理移动操作
  const handleTouchMove = useCallback((direction) => {
    onMove(direction)
  }, [onMove])
  
  return (
    <div className="virtual-controls">
      <div className="d-pad">
        <button
          className={`d-btn left ${activeKey === 'left' ? 'active' : ''}`}
          onTouchStart={() => handleTouchStart('left')}
          onTouchEnd={handleTouchEnd}
          onClick={() => onMove('left')}
        >
          ←
        </button>
        
        <button
          className={`d-btn down ${activeKey === 'down' ? 'active' : ''}`}
          onTouchStart={() => handleTouchStart('down')}
          onTouchEnd={handleTouchEnd}
          onClick={() => onMove('down')}
        >
          ↓
        </button>
        
        <button
          className={`d-btn right ${activeKey === 'right' ? 'active' : ''}`}
          onTouchStart={() => handleTouchStart('right')}
          onTouchEnd={handleTouchEnd}
          onClick={() => onMove('right')}
        >
          →
        </button>
      </div>
      
      <div className="action-buttons">
        <button
          className="action-btn rotate"
          onTouchStart={() => handleTouchStart('rotate')}
          onTouchEnd={handleTouchEnd}
          onClick={onRotate}
        >
          🔄
        </button>
        
        <button
          className="action-btn drop"
          onTouchStart={() => handleTouchStart('drop')}
          onTouchEnd={handleTouchEnd}
          onClick={onHardDrop}
        >
          ⏬
        </button>
        
        <button
          className={`action-btn pause ${activeKey === 'pause' ? 'active' : ''}`}
          onTouchStart={() => handleTouchStart('pause')}
          onTouchEnd={handleTouchEnd}
          onClick={onPause}
        >
          {activeKey === 'pause' ? '▶️ 继续' : '⏸️ 暂停'}
        </button>
      </div>
    </div>
  )
}
