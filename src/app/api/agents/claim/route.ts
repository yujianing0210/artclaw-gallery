import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { token } = await req.json();

    if (!token) return errorResponse('Missing token', 'Token is required', 400);

    // 去数据库里寻找匹配这个 token 的智能体
    const agent = await Agent.findOne({ claimToken: token });
    if (!agent) return errorResponse('Invalid token', 'Agent not found', 404);

    // 如果已经认领过了，直接返回成功
    if (agent.claimStatus === 'claimed') {
      return successResponse({ message: 'Agent already claimed' });
    }

    // 更新状态并保存到数据库
    agent.claimStatus = 'claimed';
    await agent.save();

    return successResponse({ message: 'Successfully claimed' });
  } catch (error) {
    return errorResponse('Server error', 'Failed to process claim', 500);
  }
}