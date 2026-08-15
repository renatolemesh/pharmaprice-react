import PropTypes from "prop-types";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`gradient-card rounded-card border border-border/70 text-card-foreground shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={`px-5 pt-5 pb-3 sm:px-6 sm:pt-6 ${className}`}>{children}</div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h2 className={`text-base font-semibold tracking-tight sm:text-lg ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ children }) {
  return <p className="mt-1 text-sm text-muted-foreground">{children}</p>;
}

export function CardContent({ className = "", children }) {
  return <div className={`px-5 pb-5 sm:px-6 sm:pb-6 ${className}`}>{children}</div>;
}

const nodeProps = {
  className: PropTypes.string,
  children: PropTypes.node,
};

Card.propTypes = nodeProps;
CardHeader.propTypes = nodeProps;
CardTitle.propTypes = nodeProps;
CardDescription.propTypes = { children: PropTypes.node };
CardContent.propTypes = nodeProps;
