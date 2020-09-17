import * as React from 'react';

export const Details = ({ children }) => {
  return (
    <ul
      style={{
        position: 'absolute',
        left: '5px',
        padding: '16px',
        background: '#656565',
        color: 'white',
        width: '300px',
        borderRadius: '4px',
        boxShadow: '5px 5px 5px rgba(0, 0, 0, .5)',
        textAlign: 'left',
        listStyle: 'none',
        margin: 0,
      }}
    >
      {children}
    </ul>
  );
};

export const DetailItem = ({ children }) => {
  return (
    <li
      style={{
        paddingTop: '4px',
        paddingBottom: '4px',
      }}
    >
      * {children}
    </li>
  );
};
