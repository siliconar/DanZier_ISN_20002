import { _decorator, Collider2D, Color, Component, Contact2DType, Director, director, EventTouch, IPhysics2DContact, Label, Node, PhysicsSystem2D, Quat, RigidBody2D, tween, Vec2, Vec3 } from 'cc';
import { UI_wheel_btn_Manager_Controller } from '../UI_Control/UI_wheel_btn/UI_wheel_btn_Manager_Controller';
import { UI_Aim_Line_Manager_Controller } from '../UI_Control/UI_Aim_Line/UI_Aim_Line_Manager_Controller';
import { UI_Cancle_Manager_Controller } from '../UI_Control/UI_Cancle/UI_Cancle_Manager_Controller';
import { camera_Manager_Controller } from '../Camera/camera_Manager_Controller';
import { GlobalConstant } from '../GlobalConstant';
import { Utils } from '../Utils';
import { Master_main_scene1 } from '../GameMaster/Master_main_scene1';
const { ccclass, property } = _decorator;

@ccclass('fishnode_controller')
export class fishnode_controller extends Component {



    //---- 暴露变量
    @property
    player_Party: number = 0   // 阵营 [0玩家 1敌对]
    @property
    player_Type: number = 0   // 一共5种类型的鱼鱼,0碰自己人加攻击，1碰墙壁加攻击，2碰自己人治疗，3回合第一次双倍伤害，4击杀立即增加一次行动

    @property
    player_HP: number = 30    // player血量
    player_MaxHP: number = 30  // player最大血量

    @property
    player_Attack: number = 5;   // player攻击力

    // 内部变量
    // isLaunchMoving:boolean = false;   // 这个变量代表：1 是否是玩家手动发射鱼，2. 这个鱼是否在移动
    // cntAllowLaunch: number = 0;   // 允许发射次数，也就是等待发射。这个变量最主要的作用是在点亮undo_circle的时候，判断谁执行过了。
    roleIDs:number[] = [];    // 目前位于场上哪个角色，由GM指定。为什么是数组？因为有些胖鱼可能占据3个角色。

    //---- 组件
    rigid2d: RigidBody2D = null;
    local_collider: Collider2D = null;  // 碰撞器
    fake_collider: Collider2D = null;   // 虚拟碰撞器

    Img_undocircle: Node = null;     // 可执行节点的绿圈
    fishimage_node: Node = null; // fish图片

    Img_HP_node: Node = null; // HP的node
    Img_Attack_node: Node = null; // HP的node
    Img_HP_Label: Label = null;  // HP的label
    Img_Attack_Label: Label = null;  // Attack的label



    // 初始设置位置与旋转角度
    SetWorldPos(p1: Vec3) {
        this.node.setWorldPosition(p1);
    }
    SetLocalPos(p1: Vec3) {
        this.node.setPosition(p1);
    }
    SetAngle(ang1_deg: number) {
        this.fishimage_node.angle = ang1_deg;
    }


    // ---- 以xx速度发射
    Launch(v1: Vec2) {

        // 安全检查
        if (Master_main_scene1.Instance.get_cntAllowLaunch(this.player_Party,this.roleIDs[0]) <= 0) // 如果不允许发射的被发射了，证明代码逻辑有错
        {
            console.error("异常发射，cntAllowLaunch=0")
        }

        // 告诉GM，我已经发射过了。
        for(const irole of this.roleIDs)
        {
            Master_main_scene1.Instance.cntAllowLaunch_byRole3.get(this.player_Party)[irole] =0;
        }

        // 设置手动发射的鱼鱼,并且在移动
        this.rigid2d.linearVelocity = v1
        console.log("发射速度：" + v1.length())
    }

    // ---- 角速度发射
    // 角度相关变量
    cur_ang_speed_deg: number = 0;
    dang_deg: number = 0;
    LaunchRoation() {
        const cur_angle = this.fishimage_node.angle

        let desired_angle: number[] = [cur_angle + 80, cur_angle + 120, cur_angle + 140]
        let t = tween(this.fishimage_node)
            .to(0.3, { angle: desired_angle[0] })
            .to(0.3, { angle: desired_angle[1] })
            .to(0.3, { angle: desired_angle[2] })
            .repeat(1) //设置次数
            .start()
    }

    protected onLoad(): void {
        // super.onLoad()

        this.node.on(Node.EventType.TOUCH_START, this.onTowerTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTowerTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTowerTouchEnd, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTowerTouchCancel, this)


        // 组件初始化
        // 鱼鱼非常特殊，因为要外部初始化，所以组件初始化放onload
        this.rigid2d = this.node.getComponent(RigidBody2D)
        this.local_collider = this.node.getComponents(Collider2D)[0]
        this.fake_collider = this.node.getComponents(Collider2D)[1]

        this.Img_undocircle = this.node.children[0];  // 可执行的绿圈
        this.fishimage_node = this.node.children[1] // fish图片node
        this.Img_HP_node = this.node.children[2]; // HP的node
        this.Img_Attack_node = this.node.children[3]; // Attack的node
        this.Img_HP_Label = this.Img_HP_node.getComponent(Label);  // HP的label
        this.Img_Attack_Label = this.Img_Attack_node.getComponent(Label);    // Attack的label


    }

    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTowerTouchStart, this)
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTowerTouchMove, this)
        this.node.off(Node.EventType.TOUCH_END, this.onTowerTouchEnd, this)
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTowerTouchCancel, this)

        // 注销碰撞器
        if (this.local_collider) {
            this.local_collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
            this.local_collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

    }





    start() {

        // 组件初始化
        // 鱼鱼非常特殊，因为要外部初始化，所以组件初始化放onload

        if (this.local_collider) {
            this.local_collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.local_collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        // 加载图片
        // this.ChangePartyColor(this.player_Party)

        // 设置一下自己的血量和攻击力
        this.ChangeHP_withImg(0, false);
        this.ChangeAttack_withImg(0, false);

    }

    update(deltaTime: number) {



        // if(this.isLaunchMoving)   //如果手动发射的鱼鱼还在移动
        // {
        //     if(this.rigid2d.linearVelocity.x<=0.1 && this.rigid2d.linearVelocity.y<=0.1)  // 如果鱼鱼停了
        //     {
        //         this.isLaunchMoving = false;
        //     }
        // }

        // 角速度相关
        // if(this.cur_ang_speed_deg>0)
        // {

        // }
    }


    // 依据阵营改变颜色
    ChangePartyColor(kk: number) {
        if (kk == 0) {
            this.fishimage_node.children[0].active = true;
            this.fishimage_node.children[1].active = false;
        }
        else if (kk == 1) {
            this.fishimage_node.children[0].active = false;
            this.fishimage_node.children[1].active = true;
        }
    }


    //----- 碰撞回调
    // 碰撞回调
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {





        if (otherCollider.group == (1 << 1))  // 如果被撞是玩家
        {
            //-------- 优先判断是自己处理，还是对面处理
            // 如果是 进攻方 vs 敌对方，那么进攻方的鱼处理
            // 如果 两个都是进攻方 ， 那么 根据ID判断大小
            // 如果两个都是敌对方，那么都不处理


            let otherscript = otherCollider.getComponent(fishnode_controller);
            // 如果是 进攻方 vs 敌对方，那么进攻方的鱼处理
            if (this.player_Party != otherscript.player_Party) {
                if (this.player_Party != Master_main_scene1.Instance.CurRunningPartyID)  // 如果不是进攻方，不处理
                {
                    return
                }

                console.log("进攻vs防御 碰撞处理")
                // 如果是进攻方，那么处理

                // 先判断一下是不是会死，因为死不死动画效果不一样
                if (otherscript.player_HP - this.player_Attack > 0) {


                    // 暂停物理系统 
                    PhysicsSystem2D.instance.enable = false;
                    this.schedule(function () {
                        PhysicsSystem2D.instance.enable = true;
                    }, 0.05, 1)   // 恢复物理系统
                    // 播放粒子特效 未完成

                    // 被撞的先转起来
                    otherscript.LaunchRoation()

                    // 晃动镜头
                    camera_Manager_Controller.Instance.effectShake(0.06, 0.98)

                    // 扣血 等等操作
                    this._fish_attack(otherscript)
                }
                else  // 如果对方是会死
                {
                    // 未完成
                    for(const i_roldID of otherscript.roleIDs)
                        Master_main_scene1.Instance.FishCnt_byRole1.get(otherscript.player_Party)[i_roldID] --; // 告诉GM，合适的时候，补充鱼鱼

                    director.once(Director.EVENT_AFTER_PHYSICS, () => {
                        otherCollider.node.destroy()    // 直接把子弹销毁
                    })

                    // 自己得分增加
                    Master_main_scene1.Instance.ScoreList[this.player_Party] ++;

                }

                return
            } // end 如果是 进攻方 vs 敌对方
            else if (this.player_Party == otherscript.player_Party && this.player_Party == Master_main_scene1.Instance.CurRunningPartyID) {

                // --- 如果 两个都是进攻方
                // 先判断自己有没有特效，没有特效不需要处理
                if (this.player_Type != 0 && this.player_Type != 2) {
                    return;
                }

                // 根据ID判断大小
                let bprocess = Utils.collision_choose_byname(this.node.name, otherCollider.node.name)  // 判断是不是自己处理
                if (!bprocess) // 如果不是自己处理
                    return

                console.log("进攻vs进攻 碰撞处理")

                // 暂停物理系统 
                PhysicsSystem2D.instance.enable = false;
                this.schedule(function () {
                    PhysicsSystem2D.instance.enable = true;
                }, 0.1, 1)

                // 播放粒子特效 未完成

                // 晃动镜头,【注意】碰自己人不晃动，下面代码删除
                // camera_Manager_Controller.Instance.effectShake(0.08,0.98)



                // 加攻击力 等等操作
                this._fish_aux(otherscript)

                return

            } // end 如果 两个都是进攻方 
            else  // 如果两个都是防御方
            {
                // 如果两个都是敌对方，那么都不处理
                return
            }



        } // end if(otherCollider.group ==1)  // 如果被撞是玩家

    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {


        // let tmp_angle2 = Math.atan2(this.rigid2d.linearVelocity.y, this.rigid2d.linearVelocity.x)*180/Math.PI;   // 弧度表示目标角度

        // // 主意不能在碰撞回调中直接改变rotation，必须使用shedule后
        // this.schedule(function () {
        //             this.fishimage_node.setRotationFromEuler(0,0,tmp_angle2)
        //         },0.01,1) 


    }


    //------------ 攻击力部分
    _fish_attack(otherscript: fishnode_controller) {
        // 未完成，其他鱼鱼类型
        otherscript.ChangeHP_withImg(-this.player_Attack)
    }

    //---------- 进攻vs进攻 碰撞部分
    _fish_aux(otherscript: fishnode_controller) {
        // 未完成，其他鱼鱼类型
        if (this.player_Type == 0)  // 如果0型鱼鱼，增加对方攻击力
        {
            otherscript.ChangeAttack_withImg(3)  // 未完成 值可能不对
        }
        else if (this.player_Type == 2) // 如果2型鱼鱼，增加对方血量
        {
            otherscript.ChangeHP_withImg(3)  // 未完成 值可能不对
        }

        if (otherscript.player_Type == 0) // 如果0型鱼鱼，增加自己攻击力
        {
            this.ChangeAttack_withImg(3)  // 未完成 值可能不对
        }
        else if (otherscript.player_Type == 2) // 如果0型鱼鱼，增加自己攻击力
        {
            this.ChangeHP_withImg(3)  // 未完成 值可能不对
        }
    }

    // 要改变的血量，同时图片也该
    ChangeHP_withImg(dHP: number, bOpenEffect = true) {
        this.player_HP += dHP
        // 变色
        if (this.player_HP < this.player_MaxHP / 3)   // 血量低，得是红色
        {
            this.Img_HP_Label.color = new Color(231, 123, 123, 255)
        }
        else if (this.player_HP > 2 * this.player_MaxHP / 3) // 血量高，就得是绿色
        {
            this.Img_HP_Label.color = new Color(125, 255, 83, 255);
        }
        else  // 中等血量，用白色
        {
            this.Img_HP_Label.color = new Color(255, 255, 255, 255)
        }


        // 变大及给改变图片
        this.Img_HP_Label.string = this.player_HP.toString()

        if (!bOpenEffect)  // 如果不需要特效，直接返回
            return

        let t1 = tween(this.Img_HP_node)
            .to(0.3, { scale: new Vec3(1.6, 1.6, 1) })
            .to(1, { scale: new Vec3(1, 1, 1) })
            .start()

    }

    // 要改变的攻击，同时图片也该
    ChangeAttack_withImg(dAttack: number, bOpenEffect = true) {
        this.player_Attack += dAttack

        // 变大及给改变图片
        this.Img_Attack_Label.string = this.player_Attack.toString()


        if (!bOpenEffect)  // 如果不需要特效，直接返回
            return


        let t1 = tween(this.Img_Attack_node)
            .to(0.3, { scale: new Vec3(1.6, 1.6, 1) })
            .to(1, { scale: new Vec3(1, 1, 1) })
            .start()

    }
    //----- 手指蓄力部分

    // 由鱼的on消息调用，给轮盘发消息
    onTowerTouchStart(event: EventTouch) {
        // event.preventSwallow = true   //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息

        // 一定先把自己的虚拟碰撞体关了
        // this.fake_collider.enabled = false;


        // 判断自己能否被点击
        if (!this._isCanTourch())
            return;

        // 激活轮盘，并移动位置

        UI_wheel_btn_Manager_Controller.Instance.SwitchWheelActive(true)    // 显示轮盘
        let tmp_pos = this.node.getWorldPosition()
        UI_wheel_btn_Manager_Controller.Instance.SetWheelMidPos(tmp_pos)  // 设置轮盘位置

        // 激活取消按钮，并设定位置
        UI_Cancle_Manager_Controller.Instance.ShowActive_Cancle(true)   // 显示
        UI_Cancle_Manager_Controller.Instance.AutoSet_Worldpos(tmp_pos)  // 设定位置


    }

    // 由鱼的on消息调用
    onTowerTouchMove(event: EventTouch) {
        // event.preventSwallow = true   //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息


        // 判断自己能否被点击
        if (!this._isCanTourch())
            return;

        // 轮盘移动蓄力
        let tx = event.getUILocation().x
        let ty = event.getUILocation().y
        let touch_worldpos = new Vec3(tx, ty, 0)
        UI_wheel_btn_Manager_Controller.Instance.SetSmallCirclePos(touch_worldpos)

        // 设置player角度
        let tmp_ang1 = Math.atan2(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength.y, UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength.x) * 180 / Math.PI

        this.fishimage_node.setRotationFromEuler(0, 0, tmp_ang1)

        // 动画蓄力  未完成

        // 虚拟路径规划，计算并显示  
        UI_Aim_Line_Manager_Controller.Instance.Draw_AimLine(this.node.getWorldPosition(),
            UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength,
            this.rigid2d.linearDamping
        )

        // 取消按钮：判断是否进入。目的是控制是否高亮，不需要判断是否发射，发射时会判断的
        UI_Cancle_Manager_Controller.Instance.CheckWheel_Inside(touch_worldpos)

    }

    // 由鱼的on消息调用
    onTowerTouchEnd(event: EventTouch) {

        // event.preventSwallow = true //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息


        // 判断自己能否被点击
        if (!this._isCanTourch())
            return;

        let tx = event.getUILocation().x
        let ty = event.getUILocation().y
        let touch_worldpos = new Vec3(tx, ty, 0)



        // 虚拟路径关闭  
        UI_Aim_Line_Manager_Controller.Instance.Clear_AimLine()

        // 发射鱼鱼
        const bCancleLaunch = UI_Cancle_Manager_Controller.Instance.CheckWheel_Inside(touch_worldpos)   // 判断是否在Cancle区域内
        if (!bCancleLaunch)  // 如果的确要发射
        {
            this.Launch(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength)

            // 告诉游戏导演，已经发射
            Master_main_scene1.Instance.callback_UserLaunched();
        }
        // 轮盘归位,其实不用归位
        // 轮盘消失
        UI_wheel_btn_Manager_Controller.Instance.SwitchWheelActive(false)

        // 消失取消按钮
        UI_Cancle_Manager_Controller.Instance.ShowActive_Cancle(false)



    }

    // 由鱼的on消息调用
    onTowerTouchCancel(event: EventTouch) {

        // event.preventSwallow = true //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息


        // 判断自己能否被点击
        if (!this._isCanTourch())
            return;

        let tx = event.getUILocation().x
        let ty = event.getUILocation().y
        let touch_worldpos = new Vec3(tx, ty, 0)


        // 虚拟路径关闭 
        UI_Aim_Line_Manager_Controller.Instance.Clear_AimLine()

        // 发射鱼鱼
        const bCancleLaunch = UI_Cancle_Manager_Controller.Instance.CheckWheel_Inside(touch_worldpos)   // 判断是否在Cancle区域内
        if (!bCancleLaunch)  // 如果的确要发射
        {
            this.Launch(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength)

            // 告诉游戏导演，已经发射
            Master_main_scene1.Instance.callback_UserLaunched();
        }
        // 轮盘归位,其实不用归位
        // 轮盘消失
        UI_wheel_btn_Manager_Controller.Instance.SwitchWheelActive(false)

        // 消失取消按钮
        UI_Cancle_Manager_Controller.Instance.ShowActive_Cancle(false)

    }


    // 判断自己能否被点击
    private _isCanTourch(): boolean {
        if (Master_main_scene1.Instance.CurRunningPartyID != this.player_Party)   // 如果不是该自己行动，那就不能点
            return false;
         if (Master_main_scene1.Instance.get_cntAllowLaunch(this.player_Party,this.roleIDs[0])<= 0)  // 如果自己没有行动力，也不能点
            return false;

        return true;
    }





}


