import * as React from 'react';

export const Details = ({ children }) => {
  return <ul className="details-container">{children}</ul>;
};

export const DetailItem = ({ children }) => {
  return <li className="details-container__list-item">* {children}</li>;
};
