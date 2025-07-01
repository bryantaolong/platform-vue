// src/models/entity/Post.ts
import type { Comment } from './Comment'; // 导入 Comment 类型

export interface Post {
  id: string; // MongoDB 的 ID 通常是 String
  slug: string;
  title: string;
  content: string;
  authorId: number; // 后端是 Long，前端用 number
  authorName: string;
  tags: string[];
  comments: Comment[];
  featuredImage?: string;
  createdAt: string; // 后端是 LocalDateTime，前端用 string (ISO 8601 格式)
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // 枚举类型
  stats: PostStats;
}

export interface PostStats {
  views: number;
  likes: number;
  shares: number;
}