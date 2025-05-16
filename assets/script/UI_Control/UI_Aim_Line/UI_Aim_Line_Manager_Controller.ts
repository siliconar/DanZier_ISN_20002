import { _decorator, Component, ERaycast2DType, geometry, Node, PhysicsSystem, PhysicsSystem2D, Vec2, Vec3 } from 'cc';
import { Utils } from '../../Utils';
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

        // 投射射线
        let left_dist = desire_dist // 经过折射后，剩余的距离
        let next_ray_v2 = v2_strength.clone()   // 下一次射线方向
        let next_start_point = start_worldpos;     // 下一次的起始点
        let res_map = new Array<Vec3>();
        do{

            // 理想的终点
            next_ray_v2.normalize()  // 射线方向归一化
            let desire_destiny1 = new Vec3(next_start_point.x + next_ray_v2.x * left_dist, next_start_point.y + next_ray_v2.y * left_dist, 0)  // 理想的终点

            // 开始构造射线，以上一次的终点作为起点
            const results  = PhysicsSystem2D.instance.raycast(next_start_point, desire_destiny1,ERaycast2DType.Closest, 0xFFFFFF)
            if(results.length>0)
            {
                // console.log("有检测" + results.length.toString())

                // 碰撞点
                const bump_point_v3 = new Vec3(results[0].point.x,results[0].point.y,0)
                // 反射线
                const faxian_v2 = results[0].normal  // 法线向量
                next_ray_v2 = Utils.reflect2D(next_ray_v2, faxian_v2)  // 反射线，也就是下一次方向


                // 下一次起点，实际也是这次的真正终点
                // 这里需要讲述，为什么碰撞点就是终点。
                // 因为我们这里的碰撞点，碰撞的是虚拟collider，
                // 这个虚拟collider已经被我们扩大过了，所以，碰撞点就是碰撞时，鱼的中心点。
                let last_start_point = next_start_point  // 先存下来本次的起点
                next_start_point = bump_point_v3   

                // 剩余距离
                left_dist = left_dist - Math.sqrt((last_start_point.x - next_start_point.x) **2 + (last_start_point.y - next_start_point.y) **2)
                left_dist = left_dist*1;


                

                // 更新结果
                res_map.push(bump_point_v3)
                
            }
            else
            {
                // 更新结果
                res_map.push(desire_destiny1)
                break;
            }

        }while(true)


        // // 理想的终点
        // let normv2 = v2_strength.clone()
        // // let normv2 = new Vec2(1,0)
        // normv2.normalize()
        // let desire_destiny = new Vec3(start_worldpos.x+normv2.x*desire_dist , start_worldpos.y+normv2.y*desire_dist,0 )
        
        // 显示
        this.obj_lastcircle.setWorldPosition(res_map[res_map.length-1])
    }

    // 隐藏并清空
    Clear_AimLine()
    {

    }









    // update(deltaTime: number) {
        
    // }
}


