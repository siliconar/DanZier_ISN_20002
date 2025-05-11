import { _decorator, Component, Node, Vec3 } from 'cc';
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
    value_strength:number;   // 轮盘力量和角度
    direction:number;          // 轮盘力量和角度

    //--= 组件
    obj_circle_big:Node = null;   // 范围大圆
    obj_circle_medium:Node = null; // 力量椭圆
    obj_circle_small:Node = null;     // 鼠标小圆



    start() {


        // 初始化组件
        this.obj_circle_big = this.node.children[0];
        this.obj_circle_medium = this.node.children[1];
        this.obj_circle_small = this.node.children[2];
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

    // 依据力量和方向，设置鼠标位置。和SetSmallCirclePos一个功能，不同方式实现
    Set_value_direction(value:number, angle_deg:number)
    {

    }


    // 根据鼠标位置，设置,同时计算出力量和方向。 和Set_value_direction一个功能，不同方式实现
    SetSmallCirclePos(iworldpos:Vec3)
    {
        // 

        // 设置小圆位置
        this.obj_circle_small.setWorldPosition(iworldpos)
    }


    // 计算力量和方向
    private _cal_value_direction()
    {

    }

}


