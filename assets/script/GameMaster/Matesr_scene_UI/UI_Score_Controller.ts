import { _decorator, Color, Component, Label, Node, Sprite, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UI_Score_Controller')
export class UI_Score_Controller extends Component {



    // 变量




    // 组件
    // 大比分横幅
    obj_BigScoreBanner: Node = null;
    obj_BigScoreBanner_bg0: Node = null;
    obj_BigScoreBanner_bg1: Node = null;
    obj_BigScoreBanner_score0:Node = null;
    obj_BigScoreBanner_score1: Node = null;

    // 顶部横幅
    obj_TopBanner:Node = null;
    obj_TopBanner_tiny0:Node[] = null;
    obj_TopBanner_tiny1:Node[] = null;





    // 显示大比分的横幅，只有动画
    async ShowBigScoreBanner(Score0: number, Score1: number): Promise<void> {
        // 出现底色
        this.obj_BigScoreBanner_bg0.active = true;
        this.obj_BigScoreBanner_bg1.active = true;
        // 出现分数
        this.obj_BigScoreBanner_score0.active = true;
        this.obj_BigScoreBanner_score1.active = true;

        // 改变分数
        const label_score0 = this.obj_BigScoreBanner_score0.getComponent(Label)
        const label_score1 = this.obj_BigScoreBanner_score1.getComponent(Label)

        label_score0.string = Score0.toString();
        label_score1.string = Score1.toString();

        // 同时改变顶部横幅的分数
        this.ChangeTopBanner(0, Score0)
        this.ChangeTopBanner(1, Score1)
        // 变大
        let t1 = tween(label_score0)
            .to(0.5, { fontSize: 100 })
            .to(1, { fontSize: 80 })
            .repeat(1) //设置次数
            .start()

        let t2 = tween(label_score1)
            .to(0.5, { fontSize: 100 })
            .to(1, { fontSize: 80 })
            .repeat(1) //设置次数
            .start()

        await this.sleep(1500);

        // 消失
        this.obj_BigScoreBanner_bg0.active = false;
        this.obj_BigScoreBanner_bg1.active = false;
        this.obj_BigScoreBanner_score0.active = false;
        this.obj_BigScoreBanner_score1.active = false;

        return new Promise((resolve) => { resolve(); });
    }

    // 改变顶部比分，只有图片
    ChangeTopBanner(partyID: number, Score: number)
    {
        let tinyNodelist;
        if(partyID ==0)
            tinyNodelist =this.obj_TopBanner_tiny0;
        else
            tinyNodelist =this.obj_TopBanner_tiny1;
            for(let ik=0;ik<5;ik++)
            {
                if(ik<Score)
                    tinyNodelist[ik].getComponent(Sprite).color = new Color("#FFFFFF");  // 变亮
                else
                    tinyNodelist[ik].getComponent(Sprite).color = new Color("#949494");  // 变暗
            }
        
    }


    protected onLoad(): void {
        this.obj_BigScoreBanner = this.node.children[0];
        this.obj_BigScoreBanner_bg0 = this.obj_BigScoreBanner.children[0];
        this.obj_BigScoreBanner_bg1 = this.obj_BigScoreBanner.children[1];
        this.obj_BigScoreBanner_score0 = this.obj_BigScoreBanner.children[2];
        this.obj_BigScoreBanner_score1 = this.obj_BigScoreBanner.children[3];


    this.obj_TopBanner = this.node.children[1];
    this.obj_TopBanner_tiny0 = this.obj_TopBanner.children.slice(2,7)
    this.obj_TopBanner_tiny1 = this.obj_TopBanner.children.slice(7,12)

    }

    // start() {

    // }

    // update(deltaTime: number) {

    // }





    // 休眠
    async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }








}


