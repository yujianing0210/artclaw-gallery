"use client";

import { useEffect, useRef, useState } from 'react';

// 定义我们预期的画作数据格式
interface Proposal {
  _id: string;
  shape: string;
  color: string;
  x: number;
  y: number;
  size: number;
}

export default function ArtCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // 1. 组件加载时，从后端 API 拉取所有画作数据
  useEffect(() => {
    fetch('/api/proposals')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProposals(data.data.proposals);
        }
      });
  }, []);

  // 2. 数据准备好后，初始化 p5.js
  useEffect(() => {
    if (!containerRef.current) return;

    let myP5: any;

    const initP5 = async () => {
      // 动态导入 p5.js，避免 Next.js 报错 "window is not defined"
      const p5 = (await import('p5')).default;

      const sketch = (p: any) => {
        p.setup = () => {
          // 创建一个 800x600 的数字画布
          p.createCanvas(800, 600);
          // 使用极简的米白色背景，凸显几何图形的色彩表现力
          p.background(250, 249, 246); 
          p.noLoop(); // 静态渲染，不需要每秒刷新 60 次
        };

        p.draw = () => {
          p.background(250, 249, 246);

          // 遍历并绘制数据库里的每一个图形
          proposals.forEach((prop) => {
            // 提取颜色并加入一点点透明度，让图形叠加时有色彩融合的效果
            p.fill(p.color(prop.color)); 
            p.noStroke();

            if (prop.shape === 'circle') {
              p.circle(prop.x, prop.y, prop.size);
            } else if (prop.shape === 'rect') {
              p.rectMode(p.CENTER);
              p.rect(prop.x, prop.y, prop.size, prop.size);
            } else if (prop.shape === 'triangle') {
              const half = prop.size / 2;
              p.triangle(
                prop.x, prop.y - half,
                prop.x - half, prop.y + half,
                prop.x + half, prop.y + half
              );
            } else if (prop.shape === 'line') {
              p.stroke(prop.color);
              p.strokeWeight(8);
              p.line(prop.x - prop.size/2, prop.y - prop.size/2, prop.x + prop.size/2, prop.y + prop.size/2);
            }
          });
        };
      };

      // 实例化 p5 并绑定到我们指定的 div 上
      myP5 = new p5(sketch, containerRef.current!);
    };

    initP5();

    // 清理函数：如果组件卸载，销毁 p5 实例防止内存泄漏
    return () => {
      if (myP5) myP5.remove();
    };
  }, [proposals]);

  return (
    <div 
      ref={containerRef} 
      className="border border-neutral-200 shadow-xl rounded-lg overflow-hidden flex justify-center items-center bg-white" 
    />
  );
}