import { _decorator, Component, director, instantiate, Node, Prefab, RigidBody2D, tween, Vec3 } from 'cc';
import { UI_Curtain_Mgr } from '../UI_Control/UI_Curtain/UI_Curtain_Mgr';
import { GlobalConstant } from '../GlobalConstant';
import { PlayerManager_Controller } from '../FishNode/PlayerManager_Controller';
import { fishnode_controller } from '../FishNode/fishnode_controller';
import { UI_Score_Controller } from './Matesr_scene_UI/UI_Score_Controller';
import { UI_ShowTurn_Controller } from './Matesr_scene_UI/UI_ShowTurn_Controller';
import { UI_ShowTime_Controller } from './Matesr_scene_UI/UI_ShowTime_Controller';
const { ccclass, property } = _decorator;



type PointEnter = {
    fish_party: number;
    fish_type: number;
    fish_role: number;
    localpos: Vec3;
};


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
    prefab_fish: Prefab = null;
    // --- 内部变量
    EnterPosition_Local: Map<number, Vec3[]> = new Map<number, Vec3[]>();   // 所有的入场位置
    GameResult: number = 0;    // 游戏是否结束。-1悬而未决，0用户赢了，1敌人赢了
    CurRunningPartyID: number = -1   // 当前进攻的是哪一方，0是player 1是敌人
    xianshou_byXiaoJu:number = -1;  // 小局谁先手。0是player 1是敌人。主要用于中局切换小局时，判断谁先手。

    FishCnt_byRole1: Map<number, number[]> = new Map<number, number[]>();  // 场上3个role，每一个role的鱼数量。主要用于空缺了补充鱼。
    cntAllowLaunch_byRole3: Map<number, number[]> = new Map<number, number[]>();  // 场上3个role，每一个role可以发射的次数

    private _isUserLaunched: boolean = true;    // 是否用户已经发射了，这个用于控制阻塞，当用户发射前为false，发射后为true，让阻塞通过。
    private _launchResolvers: (() => void) = null; // 配合上面的

 


    //--= 组件
    obj_Musk: Node = null;
    obj_topcurtain: Node = null;   // 上幕布
    ojb_bottomcurtain: Node = null;  // 下幕布
    obj_draw_lots: Node = null;   // 抽签label
    obj_Rewards: Node = null;   // 奖励label
    obj_UI_Label_executer: Node = null;  // 谁是执行者label



    start() {

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

        // 初始化FishCnt_byRole。场上3个role，每一个role的鱼数量。主要用于空缺了补充鱼。
        this.FishCnt_byRole1.set(0, [0, 0, 0]);  // 两个阵营，场上都是0条鱼
        this.FishCnt_byRole1.set(1, [0, 0, 0]); // 两个阵营，场上都是0条鱼

        // 初始化cntAllowLaunch_byRole2， 场上3个role，每一个role可以发射的次数
        this.cntAllowLaunch_byRole3.set(0, [0, 0, 0]); // 两个阵营，场上发射次数都为0
        this.cntAllowLaunch_byRole3.set(1, [0, 0, 0]); // 两个阵营，场上发射次数都为0


        // 初始化组件
        this.obj_Musk = this.node.children[0];
        this.obj_topcurtain = this.node.children[1].children[0];
        this.ojb_bottomcurtain = this.node.children[1].children[1];
        this.obj_draw_lots = this.node.children[2];   // 抽签label
        this.obj_Rewards = this.node.children[3];   // 奖励label
        this.obj_UI_Label_executer = this.node.children[4]; // 谁是执行者label


        // UI初始化
        this._UI_Init();

        // 最后一步，异步开始游戏流程
        this.StartGameFlow();
    }


    // 开始游戏流程
    async StartGameFlow() {

        // 初始化变量
        this.GameResult = -1;         // 游戏是否结束。-1悬而未决，0用户赢了，1敌人赢了

        // 打开幕布
        await this._curtain(false);
        // 播放先手后手抽签
        await this._draw_Lots();

        // 双方抽出3员大将,并出场
        await this.GetAllFishes_and_Register();

        // 播放目标，未完成


        // 小局循环。小局：一方操作一次，直到所有鱼鱼停止移动，算一个小局。N次小局后，双方把自己的行动力都消耗完了跳出。
        // 中局循环。中局：双方把自己的行动力都消耗完了，算一次中局。之后重新发奖励卡牌，交换先手，继续。直到一方所有鱼鱼都噶了结束。

        // 初始化第几轮编号,其实轮就是第几次中局
        this.TurnID = 0;

        // 开始中局循环。
        do {
            // 第几轮编号,其实轮就是第几次中局
            this.TurnID++;
            this.script_UI_Turn.ChangeTurnID(this.TurnID);

            // 设置允许用户发射标志位(cntAllowLaunch)，敌我双方都被发了标志位。
            for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
            {
                const i_script = i_node.getComponent(fishnode_controller);

                for (const irole of i_script.roleIDs) // 很傻逼的，有些胖鱼可能有多个role，所以要遍历
                    this.cntAllowLaunch_byRole3.get(i_script.player_Party)[irole] = 1;
            }


            // 开始小局N次。所谓小局: 每操作一次，直到全部鱼鱼停止移动，算一个小局
            do {


                // 播放谁是执行者,"你的回合"
                await this.play_who_turn(this.CurRunningPartyID);

                // 点亮undo_circle
                this._control_undo_circle(true);

                // 关闭遮罩，同意行动
                this.obj_Musk.active = false;

                // 显示倒计时
                this.obj_ShowTime_banner.active = true;   // 开启显示倒计时
                this.script_UI_ShowTime.ResetTime(this.CurRunningPartyID);
                this.obj_ShowDamage_banner.active = false; // 隐藏显示伤害
                this.TotoalDamage_inTurn = 0;   // 伤害统计做好准备

                // 设置“允许用户发射”标志位
                this._isUserLaunched = false;   // 设置用户还未发射，然后等待

                // 是否有人死了，重置变量
                this.isSomeOneDead = false

                // 回调：用户发射后，关闭所有undo_circle；同时打开遮罩，禁止行动；设置用户已经发射标志位
                // 等待“用户发射”标志位，也就是等待用户发射。发射后向下执行
                await this.waitForLaunch();

                // 关闭所有undo_circle；
                this._control_undo_circle(false);

                // 同时打开遮罩，禁止行动；
                this.obj_Musk.active = true;


                // 关闭倒计时，显示伤害
                this.obj_ShowTime_banner.active = false;   // 开启显示倒计时
                this.obj_ShowTime_banner.getComponent(UI_ShowTime_Controller).StopTime();
                this.obj_ShowDamage_banner.active = true; // 隐藏显示伤害
                // this.TotoalDamage_inTurn = 0;   // 伤害统计做好准备


                // 等待一下，防止还没有发射出去
                await this.sleep(500);

                // 是否全部鱼鱼停止移动
                await this.waitForAllFishStop()


                // 如果是用户时间到了，直接判负
                if(this.script_UI_ShowTime.bTimeisAlarm == true)
                 {
                    this.GameResult = 1;
                    break;
                 }


                // 肯定碰撞中，还有一些小动画，等待完毕
                await this.sleep(1000)  // 等待1s
 
                // 拉出横幅，展示比分
                if(this.isSomeOneDead)
                    await this.script_UI_Score.ShowBigScoreBanner(this.ScoreList[0], this.ScoreList[1])

                // 小局如果发生游戏结束还得想想
                // 中局还得想想
                // 中途加入的鱼鱼怎么给行动力，还得想想。

                // 判断是否有阵营需要补人
                // 如果该阵营还有备用，那就补充。
                // 如果没有备用了，那么什么也不做。
                await this.supply_fishes();  // 根据外部反馈的SupplyFishCnt变量，补充鱼鱼，并直接给与发射权

                // 判断场上还有人没，没人了直接游戏结束；
                this.GameResult = this.gameEndCheck()
                if(this.GameResult!=-1)   // 如果游戏不是悬而未决转台
                    break;

                // 判断，是否所有人的执行力消耗完毕
                const sumAllowLuach = this.get_SumAllowLunch();
                // 如果所有人的行动力消耗干净了，跳出小局，否则，继续循环小局
                if (sumAllowLuach[0]+sumAllowLuach[1]<=0)
                    break;

                //-- 如果还有行动力剩余，则考虑下一步用户是谁
                // 如果对方还有行动力，就改变先手，否则，继续自己这一边            
                this.switch_CurRunningPartyID();  // 改变先手,切到对方
                if (sumAllowLuach[this.CurRunningPartyID] <= 0) // 如果对方没有行动力了，切回来
                {
                    this.switch_CurRunningPartyID();  // 切回自己先手
                    console.warn("对方异常没有行动力，切回来，请检查入场")
                }


            } while (true)

            //-- 走到这里，说明小局结束。
            // 游戏是否结束，
            if(this.GameResult!=-1)  // 如果游戏不是悬而未决状态
            {
                break;  // 游戏结束
            }

            //-- 走到这里，说明游戏未结束
            // 切换用户
            if (this.xianshou_byXiaoJu == 0) {
                this.xianshou_byXiaoJu = 1;
                this.CurRunningPartyID = 1;
            }
            else {
                this.xianshou_byXiaoJu = 0;
                this.CurRunningPartyID = 0;
            }
            // 双方发放肉鸽卡牌 未完成

            // 播放“交换先手动画”
            await this.play_who_turn(100)
            //跳回到第一步
            continue;

            // 把遮罩打开，未完成，测试用，最后删除
            // this.obj_Musk.active = true;
        } while (true);


        // 程序走到这里，说明有结局了
        // 播放结算奖励，未完成
        this.obj_Rewards.active = true;


        // 等待一定时间后，返回，未完成
        await this.sleep(3000)
        director.loadScene("pre_scene1");
    }


    // 开合幕布
    async _curtain(isclose: boolean): Promise<void> {
        if (true == isclose) {
            let t1 = tween(this.obj_topcurtain)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .repeat(1) //设置次数
                .start()
            let t2 = tween(this.ojb_bottomcurtain)
                .to(0.5, { position: new Vec3(0, 0, 0) })
                .repeat(1) //设置次数
                .start()
        }
        else {
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
            (resolve) => {
                this.scheduleOnce(() => { resolve(); }, 0.7);
            });
    }

    // 抽签Draw Lots
    async _draw_Lots(): Promise<void> {
        const randomBit = Math.random() < 0.5 ? 0 : 1;  // 随机数
        if (0 == randomBit)  // 我方先手
        {
            this.obj_draw_lots.children[0].active = true;
            console.log("先手")
        }
        else // 如果敌方先手
        {
            this.obj_draw_lots.children[1].active = true;
            console.log("后手")
        }

        await this.sleep(3000);  // 等待5秒
        // 关闭显示
        this.obj_draw_lots.children[0].active = false;
        this.obj_draw_lots.children[1].active = false;

        // 告诉管理器谁先手
        this.CurRunningPartyID = randomBit;
        this.xianshou_byXiaoJu = randomBit;
        console.log("抽签结束")
        return new Promise(
            (resolve) => { resolve(); });

    }


    // 双方抽出3员大将
    async GetAllFishes_and_Register(): Promise<void> {


        // 从GlobalConstant中，取出要参赛的3条鱼鱼的类型
        let player0_type: number[] = [];   // player0所取出的3条鱼鱼类型
        let player1_type: number[] = [];   // player1所取出的3条鱼鱼类型
        for (let icnt = 0; icnt < 3; icnt++) {
            player0_type.push(GlobalConstant.Instance.ApplyOneFishType(0))
            player1_type.push(GlobalConstant.Instance.ApplyOneFishType(1))
        }




        const promises = [
            this.enter_1_fish(0, player0_type[0], this.EnterPosition_Local.get(0)[0], 0, 0),
            this.enter_1_fish(0, player0_type[1], this.EnterPosition_Local.get(0)[1], 1, 400),
            this.enter_1_fish(0, player0_type[2], this.EnterPosition_Local.get(0)[2], 2, 800),
            this.enter_1_fish(1, player1_type[0], this.EnterPosition_Local.get(1)[0], 0, 200),
            this.enter_1_fish(1, player1_type[1], this.EnterPosition_Local.get(1)[1], 1, 600),
            this.enter_1_fish(1, player1_type[2], this.EnterPosition_Local.get(1)[2], 2, 1000)];
        for await (let result of promises) {
        } // 所有鱼鱼并发入场，这样比较帅


        console.log("入场完毕")

        return new Promise(
            (resolve) => { resolve(); });

    }

    // 入场一个鱼鱼
    private async enter_1_fish(partyID: number, itype: number, localpos: Vec3, roleID: number, delaytm_ms: number, cntAllowLaunch: number = 0): Promise<void> {

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
        newfishScript.roleIDs = [roleID];   // 场上角色
        this.cntAllowLaunch_byRole3.get(partyID)[roleID] = cntAllowLaunch// 设置允许发射次数

        // 更改GM中，场上角色数量
        this.FishCnt_byRole1.get(partyID)[roleID]++;

        // 播放动画，未完成
        console.log("播放入场动画")
        // 激活节点
        newfish.active = true;
        newfishScript.ChangePartyColor(partyID)  // 根据party设置图片
        const ang1_deg = partyID == 0 ? 90 : -90;  // 角度
        newfishScript.SetAngle(ang1_deg) // 设置鱼鱼角度
        // 结束
        return new Promise(
            (resolve) => { resolve(); });
    }


    // 根据场上鱼的数量FishCnt_byRole，补充鱼鱼
    private async supply_fishes(): Promise<void> {

        let List_FishEnterPoint: PointEnter[] = [];  // 鱼鱼的入场点

        // 判断是否有阵营需要补人
        // 如果该阵营还有备用，那就补充。
        // 如果没有备用了，那么什么也不做。


        // 判断是否有阵营需要补人
        for (let i_partyID = 0; i_partyID < 2; i_partyID++) {
            for (let i_roldID = 0; i_roldID < 3; i_roldID++) {
                // 如果还在场上，那就不需要补充
                if (this.FishCnt_byRole1.get(i_partyID)[i_roldID] > 0)
                    continue;

                // 如果需要补充
                // 判断是否还有备用，把有备用的鱼，塞入List_PointEnter中，之后计算入场位置
                const itype = GlobalConstant.Instance.ApplyOneFishType(i_partyID);  // 尝试确定新鱼鱼类型
                if (itype == -1) // 如果没有鱼鱼了，就什么都不做。-1表示备用池没有鱼鱼了。
                {
                    // 记住这里，一定要把原来role鱼鱼的行动力清零。
                    // 因为这个role的鱼鱼没了，我们试图补充，但是没有，那么就把这个role的鱼鱼行动力清零
                    this.cntAllowLaunch_byRole3.get(i_partyID)[i_roldID]=0;
                    continue;
                }


                // 如果备用池还有鱼鱼
                List_FishEnterPoint.push({ fish_party: i_partyID, fish_type: itype, fish_role: i_roldID, localpos: new Vec3(1, 2, 3) })
            }
        } // end 双for  判断是否有阵营需要补人

        // 如果List_PointEnter有值，也就是还有鱼要入场，就得统一更新localpos
        if (List_FishEnterPoint.length > 0) {

            let alreadyUsedPositions: Vec3[] = [];  // 已经入场鱼鱼的位置
            for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
            {
                alreadyUsedPositions.push(i_node.getPosition());
            }

            // 指定入场位置
            this.assignPositions(List_FishEnterPoint, this.EnterPosition_Local, alreadyUsedPositions);
        } // end if(List_FishEnterPoint.length >0)

        // 入场
        if (List_FishEnterPoint.length > 0) {

            let promises: Promise<void>[] = [];
            for (const i_fish_pe of List_FishEnterPoint) {
                // 这里要查看一下，原来该role的鱼鱼有没有发射权。
                const i_cntlaunch = this.get_cntAllowLaunch(i_fish_pe.fish_party,i_fish_pe.fish_role)
                // 入场的鱼鱼继承发射权
                promises.push(this.enter_1_fish(i_fish_pe.fish_party, i_fish_pe.fish_type, i_fish_pe.localpos, i_fish_pe.fish_role, 0, i_cntlaunch));
            }
            for await (let result of promises) {
            } // 所有鱼鱼并发入场，这样比较帅

            // 播放入场动画，未完成
            await this.sleep(1000)

            console.log("补充入场完毕")
        } // end 入场



        return new Promise(
            (resolve) => { resolve(); });
    }


    //播放谁是执行者
    private async play_who_turn(id_play:number): Promise<void> {
        const label_bg = this.obj_UI_Label_executer.children[0];
        const label_player0 = this.obj_UI_Label_executer.children[1];
        const label_player1 = this.obj_UI_Label_executer.children[2];
        const player_switch = this.obj_UI_Label_executer.children[3];   // 交换先手
        // 打开标签
        label_bg.active = true;   // 打开底色
        if (id_play == 0)
            label_player0.active = true;
        else if(id_play == 1)
            label_player1.active = true;
        else if(id_play == 100)
            player_switch.active = true;  // 交换先手

        // 等待2秒
        await this.sleep(2000);
        // 关闭所有标签
        label_bg.active = false;
        label_player0.active = false;
        label_player1.active = false;
        player_switch.active = false;
        return new Promise(
            (resolve) => { resolve(); });
    }

    // 等待用户发射
    async waitForLaunch(): Promise<void> {
        if (this._isUserLaunched) return;

        return new Promise<void>(resolve => {
            this._launchResolvers = resolve;
        });
    }


    // 回调：用户发射后，运行此函数，让整体向下执行
    callback_UserLaunched() {
        if (this._isUserLaunched == true) {
            console.error("不可能出现这里，用户异常callback发射")
        }

        this._isUserLaunched = true;  // 用户已经发射

        this._launchResolvers(); // 让刚才存储的resolve执行，唤醒主game进程
        this._launchResolvers = null;
    }


    // 回调: 用户时间截至还未发射，运行此函数
    // 随便找一个鱼鱼，假装正常发射了
    // 【然后直接给丫判负了】
    // callback_TimeOutLunch()
    // {
    //      for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
    //      {
    //         if(i_node==0)
    //      }
    // }

    // 等待所有鱼鱼停止
    async waitForAllFishStop(): Promise<void> {
        while (true) {
            await this.sleep(1000)

            let isAllStoped = true;  // 我们先假设所有的都停了，然后验证
            for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
            {
                const i_rigid = i_node.getComponent(RigidBody2D);
                const linearVelocity = i_rigid.linearVelocity;
                // console.log("剩余速度:" + linearVelocity.length())
                // const angularVelocity = i_rigid.angularVelocity;
                // 设定一个容忍范围（因为浮点数误差）
                if (linearVelocity.length() > 0.01) {
                    isAllStoped = false;
                    break;  // 不需要再检测了，肯定失败
                }
            }

            if (isAllStoped)  // 如果的确是都停了，那么结束
            {
                break;
            }
            else
                continue;

        }

        return new Promise(
            (resolve) => { resolve(); });

    }


    // 是否对方全部噶了，如果噶了，设置游戏结束标志位
    private gameEndCheck(bLoose:boolean = false): number {

        let isExistEnemy = false;
        for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
        {
            const iscript = i_node.getComponent(fishnode_controller);
            if (iscript.player_Party != this.CurRunningPartyID)   // 如果是敌人，那么说明敌人还没噶完，还有敌人
            {
                isExistEnemy = true;
                break;
            }
        }

        if (isExistEnemy)  // 如果还有敌人在场，说明悬而未决
            return -1;
        else  // 如果没有敌人，那就是的确结束了
        {
            return this.CurRunningPartyID;   // 也就是当前CurRunningPartyID的玩家赢了。
        }
    }


    // 判断，是否执行力消耗完毕
    get_SumAllowLunch():number[]
    {
        let sum0:number=0;
        let sum1:number=0;

        for(let irole=0;irole<3;irole++)
        {
            sum0 += this.cntAllowLaunch_byRole3.get(0)[irole];
            sum1 += this.cntAllowLaunch_byRole3.get(1)[irole];
        }
        return [sum0,sum1];
    }


    // 切换先手变量，只有变量无动画
    private switch_CurRunningPartyID() {
        if (this.CurRunningPartyID == 0)
            this.CurRunningPartyID = 1;
        else
            this.CurRunningPartyID = 0;
    }

    // 休眠
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 点亮或者关闭undo_circle
    private _control_undo_circle(bopen: boolean) {
        if (this.CurRunningPartyID == 0) // 如果轮到玩家操作，才需要点亮undo_circle
        {
            for (const i_node of PlayerManager_Controller.Instance.node.children)   // 遍历所有在场的鱼鱼
            {
                const i_script = i_node.getComponent(fishnode_controller);

                if (bopen)  // 如果是要打开undo_circle
                {
                    if (i_script.player_Party == this.CurRunningPartyID && this.get_cntAllowLaunch(i_script.player_Party, i_script.roleIDs[0]) > 0)  // 如果的确是执行者,且可发射
                    {
                        i_script.Img_undocircle.active = true;  // 正式点亮undo_circle
                    }
                }
                else // 如果是要关闭undo_circle
                {
                    if (i_script.player_Party == this.CurRunningPartyID)  // 注意关闭的逻辑不一样
                    {
                        i_script.Img_undocircle.active = false;  // 关闭undo_circle
                    }
                }

            }
        }
    }


    // 剩余发射次数查询
    get_cntAllowLaunch(j_partyID:number, j_roldID:number):number
    {
        return this.cntAllowLaunch_byRole3.get(j_partyID)[j_roldID];
    }

    // ===== 鱼鱼入场的一系列函数，比较复杂
    fishRadius: number = 55 + 3;  // 鱼鱼的碰撞半径 ， +3留点余量
    minDistance: number = this.fishRadius * 2;

    /**
     * 打乱数组顺序（Fisher-Yates 洗牌）
     */
    shuffle<T>(arr: T[]): T[] {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * 判断该位置是否与所有已入场鱼的位置冲突
     */
    isPositionOccupied(pos: Vec3, occupiedList: Vec3[]): boolean {
        for (const occupied of occupiedList) {
            const dx = pos.x - occupied.x;
            const dy = pos.y - occupied.y;
            const dz = pos.z - occupied.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < this.minDistance) {
                return true;
            }
        }
        return false;
    }

    /**
     * 为每条鱼分配一个随机可用的入场点（在自身阵营位置中）
     */
    assignPositions(
        fishList: PointEnter[],
        enterPositionMap: Map<number, Vec3[]>,
        alreadyUsedPositions: Vec3[]
    ) {
        const occupied = [...alreadyUsedPositions]; // 当前已被使用的位置

        for (const fish of fishList) {
            const candidates = enterPositionMap.get(fish.fish_party); // 抽取符合阵营的备用位置
            if (!candidates) continue;

            const shuffled = this.shuffle(candidates); // 随机打乱

            let found: Vec3 | null = null;

            for (const pos of shuffled) {
                if (!this.isPositionOccupied(pos, occupied)) {
                    found = pos;
                    break;
                }
            }

            if (found) {
                fish.localpos = found;
                occupied.push(found);
            } else {
                console.warn(`未找到可用位置: party=${fish.fish_party}`);
            }
        }
    }


    //============== UI 控制部分
    ScoreList:number[] = [0,0]  // 分数，是几:几的分数
    script_UI_Score:UI_Score_Controller = null; ;
    isSomeOneDead:boolean;   // 是否有人死了，主要是为了拉横幅展示比分

    TurnID:number = 0;   // 第几轮编号,其实轮就是第几次中局
    script_UI_Turn:UI_ShowTurn_Controller = null;

    // 显示倒计时
    obj_ShowTime_banner:Node = null;  // 显示倒计时
    script_UI_ShowTime:UI_ShowTime_Controller = null;
     // 显示总伤害
     TotoalDamage_inTurn:number=0;  // 一个小局中的总伤害
    obj_ShowDamage_banner:Node=null;   // 显示总伤害

    _UI_Init() {
        // 分数，是几:几的分数
        this.ScoreList = [0,0]  // 分数
        this.script_UI_Score = this.node.children[5].getComponent(UI_Score_Controller);
        // 第几轮编号,其实轮就是第几次中局
        this.script_UI_Turn = this.node.children[6].getComponent(UI_ShowTurn_Controller);

    // 显示倒计时
    this.obj_ShowTime_banner = this.node.children[7];  // 显示倒计时
    this.script_UI_ShowTime = this.obj_ShowTime_banner.getComponent(UI_ShowTime_Controller)
     // 显示总伤害
    this.obj_ShowDamage_banner=this.node.children[8];   // 显示总伤害

    }

}


