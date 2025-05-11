import { _decorator, Component, Node } from 'cc';
import { MessageCenter3 } from '../baseclass/MessageCenter3';
const { ccclass, property } = _decorator;

@ccclass('btn1_controller')
export class btn1_controller extends Component {
    // start() {

    // }

    // update(deltaTime: number) {
        
    // }


    pressup()
    {
        // 消息中心发送消息，让开始走
        MessageCenter3.getInstance("test1").SendCustomerMessage("",["player"],1,1)
        // 场景名也可以用this.BelongedSceneName ，但是需要继承自GObjectbase1
    }



}


