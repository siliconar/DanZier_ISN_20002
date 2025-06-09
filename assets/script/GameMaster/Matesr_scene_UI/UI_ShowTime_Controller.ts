import { _decorator, Component, Label, Node } from 'cc';
import { Master_main_scene1 } from '../Master_main_scene1';
const { ccclass, property } = _decorator;

@ccclass('UI_ShowTime_Controller')
export class UI_ShowTime_Controller extends Component {


protected onLoad(): void {
            this.Label_Time = this.node.children[1].getComponent(Label);
        this.obj_Party0 = this.node.children[2];   // 显示当前是谁的倒计时
        this.obj_Party1 = this.node.children[3];  // 显示当前是谁的倒计时
}


    start() {



    }

    update(deltaTime: number) {
        
        if(!this.bTimeAwake)
            return;

        this.CurTime-=deltaTime;

        if(this.CurTime<=0)  // 如果时间到了
         {  
            this.bTimeAwake = false;
            this.bTimeisAlarm = true;
            Master_main_scene1.Instance.callback_UserLaunched();
         }
        this.Label_Time.string = this.CurTime.toFixed(0);

    }

    MaxTime:number = 30;   // 最大倒计时
    CurTime:number = 0;   // 当前时间
    Label_Time:Label = null;  // timer的显示
    obj_Party0:Node = null;   // 显示当前是谁的倒计时
    obj_Party1:Node = null;  // 显示当前是谁的倒计时
    bTimeAwake:boolean = false;   // 是否激活timer
    bTimeisAlarm:boolean = false;   // 是否闹钟响了


    ResetTime(partyID: number)
    {
        this.CurTime = this.MaxTime
        this.bTimeAwake = true; // 是否激活timer
        this.bTimeisAlarm=false;   // 是否闹钟响了

        if(this.obj_Party0==null || this.obj_Party1==null)
        {
            console.log("Fatal error1")
        }


        if (0 == partyID) {
            this.obj_Party0.active = true;
            this.obj_Party1.active = false;
        }
        else {
            this.obj_Party0.active = false;
            this.obj_Party1.active = true;
        }

    }

    StopTime()
    {
        this.bTimeAwake = false;
    }


}


