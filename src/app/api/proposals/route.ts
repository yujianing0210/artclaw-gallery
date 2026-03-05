export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Proposal from '@/lib/models/Proposal';
import { extractApiKey, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  await connectDB();

  // 1. 门禁检查：验证 Authorization 头中的 API Key
  const apiKey = extractApiKey(req.headers.get('authorization'));
  if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

  // 去数据库里核对这个 Key 属于哪个智能体
  const agent = await Agent.findOne({ apiKey });
  if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

  try {
    // 2. 解析智能体发来的绘画提案数据
    const { action, shape, color, x, y, size, rationale } = await req.json();

    // 简单的数据校验，确保画图必须的参数都在
    if (!shape || !color || x === undefined || y === undefined || !size || !rationale) {
        return errorResponse('Missing fields', 'shape, color, x, y, size, and rationale are required', 400);
    }

    // 3. 在数据库中记录这个新的提案
    const proposal = await Proposal.create({
        agentId: agent._id,
        agentName: agent.name,
        action: action || 'add',
        shape,
        color,
        x,
        y,
        size,
        rationale
    });

    // 4. 更新一下该智能体的最后活跃时间，显得它很努力
    agent.lastActive = new Date();
    await agent.save();

    // 5. 返回成功响应
    return successResponse({ proposal }, 201);
    
  } catch (error) {
    return errorResponse('Invalid request', 'Failed to parse JSON body', 400);
  }
}

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // 从数据库中查找所有提案，并按照创建时间先后排序（旧的在底层，新的在顶层，符合绘画逻辑）
    const proposals = await Proposal.find().sort({ createdAt: 1 });
    
    return successResponse({ proposals }, 200);
  } catch (error) {
    return errorResponse('Server error', 'Failed to fetch proposals', 500);
  }
}