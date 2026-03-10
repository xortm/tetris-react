import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

describe('TetrisGame 组件测试', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      return setTimeout(cb, 16)
    })
    
    // Mock cancelAnimationFrame
    global.cancelAnimationFrame = vi.fn((id) => {
      clearTimeout(id)
    })
    
    // Mock performance.now
    global.performance = {
      now: vi.fn(() => Date.now())
    }
    
    // Mock Canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => {
      return {
        fillStyle: null,
        fillRect: vi.fn(),
        strokeStyle: null,
        lineWidth: null,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始渲染', () => {
    it('应该渲染游戏标题', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      render(React.createElement(TetrisGame))
      
      expect(screen.getByText('🎮 俄罗斯方块')).toBeInTheDocument()
    })

    it('应该显示开始游戏按钮', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      render(React.createElement(TetrisGame))
      
      expect(screen.getByText('开始游戏')).toBeInTheDocument()
    })

    it('应该显示操作说明', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      render(React.createElement(TetrisGame))
      
      expect(screen.getByText('🎯 操作说明')).toBeInTheDocument()
      expect(screen.getByText('左移')).toBeInTheDocument()
      expect(screen.getByText('右移')).toBeInTheDocument()
      expect(screen.getByText('下落')).toBeInTheDocument()
      expect(screen.getByText('旋转')).toBeInTheDocument()
      expect(screen.getByText('快速下落')).toBeInTheDocument()
      expect(screen.getByText('暂停')).toBeInTheDocument()
    })

    it('应该渲染画布', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      const { container } = render(React.createElement(TetrisGame))
      
      // Before game starts, canvases might not be visible yet
      // Let's start the game first
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        const canvases = container.querySelectorAll('canvas')
        expect(canvases.length).toBeGreaterThanOrEqual(2)
      }, { timeout: 3000 })
    })
  })

  describe('游戏开始', () => {
    it('点击开始按钮应该开始游戏', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('开始游戏后应该显示游戏信息', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText('下一个')).toBeInTheDocument()
        expect(screen.getByText('分数')).toBeInTheDocument()
        expect(screen.getByText('等级')).toBeInTheDocument()
        expect(screen.getByText('行数')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('开始游戏后应该显示控制按钮', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.getByText('⏸️ 暂停')).toBeInTheDocument()
        expect(screen.getByText('🔄 重新开始')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('开始游戏后应该初始化分数为0', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        const scoreElements = screen.getAllByText('0')
        expect(scoreElements.length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })
  })

  describe('键盘控制', () => {
    beforeEach(async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      // Wait for game to start
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('按下左箭头键应该不报错', async () => {
      await userEvent.keyboard('{ArrowLeft}')
      // If no error is thrown, the test passes
    })

    it('按下右箭头键应该不报错', async () => {
      await userEvent.keyboard('{ArrowRight}')
    })

    it('按下上箭头键应该不报错', async () => {
      await userEvent.keyboard('{ArrowUp}')
    })

    it('按下下箭头键应该不报错', async () => {
      await userEvent.keyboard('{ArrowDown}')
    })

    it('按下空格键应该不报错', async () => {
      await userEvent.keyboard(' ')
    })

    it('按下P键应该暂停游戏', async () => {
      await userEvent.keyboard('p')
      
      await waitFor(() => {
        expect(screen.getByText('▶️ 继续')).toBeInTheDocument()
      }, { timeout: 1000 })
    })
  })

  describe('暂停功能', () => {
    it('点击暂停按钮应该暂停游戏', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
      
      const pauseButton = screen.getByText('⏸️ 暂停')
      await user.click(pauseButton)
      
      expect(screen.getByText('▶️ 继续')).toBeInTheDocument()
    })

    it('点击继续按钮应该恢复游戏', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
      
      const pauseButton = screen.getByText('⏸️ 暂停')
      await user.click(pauseButton)
      
      const continueButton = screen.getByText('▶️ 继续')
      await user.click(continueButton)
      
      expect(screen.getByText('⏸️ 暂停')).toBeInTheDocument()
    })
  })

  describe('重新开始功能', () => {
    it('点击重新开始按钮应该重置游戏', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
      
      const restartButton = screen.getByText('🔄 重新开始')
      await user.click(restartButton)
      
      // Game should still be running
      expect(screen.getByText('⏸️ 暂停')).toBeInTheDocument()
    })
  })

  describe('响应式设计', () => {
    it('应该在小屏幕上正常渲染', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      })
      
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      render(React.createElement(TetrisGame))
      
      expect(screen.getByText('🎮 俄罗斯方块')).toBeInTheDocument()
      expect(screen.getByText('开始游戏')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该正确处理多次开始游戏', async () => {
      const { default: TetrisGame } = await import('../TetrisGame.jsx')
      const user = userEvent.setup()
      
      // First game instance
      const { unmount } = render(React.createElement(TetrisGame))
      
      const startButton = screen.getByText('开始游戏')
      await user.click(startButton)
      
      await waitFor(() => {
        expect(screen.queryByText('开始游戏')).not.toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Unmount first instance
      unmount()
      
      // Mount new instance - should show start button again
      render(React.createElement(TetrisGame))
      
      expect(screen.getByText('开始游戏')).toBeInTheDocument()
    })
  })
})
