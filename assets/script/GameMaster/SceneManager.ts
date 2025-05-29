import { _decorator, Component, Director, director, Node, tween, Vec3 } from 'cc';
import { UI_Curtain_Mgr } from '../UI_Control/UI_Curtain/UI_Curtain_Mgr';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {

    
    @property
    currentScene:string = "";  // 当前场景名称
    isLoading:boolean = false;  // 是否正在加载


    // 组件


    protected onLoad(): void {

        director.addPersistRootNode(this.node);  // 注册常驻节点
        director.on(Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLoaded, this);
    }


    protected start(): void {

    }

    async ChangeScene(scenename:string)
    {
        await UI_Curtain_Mgr.Instance._curtain(true);
   
        // 等待加载完
        await this._loadScene("main_scene1")

    }


    // 加载场景
    private async _loadScene(scenename:string):Promise<void>
    {
        return new Promise(
            (resolve)=>{
                director.loadScene(scenename);
                resolve();
            });
    }



    // 回调，当场景
    onSceneLoaded()
    {
        this.isLoading =false;

        const newSceneName:string = director.getScene().name;

        this.currentScene = newSceneName;



    }
}


