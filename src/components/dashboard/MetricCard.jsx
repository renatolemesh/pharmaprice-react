import PropTypes from 'prop-types';
import { Card } from '../../components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const MetricCard = ({
  title = 'Metric',
  value = '0',
  change = 0,
  changeType = 'neutral',
  icon = null,
  trend = 'neutral',
  showPercentage = true,
}) => {
  const getTrendColor = () => {
    switch (changeType) {
      case 'increase': return 'text-dashboard-success';
      case 'decrease': return 'text-dashboard-danger';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return null;
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-0 shadow-card hover:shadow-metric transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-dashboard-primary/10 to-dashboard-primary/5">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}{showPercentage ? '%' : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-dashboard-primary to-dashboard-secondary bg-clip-text text-transparent">
          {value}
        </p>
      </div>
    </Card>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['increase', 'decrease', 'neutral']),
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  showPercentage: PropTypes.bool,
};
