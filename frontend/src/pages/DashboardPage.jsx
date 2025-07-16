/*
================================================================================
ARQUIVO: frontend/src/pages/DashboardPage.jsx (MODIFICADO)
================================================================================
Agora usa o MainLayout para evitar repetição de código.
*/
import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout'; // ADICIONADO

function DashboardPage() {
    const { axiosInstance, logoutUser } = useContext(AuthContext);
    const [dashboardMessage, setDashboardMessage] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axiosInstance.get('/api/dashboard/');
                setDashboardMessage(response.data.message);
            } catch (error) {
                console.error("Não foi possível buscar dados do dashboard", error);
                if (error.response && error.response.status === 401) logoutUser();
            }
        };
        fetchDashboardData();
    }, [axiosInstance, logoutUser]); // Adicionado axiosInstance e logoutUser como dependências

    return (
        <MainLayout> {/* Agora usa o MainLayout */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-700">{dashboardMessage || "Carregando..."}</p>
            </div>
        </MainLayout>
    );
}

export default DashboardPage;