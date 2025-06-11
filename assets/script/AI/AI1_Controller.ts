import { _decorator, Component, EventTouch, Node, Quat, randomRange, Vec2, Vec3 } from 'cc';
import { fishnode_controller } from '../FishNode/fishnode_controller';
const { ccclass, property } = _decorator;

@ccclass('AI1_Controller')
export class AI1_Controller extends Component {



    //---- 单例
    static Instance: AI1_Controller

    protected onLoad(): void {
        // super.onLoad();
        AI1_Controller.Instance = this;
    }


    // 内部变量
    readonly MaxThinkTime: number = 15;  // 最大思考时间s
    readonly FishRadius = 55;    // 鱼鱼半径
    readonly     PartyID: number = 1;    // AI的ID一定是2

    // 外部传入
    Node_PlayerManager: Node = null;   // PlayerManager的总节点
    cntAllowLaunch_byRole3_GM: Map<number, number[]> = null; // GM给的谁可以发射清单

    start() {

    }

    // update(deltaTime: number) {

    // }

    // 获取数据
    // 所有位置
    // 摩擦力




    // AI传输
    async AI_action() {

        //---------- 生成路径备选方案


        //--------- 制定策略（防御优先，进攻优先）

        //----------- 计算碰撞数量


        // ======== 上面的方案抛弃，搞个简单的
        // 随机选择一个可用节点，随机选择对面一个作为目标，随机角度，大力出奇迹。

        // --------随机选择一个可用节点
        let AI_fish_scriptList: fishnode_controller[] = [];   // AI鱼的脚本
        let player_fish_Node: Node[] = [];      // 玩家鱼的Node
        for (const i_node of this.Node_PlayerManager.children)   // 遍历所有在场的鱼鱼
        {
            let iscript = i_node.getComponent(fishnode_controller);
            if (iscript.player_Party != this.PartyID) {
                player_fish_Node.push(i_node);
                continue;
            }
            // 是己方的鱼鱼
            // 如果不能发射，跳过
            const fishroles = iscript.roleIDs;
            if(this.cntAllowLaunch_byRole3_GM.get(this.PartyID)[fishroles[0]] <=0)
                continue;

            // 如果能发射
            AI_fish_scriptList.push(iscript);  // 获取自己方鱼鱼脚本
        }
        const index = Math.floor(Math.random() * AI_fish_scriptList.length);
        const launch_fish_script1 = AI_fish_scriptList[index];   // 这就是我们要的最终节点，准备对这个鱼鱼进行发射。
        const launch_fish_node1 = launch_fish_script1.node;

        // 选择对面的作为目标
        const index2 = Math.floor(Math.random() * player_fish_Node.length);
        const target_fish_node = player_fish_Node[index2];    // 作为目标的鱼鱼，我们要射击它

        // 随机计算发射角度
        const launchVec_v3 = this.getRandomDirectionTowardsCircle(launch_fish_node1.getWorldPosition(), target_fish_node.getWorldPosition(),this.FishRadius*2);

        // 大力出奇迹
        await this.sleep(1000);
        this.simulateLaunch(launch_fish_script1,launchVec_v3)



    }

    // 初始化
    init_AI(PlayerManager1: Node, cntAllowLaunch_byRole3: Map<number, number[]>) {
        this.Node_PlayerManager = PlayerManager1;

        this.cntAllowLaunch_byRole3_GM = cntAllowLaunch_byRole3
    }


/**
 * 在从 A 指向 B 的方向 ±θ（由B的半径决定）范围内随机生成一个命中方向
 * @param A 发射圆心
 * @param B 目标圆心
 * @param radius 圆的半径
 * @returns Vec3 方向向量（单位长度）
 */
    getRandomDirectionTowardsCircle(A: Vec3, B: Vec3, radius: number): Vec3 {
        const dir = new Vec3();
        Vec3.subtract(dir, B, A);
        const distance = Vec3.len(dir);

        if (distance <= radius) {
            // A 在 B 的范围内，方向可以任意
            const randomAngle = randomRange(0, Math.PI * 2);
            return new Vec3(Math.cos(randomAngle), 0, Math.sin(randomAngle));
        }

        // 投影到 XZ 平面
        const dirXZ = new Vec3(dir.x, 0, dir.z);
        dirXZ.normalize();

        // 最大偏角 θ
        const theta = Math.asin(radius / distance);

        // 在 [-θ, +θ] 中随机取一个角度
        const angle = randomRange(-theta, theta);

        // 构造绕 Y 轴旋转的四元数
        const quat = new Quat();
        Quat.fromEuler(quat, 0, angle * 180 / Math.PI, 0);

        // 应用旋转
        const rotated = new Vec3();
        Vec3.transformQuat(rotated, dirXZ, quat);
        rotated.normalize();

        return rotated;
    }


    // 休眠
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 模拟发射
    async simulateLaunch(targetScript: fishnode_controller, touchPos: Vec3): Promise<void> {

        targetScript.simulateTouchStart();
        targetScript.simulateTouchMove(touchPos.x, touchPos.y);

        await this.sleep(2000);

        targetScript.simulateTouchEnd(touchPos.x,touchPos.y);

        return new Promise((resolve)=>{resolve();});
    }


}


