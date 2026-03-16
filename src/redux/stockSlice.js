import { createSlice } from '@reduxjs/toolkit';

const stockSlice = createSlice({
  name: 'stock',
  initialState: { data: {} },   /* vacío — se llena desde la API */
  reducers: {

    /* Carga masiva desde la API: array [{key, categorias}] → objeto */
    setAllStock(state, action) {
      const map = {};
      (action.payload || []).forEach(s => {
        map[s.key] = s.categorias || {};
      });
      state.data = map;
    },

    /* Actualizar una sola categoría de una tienda */
    setStock(state, action) {
      const { key, catId, value } = action.payload;
      if (!state.data[key]) state.data[key] = {};
      state.data[key][catId] = Math.max(0, value);
    },

    /* Descontar 1 cuando se registra una venta */
    decreaseStock(state, action) {
      const { key, catId } = action.payload;
      if (state.data[key] && typeof state.data[key][catId] === 'number') {
        state.data[key][catId] = Math.max(0, state.data[key][catId] - 1);
      }
    },
  },
});

export const { setAllStock, setStock, decreaseStock } = stockSlice.actions;
export default stockSlice.reducer;
