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

    

    // ---- 场景之间交互的内容
    Player0FishTypes:number[] = [0,0,0,0,0];   // 己方5张鱼鱼类型
    Player1FishTypes:number[] = [2,2,2,2,2];    // 敌方5张鱼鱼类型


    //--- 内部变量
    FishTypes_List: Map<number, number[]> = new Map<number, number[]>();   // 注册所有的Tube

    protected start(): void {
        // 变量初始化
        this.FishTypes_List.set(0,this.Player0FishTypes);
        this.FishTypes_List.set(1,this.Player1FishTypes);
    }

    // 取出一个鱼鱼,并返回类型。正常返回类型，如果没有鱼了返回-1
    ApplyOneFishType(partyID:number):number
    {
        if(this.FishTypes_List.get(partyID).length == 0) //如果没有鱼了返回-1
            return -1;

        return this.FishTypes_List.get(partyID).pop()
    }


}


