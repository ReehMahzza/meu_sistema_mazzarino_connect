/*
================================================================================
ARQUIVO: frontend/src/pages/DashboardPage.jsx (REFATORADO)
================================================================================
*/
import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import MainLayout from '../components/MainLayout';
// ADICIONADO: Imports dos novos componentes de UI
import MessageAlert from '../components/ui/MessageAlert';

function DashboardPage() {
    const { user, axiosInstance } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

        useEffect(() => {
            const fetchDashboardData = async () => {
                try {
                    const response = await axiosInstance.get('/api/dashboard/');
                    setDashboardData(response.data);
                    setLoading(false);
                } catch (err) {
                    console.error("Não foi possível buscar dados do dashboard", err);
                    setError("Não foi possível carregar os dados do dashboard. Por favor, tente novamente.");
                    setLoading(false);
                }
                };

            if (user) { // Só busca dados se o usuário estiver autenticado
                fetchDashboardData();
            } else {
                setLoading(false); // Se não há usuário, não há dados para carregar
                setError("Você não está logado para ver o dashboard.");
            }
        }, [user, axiosInstance]);

            if (loading) {
                return (
                    <MainLayout>
                        <div className="text-center p-8">Carregando dashboard...</div>
                    </MainLayout>
                );
            }

    return (
        <MainLayout>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
            {error && <div className="mb-4"><MessageAlert message={error} type="error" /></div>}
            {dashboardData ? (
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <p className="text-gray-700 text-lg">{dashboardData.message}</p>
                    <p className="text-gray-600">Usuário: {dashboardData.user.email}</p>
                    {/* Adicione mais informações do dashboard aqui */}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                    <p>Nenhum dado do dashboard disponível.</p>
                </div>
            )}
        </MainLayout>
    );
 }

 export default DashboardPage;
        