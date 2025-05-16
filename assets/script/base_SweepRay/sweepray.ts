import { _decorator, Component, ERaycast2DType, geometry, Node, PhysicsSystem2D, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('sweepray')
export class sweepray extends Component {


    // 投射一个圆形的检测。
    // 原理：就像激光雷达一样，发送一排激光，哪个最近就是哪个
    // mask： 就是碰撞射线的mask
    // radius：半径
    SweepCastCircleCloset(startworldpos:Vec3, endworldpos:Vec3,mask:number, radius:number)
    {
                
        const results  = PhysicsSystem2D.instance.raycast(startworldpos, endworldpos,ERaycast2DType.Closest,2)
        if(results.length>0)
        {
            console.log("有检测")
        }
    }



}


