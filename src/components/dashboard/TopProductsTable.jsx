import PropTypes from "prop-types";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useDashboard } from "../../contexts/dashboard";
import { formatCurrency } from "../../utils/format";

const ProductList = ({ items = [], type }) => {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum produto no período
      </p>
    );
  }

  const queda = type === "decrease";

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li
          key={`${item.product_name}-${item.pharmacy_name}-${index}`}
          className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 transition-smooth hover:bg-muted/70"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={item.product_name}>
              {item.product_name}
            </p>
            <span className="text-xs text-muted-foreground">
              {item.pharmacy_name}
            </span>
          </div>

          <div className="shrink-0 text-right">
            <p className="tabular text-xs text-muted-foreground line-through">
              {formatCurrency(item.previous_price)}
            </p>
            <p className="tabular text-sm font-semibold">
              {formatCurrency(item.current_price)}
            </p>
          </div>

          <span
            className={`tabular flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              queda
                ? "bg-dashboard-success/10 text-dashboard-success"
                : "bg-dashboard-danger/10 text-dashboard-danger"
            }`}
          >
            {queda ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            {Math.abs(Number(item.variation_percent) || 0).toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
};

ProductList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  type: PropTypes.oneOf(["increase", "decrease"]).isRequired,
};

export const TopProductsTable = () => {
  const { topProducts } = useDashboard();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-dashboard-danger" />
            Maiores aumentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList items={topProducts.top_prices_increase} type="increase" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-dashboard-success" />
            Maiores reduções
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductList items={topProducts.top_prices_decrease} type="decrease" />
        </CardContent>
      </Card>
    </div>
  );
};
