/**
 * Utility to check OpenAI API key configuration
 * 
 * This script checks for the presence and format of OpenAI API key
 * in the environment variables and provides information about how
 * to correctly set it up.
 */

require('dotenv').config();

function checkOpenAIKey() {
  console.log('==== OpenAI API Key Check ====');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in environment variables');
    console.log('To fix this issue:');
    console.log('1. Create or update your .env.local file in the project root');
    console.log('2. Add the following line:');
    console.log('   OPENAI_API_KEY=your_actual_openai_api_key');
    console.log('3. Restart your development server');
    return false;
  }
  
  if (apiKey === '您的OpenAI密钥' || apiKey.includes('your_') || apiKey.length < 20) {
    console.error('❌ OPENAI_API_KEY appears to be a placeholder or invalid');
    console.log('Current value:', maskApiKey(apiKey));
    console.log('This looks like a placeholder value rather than a real API key');
    console.log('Please replace it with your actual OpenAI API key');
    return false;
  }
  
  console.log('✅ OPENAI_API_KEY is set');
  console.log('Key format appears valid:', maskApiKey(apiKey));
  console.log('Key length:', apiKey.length, 'characters');
  
  // Check if there are any whitespace or newline characters
  if (apiKey !== apiKey.trim() || apiKey.includes('\n') || apiKey.includes('\r')) {
    console.warn('⚠️ Warning: Your API key contains whitespace or newline characters');
    console.log('Consider cleaning the key value in your .env.local file');
  }
  
  return true;
}

function maskApiKey(key) {
  if (!key) return 'undefined';
  if (key.length <= 10) return key;
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
}

// Run the check when script is executed directly
if (require.main === module) {
  checkOpenAIKey();
}

module.exports = { checkOpenAIKey }; 