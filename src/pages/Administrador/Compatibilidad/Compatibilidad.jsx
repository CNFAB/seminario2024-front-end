import React, { useState, useEffect } from 'react';
import compatibilidadService from '../../../services/compatibilidadService';
import { inventarioService } from '../../../services/InventarioService';
import { modeloService } from '../../../services/modeloService';
import styles from './Compatibilidad.module.css';

const Compatibilidad = () => {
  const [compatibilidades, setCompatibilidades] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPieza, setSelectedPieza] = useState(null);

  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPiezas, setExpandedPiezas] = useState({});
  const [searchModelo, setSearchModelo] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [formData, setFormData] = useState({
    id_pieza: '',
    id_modelo: '',
    notas: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(`.${styles.searchableSelect}`)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarCompatibilidades(),
        cargarPiezas(),
        cargarModelos(),
      ]);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarCompatibilidades = async () => {
    try {
      const response = await compatibilidadService.getAll();
      const data = response.data || response || [];
      setCompatibilidades(data);
    } catch (err) {
      console.error('Error cargando compatibilidades:', err);
      setCompatibilidades([]);
    }
  };

  const cargarPiezas = async () => {
    try {
      const response = await inventarioService.obtenerTodas();
      const data = response.data || response || [];
      setPiezas(data);
    } catch (err) {
      console.error('Error cargando piezas:', err);
      setPiezas([]);
    }
  };

  const cargarModelos = async () => {
    try {
      const response = await modeloService.obtenerTodos();
      const data = response.data || response || [];
      setModelos(data);
    } catch (err) {
      console.error('Error cargando modelos:', err);
      setModelos([]);
    }
  };

  const getNombreCategoria = (categoria) => {
    if (!categoria) return '';
    if (typeof categoria === 'string') return categoria;
    if (typeof categoria === 'object') {
      return categoria.nombre || categoria.categoria || categoria.nombre_categoria || '';
    }
    return '';
  };

  // Categorías únicas derivadas de las piezas
  const categoriasUnicas = [...new Set(
    piezas
      .map(p => {
        const categoria = p.categoria || p.categoria_pieza || p.tipo;
        const categoriaNombre = getNombreCategoria(categoria);
        return categoriaNombre;
      })
      .filter(cat => cat && cat !== '' && cat !== 'undefined' && cat !== 'null')
  )].sort();

  // Función para extraer marca como string de forma segura
  const getMarcaString = (modelo) => {
    if (!modelo) return 'Sin marca';
    
    if (modelo.marca) {
      if (typeof modelo.marca === 'object') {
        return modelo.marca.nombre_marca || modelo.marca.marca || 'Sin marca';
      } else if (typeof modelo.marca === 'string') {
        return modelo.marca;
      }
    }
    
    if (modelo.marca_nombre) {
      return modelo.marca_nombre;
    }
    
    return 'Sin marca';
  };

  // Agrupar compatibilidades por pieza
  const agruparPorPieza = () => {
    const grouped = {};
    compatibilidades.forEach(comp => {
      const piezaId = comp.id_pieza;
      if (!grouped[piezaId]) {
        grouped[piezaId] = [];
      }
      const modelo = modelos.find(m => (m.id_modelo === comp.id_modelo || m.id === comp.id_modelo));
      
      grouped[piezaId].push({
        ...comp,
        modelo_nombre: modelo?.nombre_modelo || modelo?.nombre || modelo?.modelo_nombre || `ID: ${comp.id_modelo}`,
        modelo_marca: getMarcaString(modelo),
        modelo_categoria: modelo?.categoria || 'General'
      });
    });
    return grouped;
  };

  const getPiezaById = (id) => {
    return piezas.find(p =>
      String(p.id_pieza || p.id) === String(id)
    );
  };

  const getModelosNoCompatibles = (piezaId) => {
    const modelosCompatiblesIds = compatibilidades
      .filter(c => c.id_pieza === piezaId)
      .map(c => c.id_modelo);
    return modelos.filter(modelo => {
      const modeloId = modelo.id_modelo || modelo.id;
      return !modelosCompatiblesIds.includes(modeloId);
    });
  };

  // Función para obtener modelos filtrados (busca por modelo y marca)
  const getModelosFiltrados = () => {
    const modelosDisponibles = getModelosNoCompatibles(formData.id_pieza);
    if (!searchModelo) return modelosDisponibles;
    
    const searchLower = searchModelo.toLowerCase();
    return modelosDisponibles.filter(modelo => {
      const modeloNombre = (modelo.nombre_modelo || modelo.nombre || modelo.modelo_nombre || '').toLowerCase();
      const marcaString = getMarcaString(modelo).toLowerCase();
      return modeloNombre.includes(searchLower) || marcaString.includes(searchLower);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.id_modelo) {
      errors.id_modelo = 'Debes seleccionar un modelo';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await compatibilidadService.create({
        id_pieza: parseInt(formData.id_pieza),
        id_modelo: parseInt(formData.id_modelo),
        notas: formData.notas
      });

      console.log('📦 Respuesta completa del POST:', response);
      
      if (response?.compatibilidad) {
        setSuccess('✅ Compatibilidad agregada correctamente');
        await cargarCompatibilidades();
        handleCloseModal();
        setExpandedPiezas(prev => ({
          ...prev,
          [formData.id_pieza]: true
        }));
      } else {
        setError(response?.message || 'Error al agregar compatibilidad');
      }
    } catch (err) {
      console.error('❌ Error completo:', err);
      
      if (err.response?.compatibilidad || err.response?.data?.compatibilidad) {
        setSuccess('✅ Compatibilidad agregada correctamente');
        await cargarCompatibilidades();
        handleCloseModal();
      } else {
        setError(err.response?.data?.message || err.message || 'Error al agregar compatibilidad');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (compatibilidad) => {
    const modeloNombre = getModeloNombre(compatibilidad.id_modelo);
    const mensaje = `¿Estás seguro de eliminar la compatibilidad con el modelo "${modeloNombre}"?`;

    if (window.confirm(mensaje)) {
      try {
        setSaving(true);
        await compatibilidadService.delete(compatibilidad.id_compatible);
        
        setSuccess('🗑️ Compatibilidad eliminada correctamente');
        await cargarCompatibilidades();
        
      } catch (err) {
        console.error('❌ Error DELETE:', err);
        setError(err.response?.data?.message || err.message || 'Error al eliminar la compatibilidad');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleAddCompatibility = (pieza) => {
    setSelectedPieza(pieza);
    setFormData({
      id_pieza: pieza.id_pieza || pieza.id,
      id_modelo: '',
      notas: ''
    });
    setSearchModelo('');
    setShowDropdown(false);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setShowModal(false);
    setSelectedPieza(null);
    setFormData({ id_pieza: '', id_modelo: '', notas: '' });
    setSearchModelo('');
    setShowDropdown(false);
    setFormErrors({});
  };

  const toggleExpand = (piezaId) => {
    setExpandedPiezas(prev => ({
      ...prev,
      [piezaId]: !prev[piezaId]
    }));
  };

  const getPiezaNombre = (id) => {
    const pieza = piezas.find(p =>
      Number(p.id_pieza || p.id) === Number(id)
    );
    return pieza?.nombre_pieza || pieza?.nombre || pieza?.descripcion || `ID: ${id}`;
  };

  const getModeloNombre = (id) => {
    const modelo = modelos.find(m => m.id_modelo === id || m.id === id);
    return modelo?.nombre_modelo || modelo?.nombre || modelo?.modelo_nombre || `ID: ${id}`;
  };

  const groupedData = agruparPorPieza();
  const piezasIds = piezas.map(pieza => String(pieza.id_pieza || pieza.id));

  const filteredPiezasIds = piezasIds.filter(piezaId => {
    const pieza = getPiezaById(piezaId);

    if (filtroCategoria) {
      const categoriaRaw = pieza?.categoria || pieza?.categoria_pieza || pieza?.tipo;
      const piezaCat = getNombreCategoria(categoriaRaw);
      if (piezaCat !== filtroCategoria) return false;
    }

    if (searchTerm) {
      const piezaNombre = (pieza?.nombre_pieza || pieza?.nombre || '').toLowerCase();
      const modelosNombres = (groupedData[piezaId] || [])
        .map(m => m.modelo_nombre.toLowerCase())
        .join(' ');
      const searchLower = searchTerm.toLowerCase();
      if (!piezaNombre.includes(searchLower) && !modelosNombres.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className={styles.compatibilidadLoading}>
        <div className={styles.spinner}></div>
        <p>Cargando compatibilidades...</p>
      </div>
    );
  }

  return (
    <div className={styles.compatibilidadContainer}>
      {/* Header */}
      <div className={styles.compatibilidadHeader}>
        <div>
          <h1 className={styles.compatibilidadTitle}>Compatibilidad de Piezas</h1>
          <p className={styles.compatibilidadSubtitle}>
            Gestiona qué modelos son compatibles con cada pieza
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtersContainer}>
        <div className={styles.searchBar}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por pieza o modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {categoriasUnicas.length > 0 && (
          <div className={styles.filterPills}>
            <button
              key="filter-all"
              className={`${styles.filterPill} ${filtroCategoria === '' ? styles.filterPillActive : ''}`}
              onClick={() => setFiltroCategoria('')}
            >
              <i className="fas fa-th"></i>
              Todas
            </button>
            {categoriasUnicas.map((cat, index) => (
              <button
                key={`categoria-${index}-${cat}`}
                className={`${styles.filterPill} ${filtroCategoria === cat ? styles.filterPillActive : ''}`}
                onClick={() => setFiltroCategoria(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {(searchTerm || filtroCategoria) && (
          <p className={styles.resultsCount}>
            <i className="fas fa-filter"></i>
            {filteredPiezasIds.length} resultado(s) encontrado(s)
            <button
              className={styles.clearFilters}
              onClick={() => { setSearchTerm(''); setFiltroCategoria(''); }}
            >
              <i className="fas fa-times"></i>
              Limpiar filtros
            </button>
          </p>
        )}
      </div>

      {/* Toasts */}
      {success && (
        <div className={styles.toastSuccess}>
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className={styles.toastError}>
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Lista de tarjetas */}
      <div className={styles.cardsContainer}>
        {filteredPiezasIds.length === 0 ? (
          <div className={styles.compatibilidadEmpty}>
            <i className="fas fa-link"></i>
            <p>
              {searchTerm || filtroCategoria
                ? `No se encontraron resultados para los filtros aplicados`
                : 'No hay relaciones de compatibilidad registradas'}
            </p>
          </div>
        ) : (
          filteredPiezasIds.map((piezaId, index) => {
            const pieza = getPiezaById(piezaId);
            const modelosCompatibles = groupedData[piezaId] || [];
            const isExpanded = expandedPiezas[piezaId];
            const modelosNoCompatibles = getModelosNoCompatibles(piezaId);
            const tieneModelosNoCompatibles = modelosNoCompatibles.length > 0;
            
            const categoriaRaw = pieza?.categoria || pieza?.categoria_pieza || pieza?.tipo;
            const categoriaNombre = getNombreCategoria(categoriaRaw);

            return (
              <div key={`pieza-card-${piezaId}-${index}`} className={styles.compatibilidadCard}>
                <div className={styles.cardHeader} onClick={() => toggleExpand(piezaId)}>
                  <div className={styles.cardHeaderLeft}>
                    <div className={styles.piezaIcon}>
                      <i className="fas fa-microchip"></i>
                    </div>
                    <div className={styles.piezaInfo}>
                      <h3>{getPiezaNombre(piezaId)}</h3>
                      <div className={styles.piezaStats}>
                        <span className={styles.statBadge}>
                          <i className="fas fa-mobile-alt"></i>
                          {modelosCompatibles.length} modelo(s) compatible(s)
                        </span>
                        {pieza?.stock !== undefined && (
                          <span className={`${styles.statBadge} ${styles.statBadgeStock}`}>
                            <i className="fas fa-boxes"></i>
                            Stock: {pieza.stock}
                          </span>
                        )}
                        {categoriaNombre && categoriaNombre !== '' && (
                          <span className={`${styles.statBadge} ${styles.statBadgeCategoria}`}>
                            <i className="fas fa-tag"></i>
                            {categoriaNombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardHeaderRight}>
                    <button
                      className={styles.btnAddModelo}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCompatibility(pieza || { id_pieza: piezaId });
                      }}
                      disabled={saving || !tieneModelosNoCompatibles}
                      title={!tieneModelosNoCompatibles ? "Ya es compatible con todos los modelos" : "Agregar nuevo modelo compatible"}
                    >
                      <i className="fas fa-plus"></i>
                      Agregar Modelo
                    </button>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ${styles.expandIcon}`}></i>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.cardContent}>
                    <div className={styles.modelosSection}>
                      <div className={styles.sectionTitle}>
                        <i className="fas fa-check-circle"></i>
                        <span>Modelos compatibles</span>
                      </div>
                      {modelosCompatibles.length === 0 ? (
                        <div className={styles.noModelos}>
                          <i className="fas fa-info-circle"></i>
                          <p>No hay modelos compatibles registrados</p>
                          <button
                            className={styles.btnPrimarySmall}
                            onClick={() => handleAddCompatibility(pieza || { id_pieza: piezaId })}
                          >
                            Agregar primer modelo
                          </button>
                        </div>
                      ) : (
                        <div className={styles.modelosList}>
                          {modelosCompatibles.map((comp, compIndex) => (
                            <div key={`modelo-${comp.id_compatibilidad}-${compIndex}`} className={styles.modeloItem}>
                              <div className={styles.modeloIcon}>
                                <i className="fas fa-mobile-alt"></i>
                              </div>
                              <div className={styles.modeloInfo}>
                                <div className={styles.modeloNombre}>
                                  <span className={styles.modeloMarcaBadge}>{comp.modelo_marca}</span>
                                  <strong>{comp.modelo_nombre}</strong>
                                  {comp.notas && (
                                    <span className={styles.modeloNotasBadge} title={comp.notas}>
                                      <i className="fas fa-sticky-note"></i>
                                      Nota
                                    </span>
                                  )}
                                </div>
                                {comp.notas && (
                                  <div className={styles.modeloNotas}>
                                    <i className="fas fa-comment"></i>
                                    <span>{comp.notas}</span>
                                  </div>
                                )}
                              </div>
                              <button
                                className={styles.btnDeleteModelo}
                                onClick={() => handleDelete(comp)}
                                disabled={saving}
                                title="Eliminar compatibilidad"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal para agregar compatibilidad */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={`${styles.modalContent} ${styles.modalContentCompatibilidad}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <i className="fas fa-plus-circle"></i>
                Agregar Modelo Compatible
              </h3>
              <button className={styles.modalClose} onClick={handleCloseModal} disabled={saving}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={`${styles.formGroup} ${styles.infoPieza}`}>
                  <label>Pieza seleccionada:</label>
                  <div className={styles.piezaInfoDisplay}>
                    <i className="fas fa-microchip"></i>
                    <strong>{getPiezaNombre(formData.id_pieza)}</strong>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="id_modelo">
                    Modelo a agregar <span className={styles.required}>*</span>
                  </label>
                  
                  <div className={styles.searchableSelect}>
                    <input
                      type="text"
                      placeholder="Buscar por modelo o marca..."
                      value={searchModelo}
                      onChange={(e) => {
                        setSearchModelo(e.target.value);
                        if (e.target.value === '') {
                          setFormData({ ...formData, id_modelo: '' });
                        }
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        setSearchModelo('');
                        setShowDropdown(true);
                      }}
                      className={styles.searchableSelectInput}
                    />
                    {showDropdown && (
                      <div className={styles.searchableSelectOptions}>
                        {(() => {
                          const modelosFiltrados = getModelosFiltrados();
                          if (modelosFiltrados.length === 0) {
                            return <div className={styles.noResults}>No se encontraron modelos</div>;
                          }
                          return (
                            <>
                              {modelosFiltrados.slice(0, 10).map((modelo) => {
                                const modeloId = modelo.id_modelo || modelo.id;
                                const modeloNombre = modelo.nombre_modelo || modelo.nombre || modelo.modelo_nombre;
                                const marcaString = getMarcaString(modelo);
                                
                                return (
                                  <div
                                    key={`modelo-${modeloId}`}
                                    className={`${styles.searchableSelectOption} ${formData.id_modelo === modeloId ? styles.searchableSelectOptionSelected : ''}`}
                                    onClick={() => {
                                      setFormData({ ...formData, id_modelo: modeloId });
                                      setSearchModelo('');
                                      setShowDropdown(false);
                                    }}
                                  >
                                    <div className={styles.modeloOptionContent}>
                                      <span className={styles.modeloMarca}>{marcaString}</span>
                                      <span className={styles.modeloNombreOption}>{modeloNombre}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              {modelosFiltrados.length > 10 && (
                                <div className={styles.moreResults}>
                                  + {modelosFiltrados.length - 10} modelos más...
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {formData.id_modelo && (
                    <div className={styles.selectedModelo}>
                      <i className="fas fa-check-circle"></i>
                      <span>Modelo seleccionado: </span>
                      <strong>
                        {(() => {
                          const modelo = modelos.find(m => (m.id_modelo === formData.id_modelo) || (m.id === formData.id_modelo));
                          return modelo ? `${getMarcaString(modelo)} ${modelo.nombre_modelo || modelo.nombre || modelo.modelo_nombre}` : '';
                        })()}
                      </strong>
                    </div>
                  )}
                  
                  {formErrors.id_modelo && (
                    <span className={styles.errorMessage}>{formErrors.id_modelo}</span>
                  )}
                  {getModelosNoCompatibles(formData.id_pieza).length === 0 && (
                    <div className={styles.infoMessage}>
                      <i className="fas fa-check-circle"></i>
                      <span>¡Esta pieza ya es compatible con todos los modelos disponibles!</span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="notas">Notas adicionales (opcional)</label>
                  <textarea
                    id="notas"
                    name="notas"
                    rows="3"
                    value={formData.notas}
                    onChange={handleInputChange}
                    placeholder="Ej: Requiere adaptador, solo compatible con ciertas versiones..."
                    disabled={saving}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={handleCloseModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSave} disabled={saving || !formData.id_modelo}>
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Agregar Compatibilidad
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compatibilidad;