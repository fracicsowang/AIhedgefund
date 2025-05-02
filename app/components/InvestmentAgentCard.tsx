import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  Tooltip, 
  Box, 
  Typography, 
  Avatar,
  LinearProgress,
  Chip,
  Stack,
  CardActionArea,
  Collapse,
  IconButton,
  Divider
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import BuyIcon from '@mui/icons-material/TrendingUp';
import SellIcon from '@mui/icons-material/TrendingDown';
import HoldIcon from '@mui/icons-material/HorizontalRule';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { StockData } from '@/types';

// 定义代理类型
export type AgentType = 'benGraham' | 'buffett' | 'riskManager' | 'billAckman';

// 代理头像和名称映射
const agentAvatars: Record<AgentType, string> = {
  'benGraham': '/images/agents/ben-graham.jpg',
  'buffett': '/images/agents/warren-buffett.jpg',
  'riskManager': '/images/agents/risk-manager.jpg',
  'billAckman': '/images/legends/ackman.png',
};

const agentNames: Record<AgentType, string> = {
  'benGraham': 'Benjamin Graham',
  'buffett': 'Warren Buffett',
  'riskManager': '风险管理专家',
  'billAckman': 'Bill Ackman',
};

const agentDescriptions: Record<AgentType, string> = {
  'benGraham': '价值投资之父，注重安全边际，寻找内在价值高于市场价的股票',
  'buffett': '伯克希尔哈撒韦公司掌舵人，专注企业质量、管理和护城河',
  'riskManager': '关注风险控制和市场技术指标，防范下行风险',
  'billAckman': '激进投资代表，专注高质量企业和资本结构优化',
};

// 决策映射到图标和颜色
const decisionIcons: Record<string, React.ReactElement | null> = {
  'BUY': <BuyIcon sx={{ color: 'success.main' }} />,
  'SELL': <SellIcon sx={{ color: 'error.main' }} />,
  'HOLD': <HoldIcon sx={{ color: 'warning.main' }} />
};

const decisionColors: Record<string, string> = {
  'BUY': 'success',
  'SELL': 'error',
  'HOLD': 'warning'
};

interface AgentAnalysisResult {
  decision: string;
  reasoning: string;
  confidence?: number;
  detailedAnalysis?: string; // 添加详细分析字段
}

interface InvestmentAgentCardProps {
  type: AgentType;
  result?: AgentAnalysisResult | null;
  loading?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  stockData?: StockData;
  openAIKey?: string; // 添加OpenAI API密钥参数
}

const InvestmentAgentCard: React.FC<InvestmentAgentCardProps> = ({
  type,
  result,
  loading = false,
  highlighted = false,
  onClick,
  stockData,
  openAIKey, // 接收API密钥
}) => {
  // 状态管理
  const [expanded, setExpanded] = useState(false);
  
  // 检查是否有结果
  const hasResult = result && result.decision;
  const hasDetailedAnalysis = result?.detailedAnalysis && result.detailedAnalysis.length > 0;
  
  // 获取代理头像URL和名称
  const avatarUrl = agentAvatars[type] || '';
  const agentName = agentNames[type] || '投资专家';
  
  // 处理卡片点击
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };
  
  // 切换详细分析的展开/收起
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发卡片的点击事件
    setExpanded(!expanded);
  };
  
  // 分析结果部分
  const renderAnalysisResult = () => {
    if (!hasResult) return null;
    
    const { decision, reasoning, confidence, detailedAnalysis } = result as AgentAnalysisResult;
    
    return (
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={decision}
            color={(decisionColors[decision] as any) || 'default'}
            icon={decisionIcons[decision] || undefined}
            sx={{ mr: 1 }}
          />
          {confidence !== undefined && (
            <Typography variant="body2" color="text.secondary">
              置信度: {confidence}%
            </Typography>
          )}
        </Box>
        
        <Typography variant="body2" sx={{ mb: hasDetailedAnalysis ? 2 : 0 }}>
          {reasoning}
        </Typography>
        
        {hasDetailedAnalysis && (
          <>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 2, 
                cursor: 'pointer' 
              }}
              onClick={toggleExpand}
            >
              <Typography variant="button" color="primary" sx={{ mr: 1 }}>
                {expanded ? '收起详细分析' : '查看详细分析'}
              </Typography>
              {expanded ? <ExpandLessIcon color="primary" /> : <ExpandMoreIcon color="primary" />}
            </Box>
            
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  maxHeight: '400px',
                  overflowY: 'auto' 
                }}
              >
                {detailedAnalysis && (
                  <Typography 
                    variant="body2" 
                    component="div" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      '& h3': { 
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        mt: 1.5,
                        mb: 0.5 
                      },
                      lineHeight: 1.6
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ 
                      __html: detailedAnalysis
                        .replace(/#{1,6} (.*?)$/gm, '<h3>$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />')
                    }} />
                  </Typography>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </Box>
    );
  };
  
  return (
    <Card 
      elevation={highlighted ? 6 : 1}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderColor: highlighted ? 'primary.main' : 'transparent',
        borderWidth: 2,
        borderStyle: 'solid',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 6,
          transform: onClick ? 'translateY(-5px)' : 'none',
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick} 
        disabled={loading}
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardHeader
          avatar={
            <Avatar 
              src={avatarUrl} 
              alt={agentName}
              sx={{ width: 56, height: 56 }}
            />
          }
          title={
            <Typography variant="h6" component="div">
              {agentName}
            </Typography>
          }
          action={
            highlighted ? (
              <Tooltip title="首选分析师">
                <StarIcon color="primary" sx={{ mr: 1, mt: 1 }} />
              </Tooltip>
            ) : (
              <Tooltip title="设为首选">
                <StarBorderIcon sx={{ mr: 1, mt: 1, color: 'text.secondary' }} />
              </Tooltip>
            )
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              {agentDescriptions[type]}
            </Typography>
          }
        />
        
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {loading ? (
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                正在分析...
              </Typography>
              <LinearProgress />
            </Box>
          ) : (
            renderAnalysisResult()
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default InvestmentAgentCard;

export async function getAgentAnalysis(
  agentType: AgentType, 
  stockData: StockData,
  openAIKey?: string // 添加OpenAI API密钥参数
): Promise<AgentAnalysisResult> {
  try {
    // 构建请求URL和请求体
    let apiUrl = `/api/agent-decision/${agentType}/`;
    const requestBody: any = { stockData };
    if (agentType === 'benGraham' && openAIKey) {
      requestBody.apiKey = openAIKey;
    }
    // billAckman 也支持 openAIKey
    if (agentType === 'billAckman' && openAIKey) {
      requestBody.apiKey = openAIKey;
    }
    // 发送请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Agent API error:', errorData);
      throw new Error(`API错误: ${errorData.error || response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(`${agentType} 分析失败:`, error);
    return {
      decision: 'HOLD',
      reasoning: `分析过程中出错: ${error.message || '未知错误'}. 建议持有或进一步研究.`,
      confidence: 50
    };
  }
} 