import { request } from '../api/request';

export interface FeedPost {
  _id: string;
  author: string;
  content: string;
  images?: string[];
  groupId?: string | null;
  commentsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedComment {
  _id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function listFeedPosts(groupId?: string): Promise<FeedPost[]> {
  const { data } = await request.get('/api/feed/listPosts', {
    params: {
      groupId,
    },
  });

  return data;
}

export async function createFeedPost(payload: {
  content: string;
  images?: string[];
  groupId?: string;
}): Promise<FeedPost> {
  const { data } = await request.post('/api/feed/createPost', payload);

  return data;
}

export async function commentFeedPost(payload: {
  postId: string;
  content: string;
}): Promise<FeedComment> {
  const { data } = await request.post('/api/feed/commentPost', payload);

  return data;
}

export async function likeFeedPost(postId: string): Promise<{
  postId: string;
  likesCount: number;
}> {
  const { data } = await request.post('/api/feed/likePost', {
    postId,
  });

  return data;
}
