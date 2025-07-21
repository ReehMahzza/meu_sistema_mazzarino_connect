// frontend/src/components/layout/MainLayout.jsx
import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// CAMINHO CORRIGIDO ABAIXO
import AuthContext from '../../context/AuthContext'; 
import {
  FaTachometerAlt, FaFileAlt, FaBook, FaBriefcase, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

// ADICIONADO: Ícone de Usuários (Contatos)
const FaUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.184-1.268-.5-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.184-1.268.5-1.857m0 0a5.002 5.002 0 019 0m0 0a5 5 0 00-9 0m9 0a5.002 5.002 0 01-4.5 4.95M2 11V9a3 3 0 012.144-2.816M22 11V9a3 3 0 00-2.144-2.816M12 2a3 3 0 013 3v2a3 3 0 01-3 3H9a3 3 0 01-3-3V5a3 3 0 013-3z"/>
  </svg>
);

const MainLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // ATUALIZADO: Lista de navegação com novo item Contatos
  const navItems = [
    { icon: <FaTachometerAlt size={22} />, text: 'Dashboard', path: '/dashboard' },
    { icon: <FaBook size={22} />, text: 'Protocolos', path: '/protocolos' },
    { icon: <FaFileAlt size={22} />, text: 'Ofícios', path: '/oficios' },
    { icon: <FaBriefcase size={22} />, text: 'Processos', path: '/processos' },
    { icon: <FaUsers size={22} />, text: 'Contatos', path: '/contatos' }, 
    { icon: <FaCog size={22} />, text: 'Configurações', path: '/configuracoes' },
  ];

  // ADICIONADO: Estilo para link ativo
  const activeLinkStyle = {
    backgroundColor: '#374151', // bg-gray-700
    color: '#f9fafb', // text-gray-50
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${isExpanded ? 'w-64' : 'w-20'}`}>
        {/* Cabeçalho do Menu */}
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <span className={`font-bold text-2xl transition-opacity duration-200 ${!isExpanded && 'hidden'}`}>MAZZARINO</span>
          <span className={`font-bold text-2xl transition-opacity duration-200 ${isExpanded && 'hidden'}`}>M</span>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.text}
              to={item.path}
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              {item.icon}
              <span className={`ml-4 transition-opacity duration-200 ${!isExpanded && 'opacity-0 hidden'}`}>
                {item.text}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Botão de Logout */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center w-full py-3 px-4 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <FaSignOutAlt size={22} />
            <span className={`ml-4 transition-opacity duration-200 ${!isExpanded && 'opacity-0 hidden'}`}>
              Sair
            </span>
          </button>
        </div>

        {/* Botão de Expandir/Contrair */}
        <div className="flex justify-center p-2 bg-gray-900">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            {isExpanded ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;