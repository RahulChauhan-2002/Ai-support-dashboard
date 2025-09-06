const natural = require('natural');

class AnalysisService {
  constructor() {
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    this.tokenizer = new natural.WordTokenizer();
  }

  analyzeSentiment(text) {
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    const score = this.sentimentAnalyzer.getSentiment(tokens);
    
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  determinePriority(text) {
    const urgentKeywords = [
      'urgent', 'immediately', 'critical', 'emergency', 'asap',
      'cannot access', 'broken', 'down', 'not working', 'failed',
      'crisis', 'severe', 'important', 'priority', 'blocked'
    ];

    const lowerText = text.toLowerCase();
    const isUrgent = urgentKeywords.some(keyword => lowerText.includes(keyword));
    
    return isUrgent ? 'urgent' : 'normal';
  }

  extractInfo(text) {
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    const phoneNumbers = text.match(phoneRegex) || [];
    const alternateEmails = text.match(emailRegex) || [];
    
    // Extract requirements (simplified - can be enhanced with NLP)
    const requirements = this.extractRequirements(text);
    
    // Extract sentiment indicators
    const sentimentIndicators = this.extractSentimentIndicators(text);
    
    return {
      phoneNumbers,
      alternateEmails,
      requirements,
      sentimentIndicators
    };
  }

  extractRequirements(text) {
    const requirementPatterns = [
      /I need .+?[.!?]/gi,
      /I want .+?[.!?]/gi,
      /Please .+?[.!?]/gi,
      /Could you .+?[.!?]/gi,
      /Can you .+?[.!?]/gi
    ];

    const requirements = [];
    requirementPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        requirements.push(...matches);
      }
    });

    return requirements.slice(0, 5); // Limit to 5 requirements
  }

  extractSentimentIndicators(text) {
    const positiveWords = ['thank', 'appreciate', 'great', 'excellent', 'happy', 'satisfied'];
    const negativeWords = ['frustrated', 'angry', 'disappointed', 'terrible', 'horrible', 'upset'];
    
    const indicators = [];
    const lowerText = text.toLowerCase();
    
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        indicators.push(`+${word}`);
      }
    });
    
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) {
        indicators.push(`-${word}`);
      }
    });
    
    return indicators;
  }
}

module.exports = new AnalysisService();