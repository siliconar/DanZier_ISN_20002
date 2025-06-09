import { IVec2Like, Vec2, Vec3 } from "cc";

export class Utils  {


    static generateUniqueString(str1: string, str2: string): string {
        // 确保字符串按字典顺序排序
        const [first, second] = [str1, str2].sort();
        return `${first}_${second}`;
    }
    

    // 碰撞两个人，根据名字选择谁处理
    static collision_choose_byname(selfname: string, othername: string): boolean
    {
      const [first, second] = [selfname, othername].sort();
      if (first == selfname)
        return true;
      else
        return false;
    }
    
    static Cal_time_bypos(p1:Vec3, p2:Vec3, Speed:number) : number
    {
        const dist = Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
        return  dist/Speed;
    }

    // 计算vec3和vec2的距离
    static calculate_dist(p1:IVec2Like, p2:IVec2Like):number
    {
        return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y))
    }

    // 知道起点终点，计算角度
    static calculate_angle_deg(p1:IVec2Like, p2:IVec2Like):number
    {
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;

      let angleRadians = Math.atan2(dy, dx);
      return angleRadians * 180 / Math.PI;
    }



    /**
     * 计算反射向量
     * R = I - 2 * dot(I, N) * N
     */
    static reflect2D(I: Vec2, N: Vec2): Vec2 {
        // 单位化 I 和 N
        const lenI = Math.hypot(I.x, I.y);
        const lenN = Math.hypot(N.x, N.y);
        const i = { x: I.x / lenI, y: I.y / lenI };
        const n = { x: N.x / lenN, y: N.y / lenN };
    
        // dot(I, N)
        const dotIN = i.x * n.x + i.y * n.y;
    
        // R = I - 2 * dot(I, N) * N
        return new Vec2(
             i.x - 2 * dotIN * n.x,
            i.y - 2 * dotIN * n.y
        );
    }



  


}