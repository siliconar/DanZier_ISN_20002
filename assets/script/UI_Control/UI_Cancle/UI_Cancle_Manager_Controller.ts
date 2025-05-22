import { _decorator, Collider2D, Color, color, Component, IPhysics2DContact, Node, Sprite, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_Cancle_Manager_Controller')
export class UI_Cancle_Manager_Controller extends Component {



    //---- 单例
    static Instance: UI_Cancle_Manager_Controller

    protected onLoad(): void {
        // super.onLoad();
        UI_Cancle_Manager_Controller.Instance = this;
    }

    //---- 外部变量


    //---- 内部变量
    private _radius_cancle:number = -1   // 半径，用于判断触摸是否进入cancle区域
    private _own_worldpos:Vec3;   // 自身世界坐标
    //--= 组件
    obj_image1:Node =null;



    start() {

        this.obj_image1 = this.node.children[0];  // xx图片

        // 初始化
        this.ShowActive_Cancle(false)    // 是否显示
        this._radius_cancle = this.obj_image1.getComponent(UITransform).width;  // 获取半径，用于判断触摸是否进入cancle区域
    }



    ShowActive_Cancle(bshow:boolean)
    {
        // 设置是否显示
        this.obj_image1.active = bshow;

        // 无论是否显示，设置一下暗色。。
        this._cancleChangeColor(false)
    }

    // 自动根据传入的player位置，设置cancle位置
    AutoSet_Worldpos(player_worldpos:Vec3)
    {

        if(player_worldpos.x<410)   // 如果fish在偏左，那么cancle在偏右
        {
            this._own_worldpos = new Vec3(690,315,0)
            this.node.setWorldPosition(this._own_worldpos);
        }
        else   // 如果fish偏右，那么cancle偏左
        {
            this._own_worldpos = new Vec3(140,315,0)
            this.node.setWorldPosition(this._own_worldpos);
        }



    }


    // 检查wheel的小球是否进入自己区域,并且变色
    CheckWheel_Inside(small_ball_worldpos:Vec3):boolean
    {
        
        const dist1 = Math.sqrt((small_ball_worldpos.x - this._own_worldpos.x)**2 +(small_ball_worldpos.y - this._own_worldpos.y)**2)

        if(dist1<this._radius_cancle) // 如果的确在cancle区域内，点亮，并且返回true
        {
            this._cancleChangeColor(true);
            return true;
        }
        else
        {
            this._cancleChangeColor(false);   
        }


        return false;
    }




    // 颜色变化
    private _cancleChangeColor(bLight:boolean)
    {
        if(bLight)  // 如果wheel的小球碰上了，就是要取消,所以点亮
        {
            this.obj_image1.getComponent(Sprite).color = new Color(255,255,255,255);
        }
        else  // 如果还没碰上，所以不点亮，暗色
        {
            this.obj_image1.getComponent(Sprite).color = new Color(255,255,255,91);
        }
    }



    // update(deltaTime: number) {
        
    // }
}


