import { _decorator, Component, ERaycast2DType, geometry, Node, PhysicsSystem, PhysicsSystem2D, UITransform, Vec2, Vec3 } from 'cc';
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
    readonly max_predict_lines = 3   // 最多预测多少次


    //--= 组件
    obj_circle_list:Node[]=[] ;   
    obj_line_list:Node[] =[] ;   


    start() {

        // 初始化组件

        this.obj_circle_list.push(this.node.children[0]); // 第一个圆
        this.obj_circle_list.push(this.node.children[1]); // 第一个圆
        this.obj_circle_list.push(this.node.children[2]); // 第一个圆
        this.obj_line_list.push(this.node.children[3])
        this.obj_line_list.push(this.node.children[4])
        this.obj_line_list.push(this.node.children[5])



        this.Clear_AimLine()
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
        let cnt_ray = 0;   // 射线次数
        let res_map = new Array<Vec3>();
        do{
            cnt_ray = cnt_ray+1;

            // 理想的终点
            next_ray_v2.normalize()  // 射线方向归一化
            let desire_destiny1 = new Vec3(next_start_point.x + next_ray_v2.x * left_dist, next_start_point.y + next_ray_v2.y * left_dist, 0)  // 理想的终点

            // 开始构造射线，以上一次的终点作为起点

            // 1<<3 是 FakeLayer 1<<2 是PlayerLayer 1<<1 是PlayerLayer
            const results  = PhysicsSystem2D.instance.raycast(next_start_point, desire_destiny1,ERaycast2DType.Closest, (1<<3)|(1<<2)|(1<<1))
            if(results.length>0)
            {
                // console.log("有检测" + results.length.toString())


                // let id_closet = -1
                // for (let kk=0;kk<results.length;kk++)
                // {

                // }
                // --- 先判断类型，墙和球不一样
                if (results[0].collider.tag == 0)  // 墙的tag是0
                {
                    // 碰撞点
                    const bump_point_v3 = new Vec3(results[0].point.x, results[0].point.y, 0)
                    // 反射线
                    const faxian_v2 = results[0].normal  // 法线向量

                    // console.log("虚拟法线:"+ faxian_v2)

                    next_ray_v2 = Utils.reflect2D(next_ray_v2, faxian_v2)  // 反射线，也就是下一次方向


                    // 下一次起点，实际也是这次的真正终点
                    // 这里需要讲述，为什么碰撞点就是终点。
                    // 因为我们这里的碰撞点，碰撞的是虚拟collider，
                    // 这个虚拟collider已经被我们扩大过了，所以，碰撞点就是碰撞时，鱼的中心点。
                    let last_start_point = next_start_point  // 先存下来本次的起点
                    next_start_point = bump_point_v3

                    // 剩余距离
                    left_dist = left_dist - Math.sqrt((last_start_point.x - next_start_point.x) ** 2 + (last_start_point.y - next_start_point.y) ** 2)
                    left_dist = left_dist * 1;




                    // 更新结果
                    res_map.push(bump_point_v3)
                }
                else  // 如果是球，球的tag是2
                {
                    // 碰撞点
                    const bump_point_v3 = new Vec3(results[0].point.x, results[0].point.y, 0)
                    // 法线
                    const faxian_v2 = results[0].normal  // 法线向量
                    

                    let p1 = next_ray_v2  // 入射向量
                    let p2 = faxian_v2  // 法线向量
                    const len2 = p2.x * p2.x + p2.y * p2.y;
                    const dot = p1.x * p2.x + p1.y * p2.y;
                    const scale = dot / len2;

                    const p1_2 = new Vec2( p2.x * scale, p2.y * scale );   // 法线方向分解
                    const p1_1 = new Vec2( p1.x - p1_2.x, p1.y - p1_2.y );   // 前进方向分解
                    next_ray_v2 = p1_1   // 前进方向是未来方向
                    let next_strength_percent = p1_1.length()/p1.length()



                    // 下一次起点，实际也是这次的真正终点
                    // 这里需要讲述，为什么碰撞点就是终点。
                    // 因为我们这里的碰撞点，碰撞的是虚拟collider，
                    // 这个虚拟collider已经被我们扩大过了，所以，碰撞点就是碰撞时，鱼的中心点。
                    let last_start_point = next_start_point  // 先存下来本次的起点
                    next_start_point = bump_point_v3

                    // 剩余距离
                    left_dist = left_dist - Math.sqrt((last_start_point.x - next_start_point.x) ** 2 + (last_start_point.y - next_start_point.y) ** 2)
                    left_dist = left_dist * next_strength_percent;




                    // 更新结果
                    res_map.push(bump_point_v3)


                }

            }
            else  // 如果没有碰撞 
            {
                // 更新结果
                res_map.push(desire_destiny1)
                break;
            }

        }while(true && cnt_ray< this.max_predict_lines)


        //--- 下面开始处理瞄准线
        let tmp_last_pos = start_worldpos   // 上一次射线起点
        for (let i = 0; i < res_map.length; i++)
        {
            // 先激活
             this.obj_line_list[i].active=true
             this.obj_circle_list[i].active = true;
            // 设置线
            let tmpangle = Utils.calculate_angle_deg(tmp_last_pos, res_map[i])
            let tmpdist = Utils.calculate_dist(tmp_last_pos, res_map[i])
            // 设置线的角度
            this.obj_line_list[i].setWorldPosition( tmp_last_pos)  // 设置位置
            this.obj_line_list[i].setRotationFromEuler(0,0,tmpangle) // 设置角度
            this.obj_line_list[i].getComponent(UITransform).setContentSize(tmpdist,3)
            

            // 设置碰撞点
            this.obj_circle_list[i].setWorldPosition(res_map[i])

            // 最后一步
            tmp_last_pos = res_map[i]
        }

        // 显示完了，把没显示的碰撞点和线隐藏了
        for(let i=res_map.length;i<this.max_predict_lines;i++)
        {
             this.obj_line_list[i].active=false
             this.obj_circle_list[i].active = false;
        }

    }

    // 隐藏并清空
    Clear_AimLine()
    {
        for(let kk=0;kk<this.obj_circle_list.length;kk++)
        {
            this.obj_circle_list[kk].active = false;
            this.obj_line_list[kk].active = false;
        }
    }









    // update(deltaTime: number) {
        
    // }
}


