import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_Curtain_Mgr')
export class UI_Curtain_Mgr extends Component {



    //---- 单例
    static Instance: UI_Curtain_Mgr

    protected onLoad(): void {
        // super.onLoad();
        UI_Curtain_Mgr.Instance = this;
    }


    //---- 变量



    //--= 组件
    obj_topcurtain:Node = null;   // 上幕布
    ojb_bottomcurtain:Node = null;  // 下幕布



    start() {

    }

    loadCurtain()
    {
        this.obj_topcurtain = this.node.children[0];
        this.ojb_bottomcurtain = this.node.children[1];
    }


    // 开合幕布
    async _curtain(isclose:boolean):Promise<void>
    {
        this.loadCurtain()
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
}


