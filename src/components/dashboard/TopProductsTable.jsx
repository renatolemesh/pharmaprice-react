import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchTopProductsChanges } from '../../services/Api';  

const response = await fetchTopProductsChanges() ?? {};
const increases = response.top_prices_increase || [];
const decreases = response.top_prices_decrease || [];

const ProductList = ({ items, type }) => (
  <div className="space-y-3">
    {items.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum produto encontrado
      </p>
    ) : (
      items.map((item, index) => (
        <div 
          key={index}
          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-300"
        >
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{item.product_name}</h4>
            <span className="inline-block text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
              {item.pharmacy_name}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs line-through text-muted-foreground">
                R$ {parseFloat(item.previous_price).toFixed(2)}
              </p>
              <p className="font-semibold text-sm">
                R$ {parseFloat(item.current_price).toFixed(2)}
              </p>
            </div>
            
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full ${
              type === 'decrease'
                ? 'bg-dashboard-success/10 text-dashboard-success' 
                : 'bg-dashboard-danger/10 text-dashboard-danger'
            }`}>
              {type === 'decrease' ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="font-semibold text-sm">
                {Math.abs(parseFloat(item.variation_percent))}%
              </span>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

export const TopProductsTable = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Increases Card */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-dashboard-danger" />
            Maiores Aumentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList items={increases} type="increase" />
        </CardContent>
      </Card>

      {/* Decreases Card */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-0 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-dashboard-success" />
            Maiores Reduções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList items={decreases} type="decrease" />
        </CardContent>
      </Card>
    </div>
  );
};