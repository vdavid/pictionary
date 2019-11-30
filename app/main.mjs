const ReactDOM = window.ReactDOM;
import App from './components/App.mjs';
import store from './reduxStore.mjs';
const {Provider} = window.ReactRedux;

ReactDOM.render(
    React.createElement(Provider, {store},
        React.createElement(App),
    ),
    document.getElementById('app')
);
