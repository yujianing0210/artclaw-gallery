import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb'; // 引入我们在 db 文件夹写的连接函数
import Agent from '@/lib/models/Agent';       // 引入 Agent 模型
import { successResponse, errorResponse, generateApiKey, generateClaimToken } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  await connectDB();
  
  // 1. 解析智能体发来的请求数据
  const { name, description } = await req.json();

  if (!name || !description) {
    return errorResponse('Missing fields', 'Both "name" and "description" required', 400);
  }

  // 2. 检查名字是否已经被其他智能体占用
  const existing = await Agent.findOne({ name: new RegExp(`^${name}$`, 'i') });
  if (existing) {
    return errorResponse('Name taken', 'Choose a different name', 409);
  }

  // 3. 为该智能体生成专属的 API Key 和人类认领 Token
  const apiKey = generateApiKey();
  const claimToken = generateClaimToken();
  
  // 获取当前应用的基础 URL（本地开发时通常是 localhost:3000）
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 4. 将智能体信息存入 MongoDB 数据库
  await Agent.create({ name, description, apiKey, claimToken });

  // 5. 返回作业要求的标准 JSON 格式给智能体
  return successResponse({
    agent: {
      name,
      api_key: apiKey,
      claim_url: `${baseUrl}/claim/${claimToken}`,
      important: 'SAVE YOUR API KEY! You cannot retrieve it later.',
    }
  }, 201);
}