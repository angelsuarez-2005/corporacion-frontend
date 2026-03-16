import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './views/Login';
import { ProtectedRoute } from './views/common/Views';
import Dashboard from './views/Dashboard';
import Consultorio from './views/consultorio/Consultorio';
import Ventas from './views/ventas/Ventas';
import Sedes from './views/sedes/Sedes';
import Reporte from './views/reporte/Reporte';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="sedes"       element={<Sedes />} />
          <Route path="ventas"      element={<Ventas />} />
          <Route path="consultorio" element={<Consultorio />} />
          <Route path="reporte"     element={<Reporte />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}