// frontend/src/components/cases/CaseTabs.jsx
import React from 'react';

function CaseTabs({ activeTab, setActiveTab }) { // Recebe props
    const tabs = ['Andamentos', 'Documentos', 'Financeiro', 'Resumo do Protocolo', 'Comunicação'];

    const activeTabClass = "border-blue-500 text-blue-600";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)} // Chama a função do prop
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab ? activeTabClass : inactiveTabClass}`} // Usa o prop para estilização
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default CaseTabs;