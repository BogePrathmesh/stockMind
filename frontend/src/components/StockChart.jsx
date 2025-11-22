import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function StockChart({ data, symbol }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Detect dark mode
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#0F1921' : 'white';
    const textColor = isDark ? '#e5e7eb' : '#333';
    const gridColor = isDark ? '#374151' : '#f0f0f0';

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Format data for lightweight-charts
    const formattedData = data.map(item => ({
      time: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    candlestickSeries.setData(formattedData);

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a26',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = data.map(item => ({
      time: item.date,
      value: item.volume,
      color: item.close >= item.open ? '#26a69a80' : '#ef535080',
    }));

    volumeSeries.setData(volumeData);

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, symbol]);

  // Update chart theme when dark mode changes
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const bgColor = isDark ? '#0F1921' : 'white';
    const textColor = isDark ? '#e5e7eb' : '#333';
    const gridColor = isDark ? '#374151' : '#f0f0f0';

    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
    });
  }, [data]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">{symbol} - Price Chart</h3>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

