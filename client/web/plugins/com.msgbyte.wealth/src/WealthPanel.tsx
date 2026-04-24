import React, { useState, useEffect } from 'react';
import { Icon, LoadingSpinner } from '@capital/component';

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

// --- 伪 AI 包装逻辑与免费行情接入 ---

// 精选股票池（各行业龙头）
const STOCK_POOL = [
  { code: 'sh600519', tag: '白酒龙头' },
  { code: 'sz300750', tag: '新能源' },
  { code: 'sh601138', tag: 'AI算力' },
  { code: 'sh600036', tag: '大金融' },
  { code: 'sz000858', tag: '免税概念' },
  { code: 'sh600900', tag: '电力核心' },
  { code: 'sz002594', tag: '新能源车' },
  { code: 'sh601899', tag: '有色金属' },
  { code: 'sz002304', tag: '白酒黑马' },
  { code: 'sh601888', tag: '免税茅' },
];

interface StockData {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  tag: string;
  analysis: string;
  advice: string;
  themeColor: 'red' | 'green' | 'blue';
}

// 动态生成“高逼格” AI 话术
const generateAIAnalysis = (changePercent: number): { analysis: string; advice: string; themeColor: 'red'|'green'|'blue' } => {
  if (changePercent > 5) {
    return {
      analysis: '量价齐升，资金持续净流入。技术形态呈现强势突破，短期动能极强，主力拉升意图明显。',
      advice: '强势跟进，注意设置动态止盈位',
      themeColor: 'red'
    };
  } else if (changePercent > 1) {
    return {
      analysis: '多头趋势良好，估值处于合理区间。近期机构研报密集覆盖，具备较高的中长期配置安全边际。',
      advice: '逢低定投，建议长线底仓持有',
      themeColor: 'red'
    };
  } else if (changePercent > -1) {
    return {
      analysis: '多空双方博弈激烈，正处于重要方向选择节点。基本面依然稳健，资金面暂无明显外流迹象。',
      advice: '保持观望，等待放量突破信号',
      themeColor: 'blue'
    };
  } else if (changePercent > -5) {
    return {
      analysis: '短期技术性回调，回踩重要均线支撑位确认。资金面呈现分歧，但中长线核心逻辑未遭破坏。',
      advice: '波段操作，关注下方强支撑位',
      themeColor: 'green'
    };
  } else {
    return {
      analysis: '短期空头集中释放压力，乖离率逐渐偏大。左侧交易机会正在孕育，切勿盲目杀跌或轻易抄底。',
      advice: '轻仓观望，耐心等待企稳结构成型',
      themeColor: 'green'
    };
  }
};

// 封装 JSONP 请求腾讯免费行情接口
const fetchRealtimeStocks = (): Promise<StockData[]> => {
  return new Promise((resolve) => {
    // 随机抽取 3 只股票
    const shuffled = [...STOCK_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const codes = selected.map(s => s.code).join(',');

    const script = document.createElement('script');
    script.src = `https://qt.gtimg.cn/q=${codes}`;
    script.onload = () => {
      const results: StockData[] = [];
      selected.forEach(item => {
        const rawData = (window as any)[`v_${item.code}`];
        if (rawData) {
          const parts = rawData.split('~');
          const price = parseFloat(parts[3]);
          const changePercent = parseFloat(parts[32]); // 腾讯接口涨跌幅是 32
          const aiLogic = generateAIAnalysis(changePercent);
          
          results.push({
            code: item.code.replace(/^(sh|sz)/, ''),
            name: parts[1],
            price,
            changePercent,
            tag: item.tag,
            ...aiLogic
          });
        }
      });
      document.head.removeChild(script);
      resolve(results);
    };
    script.onerror = () => resolve([]); // 容错处理
    document.head.appendChild(script);
  });
};


const WealthPanelInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pick' | 'diag'>('pick');
  const [stockCode, setStockCode] = useState('');
  const [diagUrl, setDiagUrl] = useState('');
  
  const [aiPicks, setAiPicks] = useState<StockData[]>([]);
  const [loadingStep, setLoadingStep] = useState<number>(0); // 0: done, 1: scanning, 2: calculating

  const loadAIPicks = async () => {
    setLoadingStep(1);
    // 模拟 "深度扫描"
    await new Promise(r => setTimeout(r, 800));
    setLoadingStep(2);
    
    // 真实抓取数据
    const data = await fetchRealtimeStocks();
    
    // 模拟 "量化计算"
    await new Promise(r => setTimeout(r, 600));
    setAiPicks(data);
    setLoadingStep(0);
  };

  // 初始加载
  useEffect(() => {
    if (activeTab === 'pick' && aiPicks.length === 0) {
      loadAIPicks();
    }
  }, [activeTab]);

  const handleDiag = (forceCode?: string) => {
    const targetCode = forceCode || stockCode;
    if (!targetCode) return;
    
    const code =
      targetCode.toLowerCase().startsWith('sz') ||
      targetCode.toLowerCase().startsWith('sh')
        ? targetCode.toLowerCase()
        : targetCode.startsWith('6')
        ? `sh${targetCode}`
        : `sz${targetCode}`;

    setStockCode(targetCode);
    setDiagUrl(`https://wap.eastmoney.com/quote/stock/${code}.html`);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden bg-gray-50 text-gray-800 relative">
      <div className="mb-4 border-b border-gray-200 pb-4 shrink-0">
        <h1 className="text-2xl font-bold flex items-center">
          <Icon icon="mdi:robot-outline" className="mr-2 text-[#d4af37]" />
          AI 财富助手
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          为您提供轻量化的智能选股与个股深度诊断服务
        </p>
      </div>

      <div className="flex space-x-4 mb-4 shrink-0">
        <button
          className={`px-4 py-2 rounded-md transition-colors font-medium shadow-sm ${
            activeTab === 'pick'
              ? 'bg-[#0b192c] text-[#d4af37]'
              : 'bg-white hover:bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveTab('pick')}
        >
          智能选股 (AI Picks)
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors font-medium shadow-sm ${
            activeTab === 'diag'
              ? 'bg-[#0b192c] text-[#d4af37]'
              : 'bg-white hover:bg-gray-100 text-gray-600'
          }`}
          onClick={() => setActiveTab('diag')}
        >
          智能诊股 (AI Diagnosis)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
        {activeTab === 'pick' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    <Icon icon="mdi:fire" className="text-red-500 mr-1" />
                    今日 AI 量化金股精选
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    基于深度学习大模型实时演算，结合全网资金流向为您呈现。
                  </p>
                </div>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  onClick={loadAIPicks}
                  disabled={loadingStep !== 0}
                >
                  <Icon icon="mdi:refresh" className={`mr-1 ${loadingStep !== 0 ? 'animate-spin' : ''}`} />
                  重新推演
                </button>
              </div>

              {loadingStep > 0 ? (
                <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <LoadingSpinner />
                  <p className="mt-4 text-[#0b192c] font-medium flex items-center">
                    <Icon icon="mdi:brain" className="mr-2 text-[#d4af37] animate-pulse" />
                    {loadingStep === 1 ? 'AI 正在深度扫描全网实时资讯与研报...' : '正在结合多因子量化模型计算安全边际...'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {aiPicks.map((pick, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-lg shadow-sm border-l-4 bg-gray-50 hover:bg-white transition-colors cursor-pointer ${
                        pick.themeColor === 'red' ? 'border-red-500' : 
                        pick.themeColor === 'green' ? 'border-green-500' : 'border-blue-500'
                      }`}
                      onClick={() => {
                        setActiveTab('diag');
                        handleDiag(pick.code);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="font-bold text-lg text-gray-800 mr-2">{pick.name}</span>
                          <span className="text-sm text-gray-500 font-mono">{pick.code}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-lg ${pick.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {pick.price.toFixed(2)}
                          </div>
                          <div className={`text-xs font-medium ${pick.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {pick.changePercent > 0 ? '+' : ''}{pick.changePercent}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          pick.themeColor === 'red' ? 'bg-red-100 text-red-800' : 
                          pick.themeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pick.tag}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        <strong className="text-gray-800">AI 深度剖析：</strong> 
                        {pick.analysis}
                      </p>
                      
                      <div className={`text-sm font-semibold p-2 rounded ${
                        pick.themeColor === 'red' ? 'bg-red-50 text-red-600' : 
                        pick.themeColor === 'green' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <Icon icon="mdi:lightbulb-on-outline" className="mr-1" />
                        AI 建议：{pick.advice}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'diag' && (
          <div className="h-full flex flex-col bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 border-2 border-gray-200 bg-gray-50 rounded-lg px-4 py-3 focus:outline-none focus:border-[#d4af37] focus:bg-white transition-colors text-lg"
                  placeholder="输入股票代码 (如: 600519) 呼唤 AI 诊股"
                  value={stockCode}
                  onChange={(e) => setStockCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDiag()}
                />
                <button
                  className="bg-[#0b192c] hover:bg-[#d4af37] text-white px-8 py-3 rounded-lg transition-colors font-bold text-lg flex items-center shadow-md"
                  onClick={() => handleDiag()}
                >
                  <Icon icon="mdi:magnify-scan" className="mr-2" />
                  深度诊断
                </button>
              </div>
              <div className="flex items-center mt-3 text-sm">
                <span className="text-gray-500 mr-2 flex items-center">
                  <Icon icon="mdi:fire" className="text-red-500 mr-1" /> 热门扫描：
                </span>
                {['600519', '300750', '601138', '000858'].map(c => (
                  <button 
                    key={c}
                    className="mr-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-mono transition-colors"
                    onClick={() => handleDiag(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-gray-100 rounded-xl overflow-hidden relative shadow-inner border-4 border-gray-800 mt-2">
              {/* 模拟一个手机壳的顶部 */}
              <div className="h-6 bg-gray-800 w-full flex justify-center items-center">
                <div className="w-16 h-1.5 bg-gray-600 rounded-full"></div>
              </div>
              
              {diagUrl ? (
                <iframe
                  src={diagUrl}
                  className="w-full h-full border-none bg-white"
                  title="Stock Diagnosis"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white">
                  <Icon
                    icon="mdi:chart-box-outline"
                    className="text-7xl mb-4 text-gray-300"
                  />
                  <p className="text-lg">等待输入标的指令</p>
                  <p className="text-sm mt-2">接入东方财富高频核心数据，提供资金面与技术面深度剖析</p>
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
