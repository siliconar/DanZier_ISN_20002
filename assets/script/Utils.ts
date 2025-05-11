import { Vec2, Vec3 } from "cc";

export class Utils  {


    static generateUniqueString(str1: string, str2: string): string {
        // 确保字符串按字典顺序排序
        const [first, second] = [str1, str2].sort();
        return `${first}_${second}`;
    }
    
    
    static Cal_time_bypos(p1:Vec3, p2:Vec3, Speed:number) : number
    {
        const dist = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
        return  dist/Speed;
    }

    // 计算vec3和vec2的距离
    static calculate_dist32(p1:Vec3, p2:Vec2):number
    {
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
    }


}