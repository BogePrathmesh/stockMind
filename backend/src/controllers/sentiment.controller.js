import prisma from '../utils/db.js';
import { getStockNews } from '../services/stockData.service.js';
import { analyzeNewsSentiment } from '../services/sentiment.service.js';

// Get sentiment analysis for a stock
export const getStockSentiment = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({ message: 'Symbol is required' });
    }
    
    // Get news for the stock
    const news = await getStockNews(symbol);
    
    // Analyze sentiment
    const analysis = analyzeNewsSentiment(news);
    
    // Save to database
    for (const newsItem of analysis.sentiments) {
      try {
        await prisma.newsSentiment.create({
          data: {
            symbol: symbol.toUpperCase(),
            title: newsItem.title,
            content: newsItem.content || '',
            source: newsItem.source || 'Unknown',
            url: newsItem.url || null,
            sentiment: newsItem.sentiment,
            sentimentScore: newsItem.sentimentScore,
            publishedAt: new Date(newsItem.publishedAt)
          }
        });
      } catch (error) {
        // Ignore duplicate errors
        if (error.code !== 'P2002') {
          console.error('Error saving sentiment:', error);
        }
      }
    }
    
    res.json({
      symbol: symbol.toUpperCase(),
      overall: analysis.overall,
      news: analysis.sentiments
    });
  } catch (error) {
    console.error('Get stock sentiment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get sentiment history
export const getSentimentHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const history = await prisma.newsSentiment.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { publishedAt: 'desc' },
      take: limit
    });
    
    res.json(history);
  } catch (error) {
    console.error('Get sentiment history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

