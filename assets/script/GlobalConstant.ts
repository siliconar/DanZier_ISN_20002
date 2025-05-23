import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GlobalConstant')
export class GlobalConstant extends Component {



    //---- 单例
    static Instance: GlobalConstant

    protected onLoad(): void {
        GlobalConstant.Instance = this;
    }

    //---- 暴露变量
    @property
    speed:number = 1;   // 速度

    @property
    damping_ratio:number = 1;  // 阻尼

    @property
    CurRunningPartyID:number = 0   // 当前进攻的是哪一方，0是player 1是敌人


}


