import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

const CATEGORY_COLORS = {
  Food: '#ef4444',
  Utilities: '#3b82f6',
  Entertainment: '#8b5cf6',
  Travel: '#f59e0b',
  Health: '#10b981',
  Education: '#06b6d4',
  Shopping: '#ec4899',
  Miscellaneous: '#6b7280'
};

const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '220px', color: 'var(--text-muted)' }}>
        <p style={{ fontSize: '0.95rem' }}>No expense data for this period.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Add some expenses to see aggregates.</p>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Tooltip formatter
  const renderTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.amount / total) * 100).toFixed(1);
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
            {data.category}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
            {formatCurrency(data.amount)}
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.5rem' }}>
              ({percentage}%)
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1rem', minHeight: '300px' }}>
      <div style={{ position: 'relative', height: '220px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Miscellaneous} 
                  stroke="var(--bg-secondary)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={renderTooltipContent} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Total balance text inside the center of Donut Chart */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '-2px' }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      {/* Customized Legend Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '0.75rem', 
        marginTop: '0.5rem',
        padding: '0 0.5rem',
        maxHeight: '100px',
        overflowY: 'auto'
      }}>
        {data.map((item, index) => {
          const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Miscellaneous;
          const percentage = ((item.amount / total) * 100).toFixed(0);
          return (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.85rem' 
              }}
            >
              <span style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: color,
                flexShrink: 0
              }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.category}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                  ({percentage}%)
                </span>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {formatCurrency(item.amount)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChart;
