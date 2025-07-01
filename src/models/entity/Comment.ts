// src/models/entity/Comment.ts

export interface Comment {
  id: string; // MongoDB 内嵌评论的 ID
  content: string;
  authorId: number; // 后端是 Long，前端用 number
  authorName: string;
  createdAt: string; // 后端是 LocalDateTime，前端用 string
}