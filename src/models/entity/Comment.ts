// src/models/entity/Comment.ts

export interface Comment {
  id: string;               // 使用 UUID 或由服务端生成
  content?: string;         // 评论内容

  authorId?: number;        // 对应 Java 的 Long
  authorName?: string;      // 用户显示名称

  createdAt?: Date;         // 创建时间
}