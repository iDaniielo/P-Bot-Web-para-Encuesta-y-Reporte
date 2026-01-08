'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Archive, CheckCircle2, FileText, Eye, PlusCircle } from 'lucide-react';
import type { Survey, SurveyGroup } from '@/types/database';
import Link from 'next/link';

interface SurveyWithCounts extends Survey {
  survey_groups?: SurveyGroup | null;
  questions_count?: number;
  responses_count?: number;
}

export default function SurveyManager() {
  const [surveys, setSurveys] = useState<SurveyWithCounts[]>([]);
  const [groups, setGroups] = useState<SurveyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all');
  const [formData, setFormData] = useState<Partial<Survey>>({
    title: '',
    description: '',
    slug: '',
    survey_group_id: null,
    status: 'draft',
  });

  useEffect(() => {
    fetchSurveys();
    fetchGroups();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/surveys?includeCounts=true');
      
      if (!response.ok) {
        throw new Error('Error al cargar encuestas');
      }
      
      const data = await response.json();
      setSurveys(data.surveys || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar encuestas');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/survey-groups');
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.title?.trim()) {
        setError('El título es obligatorio');
        return;
      }

      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear encuesta');
      }

      await fetchSurveys();
      setIsCreating(false);
      resetForm();
      showSuccess('✅ Encuesta creada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear encuesta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      if (!formData.title?.trim()) {
        setError('El título es obligatorio');
        return;
      }

      const response = await fetch('/api/surveys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar encuesta');
      }

      await fetchSurveys();
      setEditingId(null);
      resetForm();
      showSuccess('✅ Encuesta actualizada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar encuesta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la encuesta "${title}"?\n\n⚠️ ADVERTENCIA: Esto eliminará todas las preguntas y respuestas asociadas. Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar encuesta');
      }

      await fetchSurveys();
      showSuccess('🗑️ Encuesta eliminada exitosamente');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar encuesta';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleArchive = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'archived' ? 'draft' : 'archived';
    
    try {
      const response = await fetch('/api/surveys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al cambiar estado');
      }

      await fetchSurveys();
      showSuccess(`✅ Encuesta ${newStatus === 'archived' ? 'archivada' : 'desarchivada'}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cambiar estado';
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEdit = (survey: SurveyWithCounts) => {
    setEditingId(survey.id);
    setFormData({
      title: survey.title,
      description: survey.description,
      slug: survey.slug,
      survey_group_id: survey.survey_group_id,
      status: survey.status,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      slug: '',
      survey_group_id: null,
      status: 'draft',
    });
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  };

  // Filter surveys by status
  const filteredSurveys = surveys.filter((survey) => {
    if (filterStatus === 'all') return true;
    return survey.status === filterStatus;
  });

  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivada';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Encuestas</h2>
        <button
          onClick={() => {
            setIsCreating(true);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-bold">Nueva Encuesta</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por estado:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({surveys.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas ({surveys.filter((s) => s.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'draft'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Borradores ({surveys.filter((s) => s.status === 'draft').length})
          </button>
          <button
            onClick={() => setFilterStatus('archived')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'archived'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Archivadas ({surveys.filter((s) => s.status === 'archived').length})
          </button>
        </div>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Nueva Encuesta</h3>
          <SurveyForm
            formData={formData}
            setFormData={setFormData}
            groups={groups}
            onSave={handleCreate}
            onCancel={() => {
              setIsCreating(false);
              resetForm();
            }}
            generateSlug={generateSlug}
            onGroupCreated={fetchGroups}
          />
        </div>
      )}

      {/* Surveys List */}
      <div className="space-y-4">
        {filteredSurveys.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg">No hay encuestas {filterStatus !== 'all' ? `en estado "${getStatusLabel(filterStatus)}"` : ''}</p>
            {filterStatus !== 'all' && (
              <button
                onClick={() => setFilterStatus('all')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Ver todas las encuestas
              </button>
            )}
          </div>
        ) : (
          filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === survey.id ? (
                <SurveyForm
                  formData={formData}
                  setFormData={setFormData}
                  groups={groups}
                  onSave={() => handleUpdate(survey.id)}
                  onCancel={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  generateSlug={generateSlug}
                  onGroupCreated={fetchGroups}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-xl text-gray-900">
                        {survey.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(survey.status)}`}>
                        {getStatusLabel(survey.status)}
                      </span>
                      {survey.survey_groups && (
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                          {survey.survey_groups.name}
                        </span>
                      )}
                    </div>
                    
                    {survey.description && (
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{survey.questions_count || 0} preguntas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{survey.responses_count || 0} respuestas</span>
                      </div>
                      {survey.slug && (
                        <div className="flex items-center gap-1">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                            /encuesta/{survey.slug}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {survey.status === 'active' && survey.slug && (
                      <Link
                        href={`/encuesta/${survey.slug}`}
                        target="_blank"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver encuesta"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    )}
                    <button
                      onClick={() => startEdit(survey)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleArchive(survey.id, survey.status)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                      title={survey.status === 'archived' ? 'Desarchivar' : 'Archivar'}
                    >
                      <Archive className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(survey.id, survey.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Survey Form Component
interface SurveyFormProps {
  formData: Partial<Survey>;
  setFormData: (data: Partial<Survey>) => void;
  groups: SurveyGroup[];
  onSave: () => void;
  onCancel: () => void;
  generateSlug: (title: string) => string;
  onGroupCreated?: () => void;
}

function SurveyForm({
  formData,
  setFormData,
  groups,
  onSave,
  onCancel,
  generateSlug,
  onGroupCreated,
}: SurveyFormProps) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');

  const cancelGroupCreation = () => {
    setIsCreatingGroup(false);
    setNewGroupName('');
    setGroupError('');
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setGroupError('El nombre del grupo es obligatorio');
      return;
    }

    try {
      const response = await fetch('/api/survey-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear grupo');
      }

      const result = await response.json();
      // Set the newly created group as selected
      setFormData({ ...formData, survey_group_id: result.group.id });
      cancelGroupCreation();
      
      // Notify parent to refresh groups
      if (onGroupCreated) {
        try {
          await Promise.resolve(onGroupCreated());
        } catch (refreshError) {
          console.error('Error refreshing groups:', refreshError);
          // Group was created successfully, but list refresh failed
          // The new group is still selected, so this is not critical
        }
      }
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : 'Error al crear grupo');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título * <span className="text-gray-500 text-xs">(máx 200 caracteres)</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => {
              const newTitle = e.target.value;
              setFormData({ 
                ...formData, 
                title: newTitle,
                // Auto-generate slug only if it's empty or hasn't been manually modified
                slug: formData.slug && formData.slug !== generateSlug(formData.title || '') 
                  ? formData.slug 
                  : generateSlug(newTitle)
              });
            }}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            placeholder="Ej: Encuesta de Satisfacción 2026"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.title?.length || 0)}/200 caracteres
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-gray-500 text-xs">(opcional, máx 500 caracteres)</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            maxLength={500}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            placeholder="Breve descripción de la encuesta..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.description?.length || 0)}/500 caracteres
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL) *
            <button
              type="button"
              onClick={() => {
                if (formData.title) {
                  setFormData({ ...formData, slug: generateSlug(formData.title) });
                }
              }}
              className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            >
              🪄 Auto-generar
            </button>
          </label>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
            placeholder="encuesta-satisfaccion-2026"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL: /encuesta/{formData.slug || '[slug]'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo (opcional)
          </label>
          {!isCreatingGroup ? (
            <div className="flex gap-2">
              <select
                value={formData.survey_group_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, survey_group_id: e.target.value || null })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
              >
                <option value="">Sin grupo</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsCreatingGroup(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                title="Crear nuevo grupo"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    setGroupError('');
                  }}
                  placeholder="Nombre del nuevo grupo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  autoFocus
                  aria-label="Nombre del nuevo grupo"
                  aria-describedby={groupError ? 'group-error' : undefined}
                  aria-invalid={!!groupError}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateGroup();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelGroupCreation();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateGroup}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Guardar grupo"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={cancelGroupCreation}
                  className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {groupError && (
                <p id="group-error" className="text-red-500 text-xs" role="alert">
                  {groupError}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={formData.status || 'draft'}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as 'draft' | 'active' | 'archived',
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activa</option>
            <option value="archived">Archivada</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="h-4 w-4" />
          Cancelar
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          Guardar
        </button>
      </div>
    </div>
  );
}
