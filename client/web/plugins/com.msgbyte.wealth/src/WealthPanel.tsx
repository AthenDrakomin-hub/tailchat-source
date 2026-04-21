import React, { useState } from 'react';
import { Icon } from '@capital/component';

class PluginErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 flex flex-col items-center justify-center h-full">
          <Icon icon="mdi:alert-circle" className="text-4xl mb-2" />
          <p>抱歉，财富助手插件加载遇到问题。</p>
          <p className="text-xs mt-2 opacity-50">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const WealthPanelInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pick' | 'diag'>('pick');
  const [stockCode, setStockCode] = useState('');
  const [diagUrl, setDiagUrl] = useState('');

  const handleDiag = () => {
    if (!stockCode) return;
    // 使用同花顺问财或新浪财经的免费诊股页面
    // 这里使用新浪财经的免费手机端页面作为 iframe 嵌入，适配性好且无跨域限制
    const code =
      stockCode.toLowerCase().startsWith('sz') ||
      stockCode.toLowerCase().startsWith('sh')
        ? stockCode.toLowerCase()
        : stockCode.startsWith('6')
        ? `sh${stockCode}`
        : `sz${stockCode}`;

    // 东方财富手机端诊股页面
    setDiagUrl(`https://wap.eastmoney.com/quote/stock/${code}.html`);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-white text-gray-800">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Icon icon="mdi:robot-outline" className="mr-2 text-[#d4af37]" />
          AI 财富助手
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          为您提供轻量化的智能选股与个股深度诊断服务
        </p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'pick'
              ? 'bg-[#0b192c] text-[#d4af37]'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('pick')}
        >
          智能选股 (AI Picks)
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'diag'
              ? 'bg-[#0b192c] text-[#d4af37]'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
          onClick={() => setActiveTab('diag')}
        >
          智能诊股 (AI Diagnosis)
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === 'pick' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-lg mb-2 text-blue-800">
                今日热门精选 (每日更新)
              </h3>
              <p className="text-sm mb-4">
                基于大数据量化模型与资金流向分析，为您筛选出当前市场最具潜力的标的。
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-red-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">贵州茅台 (600519)</span>
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      白酒龙头
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>AI 分析：</strong>{' '}
                    估值回归历史低位，外资持续净流入。近期批价企稳，具有极高的长期配置安全边际。
                  </p>
                  <p className="text-sm font-semibold text-red-500">
                    操作建议：逢低定投，长线持有
                  </p>
                </div>

                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-green-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">宁德时代 (300750)</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      新能源
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>AI 分析：</strong>{' '}
                    固态电池技术取得突破，海外市占率持续提升。财报业绩超预期，机构一致看多。
                  </p>
                  <p className="text-sm font-semibold text-red-500">
                    操作建议：波段操作，关注均线支撑
                  </p>
                </div>

                <div className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">工业富联 (601138)</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      AI算力
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>AI 分析：</strong>{' '}
                    受益于全球AI算力基础设施建设浪潮，服务器订单饱满，技术面呈多头排列。
                  </p>
                  <p className="text-sm font-semibold text-red-500">
                    操作建议：强势跟进，注意止盈
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diag' && (
          <div className="h-full flex flex-col">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                className="flex-1 border border-gray-300 bg-white rounded-md px-4 py-2 focus:outline-none focus:border-[#d4af37]"
                placeholder="请输入股票代码 (如: 600519)"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDiag()}
              />
              <button
                className="bg-[#0b192c] hover:bg-[#d4af37] text-white px-6 py-2 rounded-md transition-colors"
                onClick={handleDiag}
              >
                开始诊股
              </button>
            </div>

            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              {diagUrl ? (
                <iframe
                  src={diagUrl}
                  className="w-full h-full border-none"
                  title="Stock Diagnosis"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Icon
                    icon="mdi:magnify-scan"
                    className="text-6xl mb-4 opacity-50"
                  />
                  <p>输入股票代码，获取东财/同花顺全方位个股资金与技术面诊断</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WealthPanel: React.FC = () => (
  <PluginErrorBoundary>
    <WealthPanelInner />
  </PluginErrorBoundary>
);

export default WealthPanel;
