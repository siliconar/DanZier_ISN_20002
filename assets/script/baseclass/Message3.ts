import { _decorator } from 'cc';
const { ccclass, property } = _decorator;


export class Message3 {

    // //类型 123
    // Type: number[];
    // //命令 100 101 200 201
    // Command: number;
    // //参数
    // Content: any;


    // //构造方法
    // constructor(type,command, content)
    // {
    //     this.Type = [...type];
    //     this.Command = command;
    //     this.Content = content;
    // }

    // 发送者ID
    senderID:string;
    // 接收者ID
    receiverID:string;
    // 命令
    Command:number;
    // 参数
    Content:any;

    constructor(senderID:string,receiverID:string, Command:number, Content:any)
    {
        this.senderID = senderID
        this.receiverID = receiverID
        this.Command = Command;
        this.Content = Content;
    }

}
