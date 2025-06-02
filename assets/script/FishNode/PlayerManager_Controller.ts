import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerManager_Controller')
export class PlayerManager_Controller extends Component {



    //---- 单例
    static Instance: PlayerManager_Controller

    protected onLoad(): void {
        // super.onLoad();
        PlayerManager_Controller.Instance = this;
    }










    // start() {

    // }

    // update(deltaTime: number) {
        
    // }
}


