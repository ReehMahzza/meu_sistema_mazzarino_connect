// frontend/src/components/layout/MainLayout.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// CAMINHO CORRIGIDO ABAIXO
import AuthContext from '../../context/AuthContext'; 
import {
  FaTachometerAlt, FaFileAlt, FaBook, FaBriefcase, FaCog, FaSignOutAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const MainLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    { icon: <FaTachometerAlt size={22} />, text: 'Dashboard', path: '/dashboard' },
    { icon: <FaFileAlt size={22} />, text: 'Protocolos', path: '/protocolos' },
    { icon: <FaBook size={22} />, text: 'Ofícios', path: '/oficios' },
    { icon: <FaBriefcase size={22} />, text: 'Processos', path: '/processos' },
    { icon: <FaCog size={22} />, text: 'Configurações', path: '/configuracoes' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`bg-gray-800 text-white flex flex-col transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <span className={`font-bold text-2xl ${!isExpanded && 'hidden'}`}>MAZZARINO</span>
          <span className={`font-bold text-2xl ${isExpanded && 'hidden'}`}>M</span>
        </div>
        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <li key={item.text} className="my-2">
                <Link to={item.path} className="flex items-center py-3 px-6 hover:bg-gray-700 transition-colors duration-200">
                  {item.icon}
                  <span className={`ml-4 transition-opacity duration-200 ${!isExpanded && 'opacity-0 hidden'}`}>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="flex items-center w-full py-3 px-6 hover:bg-gray-700 transition-colors duration-200">
                <FaSignOutAlt size={22} />
                <span className={`ml-4 transition-opacity duration-200 ${!isExpanded && 'opacity-0 hidden'}`}>Sair</span>
            </button>
        </div>
        <div className="flex justify-end p-2 bg-gray-900">
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full hover:bg-gray-700">
                {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
            </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;