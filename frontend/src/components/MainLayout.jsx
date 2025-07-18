/*
================================================================================
ARQUIVO: frontend/src/components/MainLayout.jsx (MODIFICADO para Proposta e Contratação)
================================================================================
*/
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Ícones (ADICIONADO HandshakeIcon)
const HomeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const DocumentIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const UserPlusIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 11v6m-3-3h6" /></svg>;
const SettingsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SearchIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const ChartBarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 002 2h2a2 2 0 002-2z" /></svg>;
// NOVO ÍCONE ADICIONADO
const HandshakeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15.5V17m0-1.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 11.5L12 17m0-5.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13 15.5V17m0-1.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15 12h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v3a2 2 0 002 2zM9 12h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 002 2zM7 12H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2z" /></svg>; // <-- NOVO ÍCONE AQUI

const MainLayout = ({ children }) => {
    const { user, logoutUser } = useContext(AuthContext);
    const activeLinkStyle = { backgroundColor: '#374151', color: 'white' };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Menu Lateral */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
                <div className="h-20 flex items-center justify-center bg-gray-900">
                    <h1 className="text-2xl font-bold">Mazzarino</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <NavLink to="/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <HomeIcon /> <span className="ml-4">Dashboard</span>
                    </NavLink>
                    <NavLink to="/documents" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <DocumentIcon /> <span className="ml-4">Casos e Documentos</span>
                    </NavLink>
                    <NavLink to="/new-case" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <UserPlusIcon /> <span className="ml-4">Novo Cliente/Caso</span>
                    </NavLink>
                    <NavLink to="/request-search-service" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <SearchIcon /> <span className="ml-4">Buscar Contrato</span>
                    </NavLink>
                    <NavLink to="/case-analysis" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <ChartBarIcon /> <span className="ml-4">Análise de Casos</span>
                    </NavLink>
                    {/* ADICIONADO: Novo link para Proposta e Contratação */}
                    <NavLink to="/proposal-contract" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg">
                        <HandshakeIcon /> <span className="ml-4">Proposta e Contratação</span> {/* <-- NOVO LINK AQUI */}
                    </NavLink>
                    <NavLink to="#" className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg mt-auto">
                        <SettingsIcon /> <span className="ml-4">Configurações</span>
                    </NavLink>
                </nav>
                <div className="px-2 py-4 border-t border-gray-700">
                    <button onClick={logoutUser} className="w-full flex items-center px-4 py-2.5 text-gray-300 hover:bg-red-600 rounded-lg">
                        <LogoutIcon /> <span className="ml-4">Sair</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="h-20 bg-white shadow-md flex items-center justify-end px-8 flex-shrink-0">
                    <div className="text-right">
                        <p className="font-semibold text-gray-800">{user?.first_name || user?.email}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                </header>
                <div className="flex-1 p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
export default MainLayout;