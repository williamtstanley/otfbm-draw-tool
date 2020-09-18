import * as React from 'react';
import classnames from 'classnames';

export const Button = ({active, className, ...props}) => {
  return <button className={classnames('button-base', className, {active})} {...props}/>
}
