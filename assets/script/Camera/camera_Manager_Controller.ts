import { _decorator, Camera, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('camera_Manager_Controller')
export class camera_Manager_Controller extends Component {

    
    //---- 单例
    static Instance: camera_Manager_Controller

    protected onLoad(): void {
        // super.onLoad();
        camera_Manager_Controller.Instance = this;
    }


    //---- 变量
    _origin_orthoHeight:number  // 记录原始高度


    //--= 组件
    obj_camera:Camera = null;


    protected start(): void {
        this.obj_camera = this.node.getComponent(Camera)

        this._origin_orthoHeight = this.obj_camera.orthoHeight   // 记录原始高度
    }

    // 当前是否在执行震动或其他花活  未完成
    isRunningMoving():boolean
    {
        return false;
    }

    // 震动特效
    effectShake(duration1:number = 0.06, shake_ratio = 0.9)
    {
        //时间
        let tweenDuration=duration1
 
        // let t=tween(this.node)
        // .to(tweenDuration, { position: new Vec3(5, 7, 0) })
        // .to(tweenDuration, { position: new Vec3(-6, 7, 0) })
        // .to(tweenDuration, { position: new Vec3(-13, 3, 0) })
        // .to(tweenDuration, { position: new Vec3(3, -6, 0) })
        // .to(tweenDuration, { position: new Vec3(-5, 5, 0) })
        // .to(tweenDuration, { position: new Vec3(2, -8, 0) })
        // .to(tweenDuration, { position: new Vec3(-8, -10, 0) })
        // .to(tweenDuration, { position: new Vec3(3, 10, 0) })
        // .to(tweenDuration, { position: new Vec3(0, 0, 0) })
        // .repeat(1) //设置次数
        // .start()


        let t=tween(this.obj_camera)
        .to(tweenDuration, { orthoHeight: shake_ratio*this._origin_orthoHeight })
        .to(tweenDuration, { orthoHeight: 1.0*this._origin_orthoHeight })
        .to(tweenDuration, { orthoHeight: shake_ratio*this._origin_orthoHeight })
        .to(tweenDuration, { orthoHeight: 1.0*this._origin_orthoHeight })
        // .to(tweenDuration, { orthoHeight: shake_ratio*this._origin_orthoHeight })
        // .to(tweenDuration, { orthoHeight: 1.0*this._origin_orthoHeight })
        .repeat(1) //设置次数
        .start()


    }



}


