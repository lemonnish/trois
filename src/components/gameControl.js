import React from 'react';
import Icon from './icon.js';

export default function GameControl(props) {
  const direction = ['up', 'right', 'down', 'left'];
  const shortcut = ['W', 'D', 'S', 'A'];
  const featherName = ['arrow-up', 'arrow-right', 'arrow-down', 'arrow-left'];
  const keyboardShortcut = ((dir) => {
    if (props.showKeyboardShortcuts) {
      return (
        <span className='keyboardShortcut'>
          {shortcut[dir]}
        </span>
      )
    } else { return null }
  });

  return (
    <div className='GameControl'>
      {direction.map((dir, i) => (
        <button className={dir}
                onClick={() => props.onClick(dir)}
                disabled={props.possibleMove[dir]===null}
                title={'Move tiles ' + dir}
                key={dir}>
          {Icon(featherName[i])}
          {keyboardShortcut(i)}
        </button>
      ))}
    </div>
  )
}
