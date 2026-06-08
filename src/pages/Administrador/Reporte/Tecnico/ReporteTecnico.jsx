// ReporteTecnicos.jsx
import React, { useState } from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import ReporteDiagnosticos from './ReporteDiagnosticos';
import ReporteReparaciones from './ReporteReparaciones';

const ReporteTecnicos = () => {
    const [activeTab, setActiveTab] = useState('diagnosticos');

    return (
        <div className="p-3">
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
            >
                <Tab 
                    eventKey="diagnosticos" 
                    title={
                        <span>
                            <i className="fas fa-stethoscope me-2"></i>
                            Diagnósticos
                        </span>
                    }
                >
                    <ReporteDiagnosticos />
                </Tab>
                
                <Tab 
                    eventKey="reparaciones" 
                    title={
                        <span>
                            <i className="fas fa-wrench me-2"></i>
                            Reparaciones
                        </span>
                    }
                >
                    <ReporteReparaciones />
                </Tab>
            </Tabs>
        </div>
    );
};

export default ReporteTecnicos;