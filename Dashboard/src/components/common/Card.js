import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  className = '',
  padding = true,
  bordered = false,
  shadow = true,
  rounded = true,
  hover = true,
  onClick,
  ...props
}) => {
  // Build class names
  const cardClasses = [
    'bg-white',
    rounded ? 'rounded-xl' : '',
    bordered ? 'border border-gray-200' : '',
    shadow ? 'shadow-card' : '',
    hover ? 'transition-shadow duration-300 ease-in-out hover:shadow-card-hover' : '',
    padding ? 'p-6' : '',
    onClick ? 'cursor-pointer' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className={`flex items-center justify-between ${padding ? 'mb-4' : 'p-6 pb-0'}`}>
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      <div className={!padding && (title || subtitle || headerAction) ? 'p-6 pt-4' : ''}>
        {children}
      </div>
      
      {footer && (
        <div className={padding ? 'mt-4 pt-4 border-t border-gray-100' : 'p-6 pt-4 border-t border-gray-100'}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;