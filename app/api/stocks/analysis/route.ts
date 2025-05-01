import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // 记录环境变量状态
    let apiKey = process.env.OPENAI_API_KEY || '';
    
    // 处理可能的换行符
    apiKey = apiKey.replace(/\r?\n/g, '');
    
    console.log('API路由中的环境变量状态:');
    console.log(`OPENAI_API_KEY: ${apiKey ? '已设置 (长度: ' + apiKey.length + ')' : '未设置'}`);
    console.log(`API密钥前10个字符: ${apiKey.substring(0, 10)}...`);
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API密钥未设置' }, { status: 500 });
    }
    
    // 测试OpenAI API调用
    const openai = new OpenAI({ apiKey });
    
    try {
      console.log('正在调用OpenAI API...');
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "你是投资顾问助手。" },
          { role: "user", content: "简短介绍什么是价值投资" }
        ],
        max_tokens: 100
      });
      
      const content = completion.choices[0].message.content;
      console.log('OpenAI响应成功!');
      
      return NextResponse.json({
        success: true,
        message: '成功调用OpenAI API',
        response: content,
        apiKeyStatus: '有效',
        apiKeyFirstChars: apiKey.substring(0, 10) + '...'
      });
    } catch (openaiError: any) {
      console.error('OpenAI API调用失败:', openaiError.message || openaiError);
      return NextResponse.json({
        error: '调用OpenAI API失败',
        message: openaiError.message || '未知错误',
        apiKeyStatus: '已设置但可能无效',
        apiKeyFirstChars: apiKey.substring(0, 10) + '...',
        fullError: JSON.stringify(openaiError)
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API路由错误:', error.message || error);
    return NextResponse.json({ 
      error: '服务器内部错误', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
} 