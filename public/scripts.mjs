import Greetings from './Greetings.mjs';

ReactDOM.render(
    React.createElement(Greetings, { name : 'David' }),
    document.getElementById('root')
);
