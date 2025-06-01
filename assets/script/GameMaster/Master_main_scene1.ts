import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { UI_Curtain_Mgr } from '../UI_Control/UI_Curtain/UI_Curtain_Mgr';
const { ccclass, property } = _decorator;

@ccclass('main_scene1')
export class main_scene1 extends Component {





    //--= 组件
    obj_Musk:Node = null;
    obj_topcurtain:Node = null;   // 上幕布
    ojb_bottomcurtain:Node = null;  // 下幕布
    obj_draw_lots:Node = null;   // 抽签








    start() {

        this.obj_Musk = this.node.children[0];
        this.obj_topcurtain = this.node.children[1].children[0];
        this.ojb_bottomcurtain = this.node.children[1].children[1];
        this.obj_draw_lots = this.node.children[2];   // 抽签
        // 最后一步，异步开始游戏流程
        this.StartGameFlow();
    }


    // 开始游戏流程
    async StartGameFlow()
    {
        // 打开幕布
        await this._curtain(false);
        // 播放先手后手抽签
        await this._draw_Lots();

        // 出场动画

        // 
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

        await this.sleep(5000);  // 等待5秒
        // 关闭显示
        this.obj_draw_lots.children[0].active =false;
        this.obj_draw_lots.children[1].active =false;

        console.log("抽签结束")
        return new Promise(
            (resolve)=>{ resolve();});

    }


    // 休眠
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


}


