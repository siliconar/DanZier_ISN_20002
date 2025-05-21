import { _decorator, Collider2D, Color, color, Component, IPhysics2DContact, Node, Sprite, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_Cancle_Manager_Controller')
export class UI_Cancle_Manager_Controller extends Component {



    //---- 单例
    static Instance: UI_Cancle_Manager_Controller

    protected onLoad(): void {
        // super.onLoad();
        UI_Cancle_Manager_Controller.Instance = this;
    }

    //---- 变量



    //--= 组件
    obj_image1:Node =null;



    start() {

        this.obj_image1 = this.node.children[0];  // x图片

        // 初始化
        this.ShowActive_Cancle(false)
    }



    ShowActive_Cancle(bshow:boolean)
    {
        this.obj_image1.active = bshow;
    }

    // 自动根据传入的player位置，设置cancle位置
    AutoSet_Worldpos(player_worldpos:Vec3)
    {
        // 未完成
    }


    // 检查wheel的小球是否进入自己区域
    CheckWheel_Inside(small_ball_worldpos:Vec3):boolean
    {
        // 未完成
        return false;
    }




    // 颜色变化
    private _cancleChangeColor(bCancle:boolean)
    {
        if(bCancle)  // 如果wheel的小球碰上了，就是要取消
        {
            this.obj_image1.getComponent(Sprite).color = new Color(255,255,255,255);
        }
        else  // 如果还没碰上
        {
            this.obj_image1.getComponent(Sprite).color = new Color(255,255,255,91);
        }
    }



    // update(deltaTime: number) {
        
    // }
}


