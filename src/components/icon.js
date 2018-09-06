import React from 'react';

export default function Icon(iconName, optClass) {
  const className = (optClass === undefined) ? 'Icon' : ('Icon ' + optClass);
  const pathName = '/static/feather-sprite.svg#' + iconName;
  return (
    <svg className={className}>
      <use xlinkHref={pathName}/>
    </svg>
  )
}
