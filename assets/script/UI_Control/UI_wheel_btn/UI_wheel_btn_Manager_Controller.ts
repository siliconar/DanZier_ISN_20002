import { _decorator, Color, Component, Node, Quat, Sprite, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_wheel_btn_Manager_Controller')
export class UI_wheel_btn_Manager_Controller extends Component {



    //---- 单例
    static Instance: UI_wheel_btn_Manager_Controller

    protected onLoad(): void {
        // super.onLoad();
        UI_wheel_btn_Manager_Controller.Instance = this;
    }

    //---- 变量
    private _wheel_world_pos:Vec3    //轮盘中心世界坐标，主要为了方便计算

    Vec2_Strength:Vec2=new Vec2(0,0);     // 轮盘力量和角度向量

    readonly max_strength:number = 120;  // 最大力量
    readonly max_wheel_dist:number = 347/2;   // 轮盘最大距离，当改变轮盘大小的时候，这个一定要改变

    //--= 组件
    obj_circle_big:Node = null;   // 范围大圆
    obj_circle_medium:Node = null; // 力量椭圆
    obj_circle_small:Node = null;     // 鼠标小圆



    start() {


        // 初始化组件
        this.obj_circle_big = this.node.children[0];
        this.obj_circle_medium = this.node.children[1];
        this.obj_circle_small = this.node.children[2];


        // 先把自己隐藏了
        this.node.active = false;

        // 初始化一些设置
        this.ChangeColor(false)
    }

    // update(deltaTime: number) {
        
    // }


    // 切换是否显示
    SwitchWheelActive(bshow:boolean)
    {
        this.node.active = bshow
    }

    // 设置中心点位置
    SetWheelMidPos(iworldpos:Vec3)
    {
        this.node.setWorldPosition(iworldpos)
        this._wheel_world_pos =  iworldpos   //轮盘中心世界坐标，主要为了方便计算
        // 同时把值设置为0,因为既然设置轮盘位置，肯定是第一次
        this.Set_value_direction(0,0);
    }

    // 依据力量向量，设置鼠标位置。和SetSmallCirclePos一个功能，不同方式实现
    Set_value_direction(x:number, y:number)
    {
        // 鼠标小圆的世界位置
        let small_circle_worldpos = new Vec3(this._wheel_world_pos.x-x, this._wheel_world_pos.y-y, 0)
        // 设置小圆位置
        this.obj_circle_small.setWorldPosition(small_circle_worldpos)
        // 同步更新力量向量
        this.Vec2_Strength.x =x;
        this.Vec2_Strength.y = y;

        // 设置中椭圆位置
        this._set_MediumCirclePos(this.Vec2_Strength)
    }



    // 根据鼠标位置，设置,同时计算出力量和方向。 和Set_value_direction一个功能，不同方式实现
    SetSmallCirclePos(iworldpos:Vec3)
    {
        // 力量向量
        let temp_strengh = new Vec2(this._wheel_world_pos.x - iworldpos.x, this._wheel_world_pos.y - iworldpos.y);
        // 计算长度
        let vec2_strengh_dist = temp_strengh.length()  // 向量画面长度
        let strength_value = this._convert_dist2strength(vec2_strengh_dist)   // 画面长度换算成力量绝对值，也就是速度总和

        // 同步更新力量向量
        this.Vec2_Strength.x = temp_strengh.x /vec2_strengh_dist * strength_value;
        this.Vec2_Strength.y = temp_strengh.y /vec2_strengh_dist * strength_value;

        // 设置小圆位置
        this.obj_circle_small.setWorldPosition(iworldpos)

        // 设置中椭圆位置
        this._set_MediumCirclePos(this.Vec2_Strength)
    }

    // 把力量值转换为画面长度 未完成

    // 把画面长度转换为力量值
    private _convert_dist2strength(d1:number):number
    {
        let temp = d1* this.max_strength/ this.max_wheel_dist;
        if(temp>this.max_strength)
        {
            temp = this.max_strength
        }
        return temp;
    }


    // 依据力量向量，设置中圆位置
    private _set_MediumCirclePos(v2_strength:Vec2)
    {
        const max_width = this.max_wheel_dist * 4/3;   // 当拉满以后，对应的宽度
        const min_width = 164;    // 当完全不拉，对应的宽度

        const len_strength = v2_strength.length()   // 力量向量的长度
        // 换算椭圆宽度
        let w_medium = len_strength / this.max_strength *(max_width - min_width) + min_width;
        // 换算椭圆中心点世界坐标
        let v2_strength_norm1 = new Vec2(v2_strength.x/len_strength, v2_strength.y/len_strength)
        let len_bias = len_strength/ this.max_strength * max_width/4  // 偏心长度。最大偏心是 max_width/4，最小偏心是0，因此这么算
        let v2_bias = new Vec2(v2_strength_norm1.x*len_bias, v2_strength_norm1.y*len_bias)   // 偏心向量
        let v3_medium_worldpos = new Vec3(this._wheel_world_pos.x - v2_bias.x,  this._wheel_world_pos.y -v2_bias.y, 0)   // 椭圆中心世界坐标

        // 换算椭圆角度
        let ang1 = Math.atan2(v2_strength.y, v2_strength.x) * 180/Math.PI;


        // 开始设置
        this.obj_circle_medium.setScale(w_medium/min_width,1)
        this.obj_circle_medium.setWorldPosition(v3_medium_worldpos)
        this.obj_circle_medium.setRotationFromEuler(0,0,ang1)
    }

    //-------------取消与变色

    // 变色
    ChangeColor(bcancle:boolean)
    {
        if(bcancle)  // 如果要取消，那就是红色
        {
            this.obj_circle_medium.getComponent(Sprite).color = new Color(255,0,0,255)
        }
        else
        {
            this.obj_circle_medium.getComponent(Sprite).color = new Color(255,255,255,255)
        }
    }

}


