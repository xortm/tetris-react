#!/bin/bash
# 部署状态检查脚本

DEPLOY_URL="https://xortm.github.io/tetris-react/"
STATUS_FILE="/tmp/tetris-react-deployment-status"

echo "🔄 开始监控部署状态..."
echo "部署地址: $DEPLOY_URL"
echo "检查间隔: 10 秒"
echo ""

# 检查循环
for i in {1..30}; do
  echo "[$i/30] 检查部署状态..."

  # 尝试访问部署地址
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL")

  if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "✅ 部署成功！"
    echo "HTTP 状态码: 200"
    echo "访问地址: $DEPLOY_URL"
    echo ""
    echo "🎉 React 版本俄罗斯方块已成功部署到 GitHub Pages！"
    echo ""

    # 保存成功状态
    echo "success" > "$STATUS_FILE"

    # 发送成功通知
    echo "DEPLOYMENT_SUCCESS: HTTP $HTTP_CODE"
    break
  else
    echo "⏳ 当前状态: HTTP $HTTP_CODE (等待中...)"
  fi

  # 等待 10 秒
  sleep 10
done

# 检查是否超时
if [ ! -f "$STATUS_FILE" ]; then
  echo ""
  echo "⚠️ 部署检查超时"
  echo "请手动检查部署状态:"
  echo "1. GitHub Actions: https://github.com/xortm/tetris-react/actions"
  echo "2. GitHub Pages: https://github.com/xortm/tetris-react/settings/pages"
  echo "3. 访问地址: $DEPLOY_URL"
fi
