import { createSlice } from '@reduxjs/toolkit';

const ventasSlice = createSlice({
  name: 'ventas',
  initialState: { data: [] },
  reducers: {
    setVentas(state, action) {
      state.data = action.payload;
    },
    addVenta(state, action) {
      state.data.unshift(action.payload);
    },
    updateVenta(state, action) {
      const id  = action.payload._id || action.payload.id;
      const idx = state.data.findIndex(v => (v._id || v.id) === id);
      if (idx !== -1) state.data[idx] = action.payload;
    },
  },
});

export const { setVentas, addVenta, updateVenta } = ventasSlice.actions;
export default ventasSlice.reducer;
