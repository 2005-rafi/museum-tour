import React from 'react';

const VARIANTS = {
  default: 'badge--default',
  gold:    'badge--gold',
  bronze:  'badge--bronze',
  green:   'badge--green',
  red:     'badge--red',
};

function Badge({ children, variant = 'default' }) {
  return (
    <span className={`badge ${VARIANTS[variant] || VARIANTS.default}`}>
      {children}
    </span>
  );
}

export default Badge;
