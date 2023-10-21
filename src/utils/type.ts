export interface ReviewInfo {
    deckID: string;
    cardID?: string;
    blockID: string;
    nextDues?: {
      1: string;
      2: string;
      3: string; 
      4: string;
    }
    isNewCard?:boolean;
   }
export type ReviewOption = 
"reviewcard"    //显示隐藏并打分
|"changeRate"   //修改得分 
|"hiddenCard"   //隐藏闪卡背面
|"readingDoc"   //渐进阅读文档
|"browerCard"   //使用前后移动浏览卡片
|"processMark"  //处理被标记的卡片