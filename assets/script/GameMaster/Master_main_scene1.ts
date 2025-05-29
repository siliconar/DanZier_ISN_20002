import { _decorator, Component, Node } from 'cc';
import { UI_Curtain_Mgr } from '../UI_Control/UI_Curtain/UI_Curtain_Mgr';
const { ccclass, property } = _decorator;

@ccclass('main_scene1')
export class main_scene1 extends Component {
    async start() {


        // 打开幕布
        await UI_Curtain_Mgr.Instance._curtain(false);


    }

    // update(deltaTime: number) {
        
    // }
}


