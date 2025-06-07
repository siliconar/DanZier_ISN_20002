import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_ShowTurn_Controller')
export class UI_ShowTurn_Controller extends Component {



    // 组件
    label_TurnID:Label;







    start() {

        this.label_TurnID = this.node.children[1].getComponent(Label);

    }

    // update(deltaTime: number) {
        
    // }


    // 更新第几轮
    ChangeTurnID(iturn:number)
    {
        this.label_TurnID.string = "第"+iturn.toString()+"轮";
    }

}


