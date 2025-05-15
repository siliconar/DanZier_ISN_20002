import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_Aim_Line_Manager_Controller')
export class UI_Aim_Line_Manager_Controller extends Component {



    //---- 单例
    static Instance: UI_Aim_Line_Manager_Controller

    protected onLoad(): void {
        // super.onLoad();
        UI_Aim_Line_Manager_Controller.Instance = this;
    }


    //---- 变量



    //--= 组件
    obj_lastcircle:Node = null;   // 最终的目标圆


    start() {

        // 初始化组件
        this.obj_lastcircle = this.node.children[0]; // 最终的目标圆

    }


    //---------- 虚拟路径
    // dept:使用射线检测。
    // 1. 起点，方向，发出射线
    // 2. 最近触碰
    // 3. 判断是否距离足够。
    // 4. 计算碰撞点和中心点。
    // 4.1 计算碰撞法线，确定折射方向。
    // 5. 新方向和起点，回到步骤1


    // 给定速度向量，画出所有的【瞄准线】和【碰撞点】
    Draw_AimLine(start_worldpos:Vec3, v2_strength:Vec2, damp1:number)
    {
        // start_worldpos 起始点坐标
        // v2_strength 速度向量
        // damp1 阻尼

        // 质量,但是实际这个不是质量，而是系统内部设置的“物理单位到世界坐标系单位的转换”系数为32。真实获得的mass是6.但是，这个运行良好.
        // 已经记了笔记

        const mass1 = 32;   

        // 理想情况下，能跑的距离 m*v/b
        let desire_dist = mass1 * v2_strength.length() / damp1;



        // 显示
        let tmpv2 = v2_strength.clone()
        tmpv2.normalize()
        let tempv3 = new Vec3(start_worldpos.x+tmpv2.x*desire_dist, start_worldpos.y + tmpv2.y*desire_dist , 0) 
        this.obj_lastcircle.setWorldPosition(tempv3)
    }

    // 隐藏并清空
    Clear_AimLine()
    {

    }









    // update(deltaTime: number) {
        
    // }
}


