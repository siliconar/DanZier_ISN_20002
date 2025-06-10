import { _decorator, Component, Node } from 'cc';
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
    MaxThinkTime: number = 15;  // 最大思考时间s
    Node_PlayerManager: Node = null;
    PartyID: number = 1;    // AI的ID一定是2


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
            }
            AI_fish_scriptList.push(iscript);  // 获取自己方鱼鱼脚本
        }
        const index = Math.floor(Math.random() * AI_fish_scriptList.length);
        const launch_fish_script1 = AI_fish_scriptList[index];   // 这就是我们要的最终节点，准备对这个鱼鱼进行发射。


        // 选择对面的作为目标
        const index2 = Math.floor(Math.random() * player_fish_Node.length);
        const target_fish_node = player_fish_Node[index2];    // 作为目标的鱼鱼，我们要射击它

        // 随机计算发射角度



    }

    // 初始化
    init_AI(PlayerManager1: Node) {
        this.Node_PlayerManager = PlayerManager1;


    }


}


