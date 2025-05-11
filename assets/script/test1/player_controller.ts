import { _decorator, Component, Node } from 'cc';
import { GObjectbase1 } from '../baseclass/GObjectbase1';
import { Message3 } from '../baseclass/Message3';
import { MessageCenter3 } from '../baseclass/MessageCenter3';
const { ccclass, property } = _decorator;

@ccclass('player_controller')
export class player_controller extends GObjectbase1 {




    //---- 变量
    @property
    dir: number =0  // 移动方向


    // ----- 重载
    // 设置自己接受消息的类型，等待继承重写。
    _setOwnNodeName(): string {


        // 下面两种写法都可以，但是有区别。
        // 第一种写法是把自己的nodename写死了，这个适用于manager节点，不会变。
        // 第二种写法适用于任何节点

        // return "player_controller"
        return this.node.name
    }
    // 处理消息(等待后续重载)
    _processMessage(msg: Message3) {
        // 消息列表
        // 暂时没啥


        // cmd =1 要进行移动, Content= 1 2 3 4 分别上下左右
        if (1 == msg.Command) // cmd =1 要进行移动, Content= 1 2 3 4 分别上下左右
        {
            this.dir = msg.Content;
        }

    }




    start() {

        // 注册messagecenter
        MessageCenter3.getInstance(this.BelongedSceneName).RegisterReceiver(this.OwnNodeName, this);
    }

    update(deltaTime: number) {

        if(this.dir==0)
            return;
        else if (this.dir==1)
        {
            let aa = this.node.getPosition();
            this.node.setPosition(aa.x,aa.y+1,aa.z);
        }


    }


}


