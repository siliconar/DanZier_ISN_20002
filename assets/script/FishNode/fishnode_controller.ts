import { _decorator, Collider2D, Component, Contact2DType, Director, director, EventTouch, IPhysics2DContact, Node, Quat, RigidBody2D, Vec2, Vec3 } from 'cc';
import { UI_wheel_btn_Manager_Controller } from '../UI_Control/UI_wheel_btn/UI_wheel_btn_Manager_Controller';
import { UI_Aim_Line_Manager_Controller } from '../UI_Control/UI_Aim_Line/UI_Aim_Line_Manager_Controller';
import { UI_Cancle_Manager_Controller } from '../UI_Control/UI_Cancle/UI_Cancle_Manager_Controller';
const { ccclass, property } = _decorator;

@ccclass('fishnode_controller')
export class fishnode_controller extends Component {



    //---- 暴露变量
    @property
    player_Party: number = 0   // 阵营 [0玩家 1敌对]



    //---- 组件
    rigid2d: RigidBody2D = null;
    local_collider: Collider2D = null;  // 碰撞器
    fake_collider: Collider2D = null;   // 虚拟碰撞器

    // ---- 以xx速度发射
    Launch(v1: Vec2) {

        this.rigid2d.linearVelocity = v1
        // this.rigid2d.linearVelocity = new Vec2(100,0)
        console.log("发射速度："+v1.length())
    }



    protected onLoad(): void {
        // super.onLoad()

        this.node.on(Node.EventType.TOUCH_START, this.onTowerTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTowerTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTowerTouchEnd, this)
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTowerTouchCancel, this)
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

        this.rigid2d = this.node.getComponent(RigidBody2D)
        this.local_collider = this.node.getComponents(Collider2D)[0]
        this.fake_collider = this.node.getComponents(Collider2D)[1]


        if (this.local_collider) {
            this.local_collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.local_collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }


        // 改变颜色
        this.ChangeColor(this.player_Party)
    }

    update(deltaTime: number) {
            
    }


    // 依据阵营改变颜色
    ChangeColor(kk:number)
    {
        if(kk==0)
        {
            this.node.children[0].active = true;
            this.node.children[1].active = false;
        }
        else if(kk==1)
        {
            this.node.children[0].active = false;
            this.node.children[1].active = true;
        }
    }


    //----- 碰撞回调
    // 碰撞回调
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {


        let tmp_angle2 = Math.atan2(this.rigid2d.linearVelocity.y, this.rigid2d.linearVelocity.x)*180/Math.PI;   // 弧度表示目标角度

        // 主意不能在碰撞回调中直接改变rotation，必须使用shedule后
        this.schedule(function () {
                    this.node.setRotationFromEuler(0,0,tmp_angle2)
                },0.01,1) 


    }

    //----- 手指蓄力部分

    // 由鱼的on消息调用，给轮盘发消息
    onTowerTouchStart(event: EventTouch) {
        // event.preventSwallow = true   //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息

        // 一定先把自己的虚拟碰撞体关了
        // this.fake_collider.enabled = false;

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

        // 轮盘移动蓄力
        let tx = event.getUILocation().x
        let ty = event.getUILocation().y
        UI_wheel_btn_Manager_Controller.Instance.SetSmallCirclePos(new Vec3(tx,ty,0))

        // 设置player角度
        let tmp_ang1 = Math.atan2(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength.y, UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength.x) *180/ Math.PI
        
        this.node.setRotationFromEuler(0,0,tmp_ang1)

        // 动画蓄力  未完成

        // 虚拟路径规划，计算并显示  
        UI_Aim_Line_Manager_Controller.Instance.Draw_AimLine(this.node.getWorldPosition(), 
            UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength,
            this.rigid2d.linearDamping
        )
        
    }

    // 由鱼的on消息调用
    onTowerTouchEnd(event: EventTouch) {

        // event.preventSwallow = true //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息
        // 虚拟路径关闭  
        UI_Aim_Line_Manager_Controller.Instance.Clear_AimLine()

        // 发射鱼鱼
        this.Launch(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength)
        // 轮盘归位,其实不用归位
        // 轮盘消失
        UI_wheel_btn_Manager_Controller.Instance.SwitchWheelActive(false)

        // 消失取消按钮
        UI_Cancle_Manager_Controller.Instance.ShowActive_Cancle(false)

    }

    // 由鱼的on消息调用
    onTowerTouchCancel(event: EventTouch) {

        // event.preventSwallow = true //因为塔在Line之上，消息被塔捕获了，所以一定要转发消息

        // 虚拟路径关闭 
        UI_Aim_Line_Manager_Controller.Instance.Clear_AimLine()

        // 发射鱼鱼
        this.Launch(UI_wheel_btn_Manager_Controller.Instance.Vec2_Strength)
        // 轮盘归位,其实不用归位
        // 轮盘消失
        UI_wheel_btn_Manager_Controller.Instance.SwitchWheelActive(false)
    
        // 消失取消按钮
        UI_Cancle_Manager_Controller.Instance.ShowActive_Cancle(false)

    }








}


