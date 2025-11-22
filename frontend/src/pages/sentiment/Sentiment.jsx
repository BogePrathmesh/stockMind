import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Sentiment() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symbol.trim()) {
      toast.error('Please enter a stock symbol');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/sentiment/${symbol}`);
      setSentimentData(res.data);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      toast.error('Failed to analyze sentiment');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-600';
      case 'NEGATIVE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'NEGATIVE':
        return <TrendingDown className="w-6 h-6 text-red-600" />;
      default:
        return <Minus className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Sentiment Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze news sentiment for any stock to understand market perception
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <form onSubmit={handleAnalyze} className="flex gap-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., TCS, RELIANCE)"
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>

      {sentimentData && (
        <>
          {/* Overall Sentiment */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Overall Sentiment for {sentimentData.symbol}</h2>
            <div className="flex items-center gap-4">
              {getSentimentIcon(sentimentData.overall.sentiment)}
              <div>
                <p className={`text-2xl font-bold ${getSentimentColor(sentimentData.overall.sentiment)}`}>
                  {sentimentData.overall.sentiment}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {(sentimentData.overall.score * 100).toFixed(1)}%
                </p>
              </div>
              <div className="ml-auto flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{sentimentData.overall.positiveCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Positive</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{sentimentData.overall.neutralCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Neutral</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{sentimentData.overall.negativeCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Negative</p>
                </div>
              </div>
            </div>
          </div>

          {/* News Articles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">News Articles</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sentimentData.news.map((article, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(article.sentiment)}
                        <span className={`text-sm font-medium ${getSentimentColor(article.sentiment)}`}>
                          {article.sentiment}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(article.sentimentScore * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{article.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{article.source}</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

