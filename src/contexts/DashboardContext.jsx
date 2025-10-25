import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  fetchStatistics, 
  fetchPharmacyStats, 
  fetchTopProductsChanges,
  fetchTrendsData 
} from '../services/Api';

const DashboardContext = createContext(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    statistics: {},
    pharmacyStats: [],
    topProducts: {
      top_prices_increase: [],
      top_prices_decrease: []
    },
    trends: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel for better performance
        const [statisticsRes, pharmacyStatsRes, topProductsRes, trendsRes] = await Promise.all([
          fetchStatistics().catch(err => ({ data: {}, error: err })),
          fetchPharmacyStats().catch(err => ({ data: [], error: err })),
          fetchTopProductsChanges().catch(err => ({ 
            top_prices_increase: [], 
            top_prices_decrease: [],
            error: err 
          })),
          fetchTrendsData().catch(err => ({ data: [], error: err }))
        ]);

        setData({
          statistics: statisticsRes?.data || {},
          pharmacyStats: pharmacyStatsRes?.data || [],
          topProducts: {
            top_prices_increase: topProductsRes?.top_prices_increase || [],
            top_prices_decrease: topProductsRes?.top_prices_decrease || []
          },
          trends: trendsRes?.data || []
        });
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const refresh = async () => {
    await loadDashboardData();
  };

  return (
    <DashboardContext.Provider value={{ ...data, loading, error, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.propTypes = {
  children: PropTypes.node.isRequired
};