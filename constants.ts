export const DEFAULT_CODE = `import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  {
    subject: '管辖 (执法环境)',
    A: 5,
    fullMark: 5,
    type: 'risk',
    description: '极高风险：涉及美国长臂管辖、数据制裁及巴西税务稽查。',
    summary: '环境恶劣',
  },
  {
    subject: '发现 (法律上的抗辩)',
    A: 4,
    fullMark: 5,
    type: 'defense',
    description: '强抗辩：通过“真金”定义与“经济实质”建设，构建解释权。',
    summary: '解释权在握',
  },
  {
    subject: '取证难度',
    A: 4.5,
    fullMark: 5,
    type: 'defense',
    description: '高壁垒：离岸控股+本地嵌套架构，极大增加外部执法难度。',
    summary: '架构隔离',
  },
  {
    subject: '意愿度',
    A: 4,
    fullMark: 5,
    type: 'risk',
    description: '强意愿：监管3.0时代，且面临代理商激烈冲突与黑灰产。',
    summary: '对手活跃',
  },
  {
    subject: '赔偿',
    A: 4.5,
    fullMark: 5,
    type: 'risk',
    description: '高敞口：涉及税务筹划及短剧版权赔付，财务影响巨大。',
    summary: '金额巨大',
  },
  {
    subject: '正义性 (PR)',
    A: 3,
    fullMark: 5,
    type: 'risk',
    description: '中等敏感：GC业务及版权问题天然带有舆论敏感性。',
    summary: '舆论风险',
  },
];

// 自定义标签组件
const CustomTick = ({ payload, x, y, textAnchor }) => {
  const dataPoint = data.find(d => d.subject === payload.value);
  
  let xOffset = 0;
  let yOffset = 0;
  let alignClass = "";
  
  if (textAnchor === 'start') {
    xOffset = 10;
    yOffset = -40;
    alignClass = "text-left";
  } else if (textAnchor === 'end') {
    xOffset = -210;
    yOffset = -40;
    alignClass = "text-right";
  } else {
    xOffset = -100;
    yOffset = y < 150 ? -90 : 20;
    alignClass = "text-center";
  }

  if (payload.value.includes('正义性')) { xOffset -= 20; }

  // 颜色逻辑
  let borderColor = 'border-yellow-500';
  let textColor = 'text-yellow-600';
  
  if (dataPoint.type === 'defense') {
      borderColor = 'border-blue-500';
      textColor = 'text-blue-600';
  } else if (dataPoint.A >= 4) {
      borderColor = 'border-red-500';
      textColor = 'text-red-600';
  }

  return (
    <g transform={\`translate(\${x},\${y})\`}>
      <foreignObject x={xOffset} y={yOffset} width="220" height="120" style={{ overflow: 'visible' }}>
        <div className={\`flex flex-col \${alignClass === 'text-right' ? 'items-end' : alignClass === 'text-left' ? 'items-start' : 'items-center'}\`}>
          <div className="font-bold text-gray-900 text-xs sm:text-sm bg-white/90 px-1 rounded shadow-sm border border-gray-200 whitespace-nowrap">
            {payload.value}
          </div>
          
          <div className={\`mt-1 bg-white/95 border-l-4 \${borderColor} shadow-md rounded p-2 max-w-[200px] pointer-events-none\`}>
            <div className="flex justify-between items-center mb-1">
               <span className={\`font-bold text-lg \${textColor}\`}>
                 {dataPoint.A}<span className="text-xs text-gray-400">/5</span>
               </span>
               <span className="text-xs font-semibold text-gray-500 px-1 bg-gray-100 rounded">
                 {dataPoint.summary}
               </span>
            </div>
            <p className="text-[10px] text-gray-600 leading-tight text-left">
              {dataPoint.description}
            </p>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

const OverseasComplianceRadar = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">2025年度海外风险因子雷达图（攻防画像）</h2>
      </div>
      
      <div className="h-[500px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data} margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
            <PolarGrid gridType="polygon" stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={<CustomTick />} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
            <Radar
              name="2025合规态势"
              dataKey="A"
              stroke="#4B5563" 
              strokeWidth={2}
              fill="#9CA3AF" 
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-5">
           <span className="text-9xl font-bold text-gray-900">2025</span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-sm mr-1 opacity-80"></span>
            <span>高危环境因子 (风险侧)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1 opacity-80"></span>
            <span>核心防御手段 (防御侧)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-sm mr-1 opacity-80"></span>
            <span>中等风险关注</span>
          </div>
      </div>
    </div>
  );
};

export default OverseasComplianceRadar;
`;
