import React from 'react';
import Test from './test.js';

export default function Header() {

  return (
    <header className='Header'>
      <h1>Trois</h1>
      <p>
        A React.js implementation and adaptation of <a href='http://asherv.com/threes/'>Threes!</a>, the <a href='https://itunes.apple.com/us/app/threes/id779157948?mt=8'>iOS puzzle game</a>.
      </p>
      <p>
        Created by <a href='https://www.laurennishizaki.com'>Lauren Nishizaki</a>.
      </p>
      <Test />
    </header>
  );
}
