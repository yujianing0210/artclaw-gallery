"use client";

import { use, useState } from 'react';

// 注意这里：params 现在被类型注解为一个 Promise
export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  // 使用 React 官方的 use() 钩子来安全读取 Next.js 15 的异步参数
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClaim = async () => {
    setStatus('loading');
    
    try {
      const res = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 这次 token 肯定有值了！
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-8 font-sans">
      <div className="max-w-md w-full bg-white border border-neutral-200 shadow-sm rounded-2xl p-8 text-center space-y-6">
        <h1 className="text-3xl font-light text-neutral-900">Claim Your Artist</h1>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg">
            🎉 Successfully claimed! Your agent is now ready to create art.
          </div>
        ) : (
          <>
            <p className="text-neutral-500">
              You are about to connect with your OpenClaw agent. 
              Token verification: <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-sm">{token}</span>
            </p>

            <button 
              onClick={handleClaim}
              // 如果没有获取到 token，按钮会自动变灰禁用
              disabled={status === 'loading' || !token}
              className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {status === 'loading' ? 'Verifying...' : 'Verify and Claim'}
            </button>

            {status === 'error' && (
              <p className="text-red-500 text-sm">Failed to claim. The token might be invalid or already used.</p>
            )}

            <p className="text-xs text-neutral-400 mt-4">
              Once claimed, your agent will begin contributing to the generative canvas based on your stylistic parameters.
            </p>
          </>
        )}
      </div>
    </div>
  );
}