import { _decorator, Color, Component, EventTouch, Graphics, Node, tween, Tween, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FiveStarBg')
export class FiveStarBg extends Component {





    graphics: Graphics
    graphics2: Graphics

    lastPoint: Vec2
    childNode: Node

    private tw: Tween<unknown>
    start() {
        this.graphics = this.node.getComponent(Graphics)
        this.drawMagicaCircl()

        this.lastPoint = null // 上一个触摸点
        // 用新节点监听触摸绘画效果
        this.childNode = new Node('ChildNode')
        const tran = this.childNode.addComponent(UITransform)
        tran.setContentSize(this.node.getComponent(UITransform).contentSize)
        tran.setAnchorPoint(0, 0)
        this.childNode.setPosition(-tran.contentSize.width / 2, -tran.contentSize.height / 2) //锚点改了，位置也要改
        this.graphics2 = this.childNode.addComponent(Graphics)
        this.node.addChild(this.childNode)

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }
    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    onTouchStart(event: EventTouch) {
        let touch = event.touch
        this.lastPoint = touch.getLocation()

        this.graphics2.lineCap = Graphics.LineCap.ROUND
        this.graphics2.lineJoin = Graphics.LineJoin.ROUND
        this.graphics2.strokeColor = Color.WHITE // 线条颜色
        this.graphics2.lineWidth = 10

        this.graphics2.moveTo(this.lastPoint.x, this.lastPoint.y)

        // 计算速度或距离，动态调整线宽
        // this.tw = tween(this.graphics2).to(0.3, { lineWidth: 6 }).start()
    }

    onTouchMove(event: EventTouch) {
        let touch = event.touch
        let currentPoint = touch.getLocation()

        this.graphics2.moveTo(this.lastPoint.x, this.lastPoint.y)
        this.graphics2.lineTo(currentPoint.x, currentPoint.y)
        this.graphics2.stroke()

        // 更新上一个触摸点
        this.lastPoint = currentPoint
    }

    onTouchEnd(event: EventTouch) {
        this.lastPoint = null
        // this.offEvent()

        // 防抖
        this.unschedule(this.clearCanvas)
        this.scheduleOnce(this.clearCanvas, 1)
    }
    clearCanvas() {
        this.graphics2.clear()
    }

    drawMagicaCircl() {
        let graphics = this.graphics
        // 五芒星的五个顶点
        let radius = 200 // 增大五芒星半径

        // 绘制外圈圆
        graphics.lineWidth = 10 // 线宽
        graphics.strokeColor = Color.WHITE // 线条颜色
        let outerCircleRadius = radius * 1.1 // 外圈圆半径稍大于五芒星半径
        // graphics.circle(0, 0, outerCircleRadius)
        // graphics.stroke()
        let from = { angle: 0 }
        let to = { angle: 2 * Math.PI }
        tween(from)
            .to(0.5, to, {
                onUpdate: () => {
                    // 更新角度
                    // graphics.clear() // 清除之前的绘制
                    graphics.arc(0, 0, outerCircleRadius, Math.PI / 2, from.angle + Math.PI / 2, true) // 使用from对象的角度
                    graphics.stroke()
                },
            })
            .start()

        // 初始化五芒星的顶点数组
        let points = []
        let angle = 90 // 开始角度设置为90度，这样第一个点是朝上的

        // 计算五个顶点的坐标
        for (let i = 0; i < 5; i++) {
            // let angle = (i * 72 * Math.PI) / 180 - Math.PI / 2
            let rad = (Math.PI / 180) * (angle + i * 72) // 将角度转换为弧度
            points.push({
                x: radius * Math.cos(rad),
                y: radius * Math.sin(rad),
            })
        }

        // 绘制五芒星
        graphics.lineWidth = 10 // 线宽
        graphics.strokeColor = Color.WHITE // 线条颜色

        const connectOrder = [0, 2, 4, 1, 3, 0] // 修正后的正确连接顺序
        // 定义一个状态对象来记录绘制进度
        let drawState = { value: 0 }
        // 使用tween逐步改变drawState.value，从0改变到5（因为有5个顶点）
        tween(drawState)
            .delay(0.5)
            .to(
                2,
                { value: 5 },
                {
                    onUpdate: () => {
                        graphics.lineCap = Graphics.LineCap.ROUND // 设置线条端点样式为圆形
                        // 绘制五芒星的黑色轮廓
                        graphics.lineWidth = 20 // 线宽
                        graphics.strokeColor = Color.BLACK // 线条颜色

                        // 根据当前的绘制状态绘制线条
                        const currentPoint = Math.floor(drawState.value)

                        graphics.moveTo(points[0].x, points[0].y) // 移动到起始顶点

                        for (let i = 1; i <= currentPoint && i < connectOrder.length; i++) {
                            let pointIndex = connectOrder[i]
                            graphics.lineTo(points[pointIndex].x, points[pointIndex].y)
                        }

                        // 如果不是整数，则绘制一部分的线条
                        if (drawState.value % 1 !== 0 && currentPoint < connectOrder.length - 1) {
                            let nextPointIndex = connectOrder[currentPoint + 1]
                            let lastPointIndex = connectOrder[currentPoint]
                            // 计算两点之间的插值
                            let partialX =
                                points[lastPointIndex].x + (points[nextPointIndex].x - points[lastPointIndex].x) * (drawState.value % 1)
                            let partialY =
                                points[lastPointIndex].y + (points[nextPointIndex].y - points[lastPointIndex].y) * (drawState.value % 1)
                            // 绘制到当前的位置
                            graphics.lineTo(partialX, partialY)
                        }

                        graphics.stroke() // 完成本次绘制

                        // 绘制白五芒星
                        graphics.lineWidth = 10 // 线宽
                        graphics.strokeColor = Color.WHITE // 线条颜色

                        graphics.moveTo(points[0].x, points[0].y) // 移动到起始顶点

                        // 根据当前的绘制状态绘制线条
                        for (let i = 1; i <= currentPoint && i < connectOrder.length; i++) {
                            let pointIndex = connectOrder[i]
                            graphics.lineTo(points[pointIndex].x, points[pointIndex].y)
                        }

                        // 如果不是整数，则绘制一部分的线条
                        if (drawState.value % 1 !== 0 && currentPoint < connectOrder.length - 1) {
                            let nextPointIndex = connectOrder[currentPoint + 1]
                            let lastPointIndex = connectOrder[currentPoint]
                            // 计算两点之间的插值
                            let partialX =
                                points[lastPointIndex].x + (points[nextPointIndex].x - points[lastPointIndex].x) * (drawState.value % 1)
                            let partialY =
                                points[lastPointIndex].y + (points[nextPointIndex].y - points[lastPointIndex].y) * (drawState.value % 1)
                            // 绘制到当前的位置
                            graphics.lineTo(partialX, partialY)
                        }

                        graphics.stroke() // 完成本次绘制
                    },
                    easing: 'linear',
                },
            )
            .start() // 开始过渡动画

        // for (let i = 1; i < connectOrder.length; i++) {
        //   let pointIndex = connectOrder[i]
        //   graphics.lineTo(points[pointIndex].x, points[pointIndex].y)
        // }
        // graphics.stroke()
    }

    update(deltaTime: number) { }












}


