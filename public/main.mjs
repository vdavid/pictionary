import App from './App.mjs';
import ReduxStoreFactory from './ReduxStoreFactory.mjs';
const {Provider} = window.ReactRedux;

const store = ReduxStoreFactory.createStore();

ReactDOM.render(
    React.createElement(Provider, {store},
        React.createElement(App),
    ),
    document.getElementById('app')
);
