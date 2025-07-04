/**
 * 碰撞检测工具函数
 */

/**
 * 矩形碰撞检测
 * @param {Object} rect1 - 第一个矩形对象，包含 x, y, width, height 属性
 * @param {Object} rect2 - 第二个矩形对象，包含 x, y, width, height 属性
 * @returns {boolean} - 是否发生碰撞
 */
export function rectangleCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y
}

/**
 * 圆形碰撞检测
 * @param {Object} circle1 - 第一个圆形对象，包含 x, y, radius 属性
 * @param {Object} circle2 - 第二个圆形对象，包含 x, y, radius 属性
 * @returns {boolean} - 是否发生碰撞
 */
export function circleCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x
  const dy = circle1.y - circle2.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance < circle1.radius + circle2.radius
}

/**
 * 点与矩形碰撞检测
 * @param {Object} point - 点对象，包含 x, y 属性
 * @param {Object} rect - 矩形对象，包含 x, y, width, height 属性
 * @returns {boolean} - 是否发生碰撞
 */
export function pointRectangleCollision(point, rect) {
  return point.x >= rect.x &&
         point.x <= rect.x + rect.width &&
         point.y >= rect.y &&
         point.y <= rect.y + rect.height
}

/**
 * 线段与矩形碰撞检测
 * @param {Object} line - 线段对象，包含 x1, y1, x2, y2 属性
 * @param {Object} rect - 矩形对象，包含 x, y, width, height 属性
 * @returns {boolean} - 是否发生碰撞
 */
export function lineRectangleCollision(line, rect) {
  // 检查线段端点是否在矩形内
  if (pointRectangleCollision({x: line.x1, y: line.y1}, rect) ||
      pointRectangleCollision({x: line.x2, y: line.y2}, rect)) {
    return true
  }
  
  // 检查线段是否与矩形边界相交
  return lineIntersection(line, {x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y}) ||
         lineIntersection(line, {x1: rect.x + rect.width, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height}) ||
         lineIntersection(line, {x1: rect.x + rect.width, y1: rect.y + rect.height, x2: rect.x, y2: rect.y + rect.height}) ||
         lineIntersection(line, {x1: rect.x, y1: rect.y + rect.height, x2: rect.x, y2: rect.y})
}

/**
 * 两条线段相交检测
 * @param {Object} line1 - 第一条线段，包含 x1, y1, x2, y2 属性
 * @param {Object} line2 - 第二条线段，包含 x1, y1, x2, y2 属性
 * @returns {boolean} - 是否相交
 */
export function lineIntersection(line1, line2) {
  const det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1)
  if (det === 0) return false // 平行线
  
  const lambda = ((line2.y2 - line2.y1) * (line2.x2 - line1.x1) + (line2.x1 - line2.x2) * (line2.y2 - line1.y1)) / det
  const gamma = ((line1.y1 - line1.y2) * (line2.x2 - line1.x1) + (line1.x2 - line1.x1) * (line2.y2 - line1.y1)) / det
  
  return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
}

/**
 * 获取两个矩形的重叠区域
 * @param {Object} rect1 - 第一个矩形
 * @param {Object} rect2 - 第二个矩形
 * @returns {Object|null} - 重叠区域矩形，如果没有重叠返回null
 */
export function getOverlapArea(rect1, rect2) {
  if (!rectangleCollision(rect1, rect2)) {
    return null
  }
  
  const left = Math.max(rect1.x, rect2.x)
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width)
  const top = Math.max(rect1.y, rect2.y)
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height)
  
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  }
}

/**
 * 计算两点之间的距离
 * @param {Object} point1 - 第一个点，包含 x, y 属性
 * @param {Object} point2 - 第二个点，包含 x, y 属性
 * @returns {number} - 距离
 */
export function distance(point1, point2) {
  const dx = point1.x - point2.x
  const dy = point1.y - point2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 检查对象是否在屏幕边界内
 * @param {Object} obj - 对象，包含 x, y, width, height 属性
 * @param {number} screenWidth - 屏幕宽度
 * @param {number} screenHeight - 屏幕高度
 * @returns {boolean} - 是否在边界内
 */
export function isInBounds(obj, screenWidth, screenHeight) {
  return obj.x >= 0 && obj.x + obj.width <= screenWidth &&
         obj.y >= 0 && obj.y + obj.height <= screenHeight
}

/**
 * 检查对象是否完全离开屏幕
 * @param {Object} obj - 对象，包含 x, y, width, height 属性
 * @param {number} screenWidth - 屏幕宽度
 * @param {number} screenHeight - 屏幕高度
 * @returns {boolean} - 是否完全离开屏幕
 */
export function isOutOfBounds(obj, screenWidth, screenHeight) {
  return obj.x + obj.width < 0 || obj.x > screenWidth ||
         obj.y + obj.height < 0 || obj.y > screenHeight
} 