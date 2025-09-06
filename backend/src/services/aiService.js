const OpenAI = require('openai');
const KnowledgeBase = require('../models/KnowledgeBase');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateResponse(emailData) {
    try {
      // Retrieve relevant knowledge base entries
      const relevantKnowledge = await this.retrieveRelevantKnowledge(emailData.body);
      
      const systemPrompt = `You are a professional customer support assistant. 
      Your responses should be:
      - Professional and friendly
      - Context-aware and empathetic
      - Specific to the customer's needs
      - Include relevant details from our knowledge base when applicable
      
      Knowledge Base Context:
      ${relevantKnowledge.map(k => `Q: ${k.question}\nA: ${k.answer}`).join('\n\n')}
      
      Customer Sentiment: ${emailData.sentiment}
      Priority: ${emailData.priority}`;

      const userPrompt = `Please generate a professional response to this ${emailData.category} email:
      
      Subject: ${emailData.subject}
      From: ${emailData.sender}
      Message: ${emailData.body}
      
      ${emailData.sentiment === 'negative' ? 'Note: The customer seems frustrated. Please acknowledge their frustration empathetically.' : ''}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(emailData);
    }
  }

  async retrieveRelevantKnowledge(query) {
    // Simple keyword matching - in production, use embeddings
    const keywords = query.toLowerCase().split(' ');
    const relevantEntries = await KnowledgeBase.find({
      keywords: { $in: keywords }
    }).limit(3);

    // Update usage statistics
    for (const entry of relevantEntries) {
      entry.metadata.usageCount++;
      entry.metadata.lastUsed = new Date();
      await entry.save();
    }

    return relevantEntries;
  }

  getFallbackResponse(emailData) {
    const templates = {
      support: `Dear Customer,

Thank you for reaching out to our support team. We have received your request and understand the importance of resolving your issue promptly.

Our team is currently reviewing your message and will provide you with a detailed response within 24 hours. 

If this is an urgent matter, please don't hesitate to contact us directly at [support phone number].

Best regards,
Customer Support Team`,

      query: `Dear Customer,

Thank you for your inquiry. We appreciate your interest and are happy to assist you.

We have received your query and our team is working on providing you with the most accurate and helpful information. You can expect a detailed response within the next business day.

If you have any additional questions in the meantime, please feel free to reach out.

Best regards,
Customer Service Team`,

      request: `Dear Customer,

Thank you for your request. We have successfully received it and our team is currently processing it.

We will review your requirements carefully and get back to you with a comprehensive response within 24-48 hours.

We appreciate your patience and look forward to assisting you.

Best regards,
Support Team`,

      help: `Dear Customer,

Thank you for contacting us for assistance. We understand you need help and we're here to support you.

Your message has been received and assigned to our support team. We will review your situation and provide you with the guidance you need as soon as possible.

If this is urgent, please reply to this email with "URGENT" in the subject line.

Best regards,
Help Desk Team`
    };

    return templates[emailData.category] || templates.support;
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      return null;
    }
  }
}

module.exports = new AIService();