// 简单脚本，用于检查环境变量是否可用
// 运行方式: node check-env.js

require('dotenv').config({ path: '.env.local' });

console.log("----- 环境变量检查 -----");
const openaiKey = process.env.OPENAI_API_KEY || '';
console.log("OPENAI_API_KEY:", openaiKey ? `存在，长度: ${openaiKey.length}` : "未定义");
console.log("OPENAI_API_KEY 前10个字符:", openaiKey ? openaiKey.substring(0, 10) : "N/A");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "已设置" : "未设置");
console.log("脚本运行目录:", process.cwd());
console.log("-------------------------"); 