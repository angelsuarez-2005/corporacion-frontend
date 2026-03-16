import { configureStore } from '@reduxjs/toolkit';
import authReducer  from '../redux/authSlice';
import stockReducer from '../redux/stockSlice';
import ventasReducer from '../redux/ventasSlice';

// Persiste la sesión en localStorage → el refresh no cierra sesión
const saveState = (state) => {
  try { localStorage.setItem('auth', JSON.stringify(state.auth)); } catch {}
};

const loadState = () => {
  try {
    const saved = localStorage.getItem('auth');
    if (saved) return { auth: JSON.parse(saved) };
  } catch {}
  return undefined;
};

const store = configureStore({
  reducer: { auth: authReducer, stock: stockReducer, ventas: ventasReducer },
  preloadedState: loadState(),
});

store.subscribe(() => saveState(store.getState()));

export default store;
