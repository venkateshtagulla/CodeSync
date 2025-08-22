import axios from 'axios';

export const executeCode = async (code, language) => {
  try {
    const languageMap = {
      javascript: 'nodejs',
      python: 'python3',
      java: 'java',
      cpp: 'cpp17',
      c: 'c',
      html: 'html',
      css: 'css'
    };

    const jdoodleLanguage = languageMap[language] || 'nodejs';

    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId: process.env.JDOODLE_CLIENT_ID || 'test',
      clientSecret: process.env.JDOODLE_CLIENT_SECRET || 'test',
      script: code,
      language: jdoodleLanguage,
      versionIndex: '0'
    });

    return {
      output: response.data.output || '',
      error: response.data.error || null,
      statusCode: response.data.statusCode || 200
    };
  } catch (error) {
    console.error('JDoodle API error:', error);
    return {
      output: '',
      error: 'Code execution service unavailable. Please try again later.',
      statusCode: 500
    };
  }
};