import { _decorator, Component, director, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
import { UI_Curtain_Mgr } from '../UI_Control/UI_Curtain/UI_Curtain_Mgr';
import { GlobalConstant } from '../GlobalConstant';
import { PlayerManager_Controller } from '../FishNode/PlayerManager_Controller';
import { fishnode_controller } from '../FishNode/fishnode_controller';
const { ccclass, property } = _decorator;

@ccclass('Master_main_scene1')
export class Master_main_scene1 extends Component {


    //---- 单例
    static Instance: Master_main_scene1

    protected onLoad(): void {
        // super.onLoad();
        Master_main_scene1.Instance = this;
    }



    //--- 暴露变量
    @property(Prefab)
    prefab_fish:Prefab = null;
    // --- 内部变量
    // RunningFishTypes_List: Map<number, number[]> = new Map<number, number[]>();   // 注册所有的Tube
    EnterPosition_Local:Map<number, Vec3[]> = new Map<number, Vec3[]>();   // 所有的入场位置
    bAllow_Launch:boolean = false;  // 是否允许用户发射
    GameResult:number =0;    // 游戏是否结束。0悬而未决，-1用户输了，1用户赢了
    CurRunningPartyID:number = 0   // 当前进攻的是哪一方，0是player 1是敌人

    //--= 组件
    obj_Musk:Node = null;
    obj_topcurtain:Node = null;   // 上幕布
    ojb_bottomcurtain:Node = null;  // 下幕布
    obj_draw_lots:Node = null;   // 抽签label
    obj_Rewards:Node = null;   // 奖励label
    obj_UI_Label_executer:Node = null;  // 谁是执行者label



    start() {


        // 初始化变量
        // this.RunningFishTypes_List.set(0, []);
        // this.RunningFishTypes_List.set(1, []);
    
        // 初始化入场位置
        this.EnterPosition_Local.set(0, []);
        this.EnterPosition_Local.set(1, []);
        this.EnterPosition_Local.get(0).push(new Vec3(-233, -540, 0));    // 前3个是主要入场地点
        this.EnterPosition_Local.get(0).push(new Vec3(0, -400, 0));   // 前3个是主要入场地点
        this.EnterPosition_Local.get(0).push(new Vec3(233, -540, 0));  // 前3个是主要入场地点

        this.EnterPosition_Local.get(0).push(new Vec3(-233, -540 + 100, 0));    // 后3个是备用入场地点
        this.EnterPosition_Local.get(0).push(new Vec3(0, -400 + 100, 0));   // 后3个是备用入场地点
        this.EnterPosition_Local.get(0).push(new Vec3(233, -540 + 100, 0));  // 后3个是备用入场地点

        this.EnterPosition_Local.get(1).push(new Vec3(-233, 460, 0)); // 前3个是主要入场地点
        this.EnterPosition_Local.get(1).push(new Vec3(0, 320, 0));        // 前3个是主要入场地点
        this.EnterPosition_Local.get(1).push(new Vec3(233, 460, 0));      // 前3个是主要入场地点

        this.EnterPosition_Local.get(1).push(new Vec3(-233, 460 - 100, 0)); // 后3个是备用入场地点
        this.EnterPosition_Local.get(1).push(new Vec3(0, 320 - 100, 0));        // 后3个是备用入场地点
        this.EnterPosition_Local.get(1).push(new Vec3(233, 460 - 100, 0));      // 后3个是备用入场地点


        // 初始化组件
        this.obj_Musk = this.node.children[0];
        this.obj_topcurtain = this.node.children[1].children[0];
        this.ojb_bottomcurtain = this.node.children[1].children[1];
        this.obj_draw_lots = this.node.children[2];   // 抽签label
        this.obj_Rewards = this.node.children[3];   // 奖励label
        this.obj_UI_Label_executer = this.node.children[4]; // 谁是执行者label
        // 最后一步，异步开始游戏流程
        this.StartGameFlow();
    }


    // 开始游戏流程
    async StartGameFlow()
    {

        // 初始化变量
        this.bAllow_Launch =false;  // 是否允许用户发射
        this.GameResult = 0;         // 游戏是否结束。0悬而未决，-1用户输了，1用户赢了

        // 打开幕布
        await this._curtain(false);
        // 播放先手后手抽签
        await this._draw_Lots();

        // 双方抽出3员大将,并出场
        await this.GetAllFishes_and_Register();

        // 播放目标，未完成

        
        // 开始交替执行循环
        do
        {
            // 播放谁是执行者
            await this.play_who_turn();

            // 根据执行者，设置允许用户发射标志位(isAllowLaunch)
            // let cnt_executer = 0;  // 一次小局中，执行者的数量
            for(const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
            {
                const i_script = i_node.getComponent(fishnode_controller);
                if(i_script.player_Party == this.CurRunningPartyID)  // 如果的确是执行者
                {
                    i_script.isAllowLaunch = true;
                    // cnt_executer++;
                }
            }

            // 开始小局N次。所谓小局: 每操作一次，直到全部鱼鱼停止移动，算一个小局
            do{
                // 点亮undo_circle
                if(this.CurRunningPartyID ==0) // 如果轮到玩家操作，才需要点亮undo_circle
                {
                    for(const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
                    {
                        const i_script = i_node.getComponent(fishnode_controller);
                        if(i_script.player_Party == this.CurRunningPartyID && i_script.isAllowLaunch == true)  // 如果的确是执行者,且可发射
                        {
                            i_script.Img_undocircle.active = true;  // 正式点亮undo_circle
                        }
                    }
                }

                // 关闭遮罩，同意行动
                this.obj_Musk.active = false;

                // 设置允许用户发射标志位
                // 回调：用户发射后，关闭所有undo_circle；同时打开遮罩，禁止行动；设置用户已经发射标志位

                // 等待用户发射标志位，也就是等待用户发射。发射后向下执行
                // 是否全部鱼鱼停止移动
                // 是否对方全部噶了，如果噶了，设置游戏结束标志位

                // while判断，是否执行力消耗完毕

            }while(false)
            
            // 走到这里，说明小局结束。
            

            // 游戏是否结束，

            // 走到这里，说明游戏未结束
            // 切换用户，跳回到第一步


            // 把遮罩打开，未完成，测试用，最后删除
            this.obj_Musk.active = true;
        }while(false);

        
        // 程序走到这里，说明有结局了
        // 播放结算奖励，未完成
        this.obj_Rewards.active = true;


        // 等待一定时间后，返回，未完成
        await this.sleep(3000)
        director.loadScene("pre_scene1");
    }


    // 开合幕布
    async _curtain(isclose:boolean):Promise<void>
    {
        if(true == isclose)
        {
            let t1 = tween(this.obj_topcurtain)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .repeat(1) //设置次数
                .start()
            let t2 = tween(this.ojb_bottomcurtain)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .repeat(1) //设置次数
                .start()  
        }
        else
        {
            let t1 = tween(this.obj_topcurtain)
                .to(0.5, { position: new Vec3(0, 900, 0) })
                .repeat(1) //设置次数
                .start()
            let t2 = tween(this.ojb_bottomcurtain)
                .to(0.5, { position: new Vec3(0, -900, 0) })
                .repeat(1) //设置次数
                .start()  
        }

        return new Promise(
            (resolve)=>{ 
                    this.scheduleOnce(()=>{resolve();},0.7);
              });
    }

    // 抽签Draw Lots
    async _draw_Lots():Promise<void>
    {
        const randomBit = Math.random() < 0.5 ? 0 : 1;  // 随机数
        if(0 == randomBit)  // 我方先手
        {
            this.obj_draw_lots.children[0].active =true;
            console.log("先手")
        }
        else // 如果敌方先手
        {
            this.obj_draw_lots.children[1].active =true;
            console.log("后手")
        }

        await this.sleep(3000);  // 等待5秒
        // 关闭显示
        this.obj_draw_lots.children[0].active =false;
        this.obj_draw_lots.children[1].active =false;

        // 告诉管理器谁先手
        this.CurRunningPartyID = randomBit;

        console.log("抽签结束")
        return new Promise(
            (resolve)=>{ resolve();});

    }


    // 双方抽出3员大将
    async GetAllFishes_and_Register():Promise<void>
    {


        // 从GlobalConstant中，取出要参赛的3条鱼鱼的类型
        let player0_type:number[] = [];   // player0所取出的3条鱼鱼类型
        let player1_type:number[] = [];   // player1所取出的3条鱼鱼类型
        for (let icnt = 0; icnt < 3; icnt++) 
        {
            player0_type.push( GlobalConstant.Instance.ApplyOneFishType(0))
            player1_type.push( GlobalConstant.Instance.ApplyOneFishType(1))
        }




        const promises = [
            this.enter_1_fish(0, player0_type[0], this.EnterPosition_Local.get(0)[0], 0),
            this.enter_1_fish(0, player0_type[1], this.EnterPosition_Local.get(0)[1], 400),
            this.enter_1_fish(0, player0_type[2], this.EnterPosition_Local.get(0)[2], 800),
            this.enter_1_fish(1, player1_type[0], this.EnterPosition_Local.get(1)[0], 200),
            this.enter_1_fish(1, player1_type[1], this.EnterPosition_Local.get(1)[1], 600),
            this.enter_1_fish(1, player1_type[2], this.EnterPosition_Local.get(1)[2], 1000)];
        for await (let result of promises) {
        } // 所有鱼鱼并发入场，这样比较帅

        console.log("入场完毕")

        return new Promise(
            (resolve) => { resolve(); });

    }

    // 入场一个鱼鱼
    private async enter_1_fish(partyID:number, itype:number, localpos:Vec3, delaytm_ms:number):Promise<void>
    {

        // 延时
        await this.sleep(delaytm_ms);

        //---- 实例化入场
        // 实例化
        let newfish = instantiate(this.prefab_fish)  // 新建一个管道
        let newfishScript = newfish.getComponent(fishnode_controller);


        // 节点入场
        PlayerManager_Controller.Instance.node.addChild(newfish);
        newfish.setPosition(localpos);  // 设置位置
        newfishScript.player_Party = partyID; // 设置PartyID，注意图像得等到激活后
        
        newfishScript.player_Type = itype;   // 设置类型

        // 播放动画，未完成
        console.log("播放入场动画")
        // 激活节点
        newfish.active = true;
        newfishScript.ChangePartyColor(partyID)  // 根据party设置图片
        const ang1_deg = partyID==0? 90:-90;  // 角度
        newfishScript.SetAngle(ang1_deg) // 设置鱼鱼角度
        // 结束
        return new Promise(
            (resolve) => { resolve(); });
    }


    //播放谁是执行者
    private async play_who_turn():Promise<void>
    {
        const label_bg = this.obj_UI_Label_executer.children[0];
        const label_player0 = this.obj_UI_Label_executer.children[1];
        const label_player1 = this.obj_UI_Label_executer.children[2];

        // 打开标签
        label_bg.active = true;   // 打开底色
        if(this.CurRunningPartyID ==0)
            label_player0.active = true;
        else
            label_player1.active = true;

        // 等待2秒
        await this.sleep(2000);
        // 关闭所有标签
        label_bg.active = false;
        label_player0.active = false;
        label_player1.active = false;
        return new Promise(
            (resolve) => { resolve(); });
    }


    // 休眠
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}


