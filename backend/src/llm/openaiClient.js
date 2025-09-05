const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeSentiment(text) {
  try {
    const prompt = `
    Analyze the sentiment of this customer email and classify it as exactly one of: Positive, Negative, or Neutral.
    
    Email content: "${text}"
    
    Response format: Just return one word - Positive, Negative, or Neutral.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });

    const sentiment = response.choices.message.content.trim();
    return ['Positive', 'Negative', 'Neutral'].includes(sentiment) ? sentiment : 'Neutral';
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 'Neutral';
  }
}

async function detectPriority(text) {
  try {
    // Rule-based detection first
    const urgentKeywords = [
      'immediately', 'urgent', 'critical', 'cannot access', 'blocked', 
      'down', 'emergency', 'asap', 'help immediately', 'system down',
      'server down', 'outage', 'not working', 'broken'
    ];

    const textLower = text.toLowerCase();
    const hasUrgentKeyword = urgentKeywords.some(keyword => textLower.includes(keyword));

    if (hasUrgentKeyword) {
      return 'Urgent';
    }

    // LLM-based detection for edge cases
    const prompt = `
    Determine the priority level of this customer support request. Classify as either "Urgent" or "Not urgent".
    
    Consider urgent:
    - System access issues
    - Billing problems
    - Service outages
    - Security concerns
    - Time-sensitive requests
    
    Email content: "${text}"
    
    Response format: Just return "Urgent" or "Not urgent".
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });

    const priority = response.choices.message.content.trim();
    return priority === 'Urgent' ? 'Urgent' : 'Not urgent';
  } catch (error) {
    console.error('Priority detection error:', error);
    return 'Not urgent';
  }
}

async function generateResponse(emailContent, sentiment) {
  try {
    const prompt = `
    You are a professional customer support assistant. Generate a helpful, empathetic response to this customer email.
    
    Customer sentiment: ${sentiment}
    Email content: "${emailContent}"
    
    Guidelines:
    - Be professional and friendly
    - Address the customer's specific concern
    - If sentiment is negative, acknowledge their frustration empathetically
    - Provide clear next steps or solutions
    - Keep response concise but complete
    - Use a warm, human tone
    
    Generate the response:
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices.message.content.trim();
  } catch (error) {
    console.error('Response generation error:', error);
    return 'Thank you for contacting our support team. We have received your request and will get back to you shortly with a resolution.';
  }
}

async function extractInformation(text) {
  try {
    const prompt = `
    Extract key information from this customer support email:
    
    "${text}"
    
    Extract and return in JSON format:
    {
      "contactDetails": ["any phone numbers, alternate emails found"],
      "requirements": ["specific requests or problems mentioned"],
      "sentimentIndicators": ["positive or negative words/phrases"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0,
    });

    try {
      return JSON.parse(response.choices.message.content);
    } catch {
      return {
        contactDetails: [],
        requirements: [],
        sentimentIndicators: []
      };
    }
  } catch (error) {
    console.error('Information extraction error:', error);
    return {
      contactDetails: [],
      requirements: [],
      sentimentIndicators: []
    };
  }
}

module.exports = {
  analyzeSentiment,
  detectPriority,
  generateResponse,
  extractInformation
};
