'use client'
import { makeStore } from '@/store/store';
import { Provider } from 'react-redux';
const StoreProvider = ({ children, initialReduxState }) => {
    const store = makeStore(initialReduxState);
    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
};

export default StoreProvider;