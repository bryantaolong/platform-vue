// src/models/entity/Post.ts

import type {Comment} from '@/models/entity/Comment';

export interface Post {
  id?: string;              // MongoDB 自动生成的 _id
  slug?: string;            // 唯一标识符
  title?: string;           // 标题
  content?: string;         // 正文内容

  authorId?: number;        // 用户ID（对应 MySQL 中的 Long 类型）
  authorName?: string;      // 用户名

  tags: string[];           // 标签列表
  comments: Comment[];      // 内嵌评论数组
  featuredImage?: string;   // 封面图 URL

  createdAt?: Date;         // 创建时间
  updatedAt?: Date;         // 最后修改时间

  status: PostStatus;       // 博文状态
  stats: PostStats;         // 统计数据
}

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface PostStats {
  views: number;
  likes: number;
  shares: number;
}