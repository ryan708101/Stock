const BarChartVisualization = ({ data, color = 'violet' }) => {
  let chartDataPoints = data;
  if (!chartDataPoints || chartDataPoints.length === 0) {
    // Create placeholder data when none is available
    chartDataPoints = Array.from({ length: 10 }, () => Math.random() * 100);
  }

  const maximumValue = Math.max(...chartDataPoints);
  const minimumValue = Math.min(...chartDataPoints);
  const valueRange = maximumValue - minimumValue || 1;

  const barColorClass = color === 'violet' 
    ? 'bg-gradient-to-t from-violet-600 to-violet-400' 
    : 'bg-slate-600';

  return (
    <div className="flex items-end justify-between h-16 gap-1.5">
      {chartDataPoints.map((dataPoint, dataIndex) => {
        const barHeight = valueRange > 0 ? ((dataPoint - minimumValue) / valueRange) * 100 : 50;
        return (
          <div
            key={dataIndex}
            className={`${barColorClass} rounded-t transition-all duration-300 flex-1 hover:opacity-90 group relative`}
            style={{ height: `${Math.max(barHeight, 15)}%` }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 whitespace-nowrap">
              ${dataPoint.toFixed(0)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BarChartVisualization;

