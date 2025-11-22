import natural from 'natural';

// Simple sentiment analysis using natural language processing
export const analyzeSentiment = (text) => {
  try {
    // Tokenize the text
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    
    if (!tokens || tokens.length === 0) {
      return {
        sentiment: 'NEUTRAL',
        score: 0.5,
        confidence: 0
      };
    }

    // Try using SentimentAnalyzer without negation first
    try {
      const analyzer = new natural.SentimentAnalyzer('English', 
        natural.PorterStemmer, 
        []
      );
      
      // Analyze sentiment
      const result = analyzer.getSentiment(tokens);
      
      // Convert score to sentiment type
      // SentimentAnalyzer returns a score typically between -1 and 1
      let sentiment = 'NEUTRAL';
      let confidence = Math.abs(result);
      
      if (result > 0.1) {
        sentiment = 'POSITIVE';
      } else if (result < -0.1) {
        sentiment = 'NEGATIVE';
      }
      
      // Normalize score to 0-1 range (from -1 to 1 range)
      const normalizedScore = (result + 1) / 2;
      
      return {
        sentiment,
        score: parseFloat(normalizedScore.toFixed(3)),
        confidence: parseFloat(confidence.toFixed(3)),
        rawScore: parseFloat(result.toFixed(3))
      };
    } catch (analyzerError) {
      // If SentimentAnalyzer fails, use keyword-based analysis
      console.warn('SentimentAnalyzer failed, using keyword-based analysis:', analyzerError.message);
      return simpleSentimentAnalysis(text);
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Fallback to simple keyword-based sentiment analysis
    return simpleSentimentAnalysis(text);
  }
};

// Fallback simple sentiment analysis using keywords
const simpleSentimentAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'growth', 'profit', 'gain', 'up', 'rise', 'increase', 'strong', 'success', 'win', 'bullish', 'outperform'];
  // Negative keywords
  const negativeWords = ['bad', 'poor', 'negative', 'loss', 'decline', 'down', 'fall', 'drop', 'weak', 'fail', 'bearish', 'underperform', 'crisis', 'crash'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  let sentiment = 'NEUTRAL';
  let score = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'POSITIVE';
    score = 0.5 + Math.min(0.4, (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount) {
    sentiment = 'NEGATIVE';
    score = 0.5 - Math.min(0.4, (negativeCount - positiveCount) * 0.1);
  }
  
  return {
    sentiment,
    score: parseFloat(score.toFixed(3)),
    confidence: parseFloat((Math.abs(positiveCount - negativeCount) * 0.1).toFixed(3)),
    rawScore: parseFloat((score - 0.5).toFixed(3))
  };
};

export const analyzeNewsSentiment = (newsArray) => {
  try {
    const sentiments = newsArray.map(news => {
      const text = `${news.title} ${news.content || ''}`;
      const analysis = analyzeSentiment(text);
      
      return {
        ...news,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.score,
        confidence: analysis.confidence
      };
    });
    
    // Calculate overall sentiment
    const positiveCount = sentiments.filter(s => s.sentiment === 'POSITIVE').length;
    const negativeCount = sentiments.filter(s => s.sentiment === 'NEGATIVE').length;
    const neutralCount = sentiments.filter(s => s.sentiment === 'NEUTRAL').length;
    
    const total = sentiments.length;
    const overallScore = sentiments.reduce((sum, s) => sum + s.sentimentScore, 0) / total;
    
    let overallSentiment = 'NEUTRAL';
    if (positiveCount > negativeCount && overallScore > 0.55) {
      overallSentiment = 'POSITIVE';
    } else if (negativeCount > positiveCount && overallScore < 0.45) {
      overallSentiment = 'NEGATIVE';
    }
    
    return {
      sentiments,
      overall: {
        sentiment: overallSentiment,
        score: parseFloat(overallScore.toFixed(3)),
        positiveCount,
        negativeCount,
        neutralCount,
        total
      }
    };
  } catch (error) {
    console.error('Error analyzing news sentiment:', error);
    throw new Error('Failed to analyze news sentiment');
  }
};

