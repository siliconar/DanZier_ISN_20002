import { _decorator, Component, director } from 'cc';
import { Message3 } from './Message3';
const { ccclass, property } = _decorator;

@ccclass('GObjectbase1')
export class GObjectbase1 extends Component {


    //--- 注意
    // 所有继承类，1. 要重载_setOwnMessageType ，设定自己的消息类型
    // 2. Start中注册自己
    // 其次重载_processMessage



    // 自我名称，用于路由
    OwnNodeName:string;

    // 所属场景
    BelongedSceneName:string

    // 设置自己名称，所有实例不可重复（需要每个Instance重写）
    _setOwnNodeName():string
    {
        return "Unknown"
    }


    protected onLoad(): void {
        // 每次实例化的时候，都要指定设置自己名称
        this.OwnNodeName = this._setOwnNodeName()

        //设置自己的场景
        this.BelongedSceneName = director.getScene().name
    }



    // 接收消息(等待其他基类重载)
    ReceiveMessage(msg:Message3)
    {
        this._processMessage(msg);
    }

    // 处理消息（需要每个Instance重写）
    _processMessage(msg:Message3)
    {
    }
    

    
}


