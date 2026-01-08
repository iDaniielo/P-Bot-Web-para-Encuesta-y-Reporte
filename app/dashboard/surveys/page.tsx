'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, FileText, ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';
import type { Survey, SurveyGroup } from '@/types/database';

interface SurveyWithGroup extends Survey {
  survey_groups?: SurveyGroup | null;
}

export default function SurveysManagementPage() {
  const [surveys, setSurveys] = useState<SurveyWithGroup[]>([]);
  const [groups, setGroups] = useState<SurveyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [isCreatingSurvey, setIsCreatingSurvey] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const [surveyFormData, setSurveyFormData] = useState({
    title: '',
    description: '',
    survey_group_id: '',
    status: 'draft' as 'draft' | 'active' | 'archived',
  });

  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
  });

  // Load surveys and groups
  const fetchData = async () => {
    try {
      setLoading(true);
      const [surveysRes, groupsRes] = await Promise.all([
        fetch('/api/surveys'),
        fetch('/api/survey-groups'),
      ]);

      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveys(surveysData.surveys || []);
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Survey CRUD operations
  const handleCreateSurvey = async () => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la encuesta');
      }

      await fetchData();
      setIsCreatingSurvey(false);
      setSurveyFormData({ title: '', description: '', survey_group_id: '', status: 'draft' });
      showSuccess('✅ Encuesta creada exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateSurvey = async (id: string) => {
    try {
      const response = await fetch('/api/surveys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...surveyFormData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar la encuesta');
      }

      await fetchData();
      setEditingSurveyId(null);
      setSurveyFormData({ title: '', description: '', survey_group_id: '', status: 'draft' });
      showSuccess('✅ Encuesta actualizada exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta encuesta? Se eliminarán todas sus preguntas y respuestas.')) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar la encuesta');
      }

      await fetchData();
      showSuccess('✅ Encuesta eliminada exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Group CRUD operations
  const handleCreateGroup = async () => {
    try {
      const response = await fetch('/api/survey-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el grupo');
      }

      await fetchData();
      setIsCreatingGroup(false);
      setGroupFormData({ name: '', description: '' });
      showSuccess('✅ Grupo creado exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleUpdateGroup = async (id: string) => {
    try {
      const response = await fetch('/api/survey-groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...groupFormData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar el grupo');
      }

      await fetchData();
      setEditingGroupId(null);
      setGroupFormData({ name: '', description: '' });
      showSuccess('✅ Grupo actualizado exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este grupo? Las encuestas no se eliminarán.')) {
      return;
    }

    try {
      const response = await fetch(`/api/survey-groups?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el grupo');
      }

      await fetchData();
      showSuccess('✅ Grupo eliminado exitosamente');
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEditSurvey = (survey: SurveyWithGroup) => {
    setEditingSurveyId(survey.id);
    setSurveyFormData({
      title: survey.title,
      description: survey.description || '',
      survey_group_id: survey.survey_group_id || '',
      status: survey.status,
    });
  };

  const startEditGroup = (group: SurveyGroup) => {
    setEditingGroupId(group.id);
    setGroupFormData({
      name: group.name,
      description: group.description || '',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: 'Borrador',
      active: 'Activa',
      archived: 'Archivada',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Encuestas</h1>
          <p className="text-gray-600 mt-2">Crea y organiza múltiples encuestas</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {successMessage}
          </div>
        )}

        {/* Groups Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Grupos de Encuestas
            </h2>
            <button
              onClick={() => setIsCreatingGroup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Grupo
            </button>
          </div>

          {/* Create Group Form */}
          {isCreatingGroup && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
              <h3 className="font-medium mb-3">Crear Nuevo Grupo</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del grupo"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateGroup}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setGroupFormData({ name: '', description: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Groups List */}
          <div className="space-y-2">
            {groups.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay grupos creados</p>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  {editingGroupId === group.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={groupFormData.name}
                        onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        value={groupFormData.description}
                        onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateGroup(group.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Save className="w-3 h-3" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroupId(null);
                            setGroupFormData({ name: '', description: '' });
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-gray-600">{group.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditGroup(group)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Surveys Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Encuestas
            </h2>
            <button
              onClick={() => setIsCreatingSurvey(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva Encuesta
            </button>
          </div>

          {/* Create Survey Form */}
          {isCreatingSurvey && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-green-200">
              <h3 className="font-medium mb-3">Crear Nueva Encuesta</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Título de la encuesta"
                  value={surveyFormData.title}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={surveyFormData.description}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <select
                  value={surveyFormData.survey_group_id}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, survey_group_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Sin grupo</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <select
                  value={surveyFormData.status}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activa</option>
                  <option value="archived">Archivada</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSurvey}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingSurvey(false);
                      setSurveyFormData({ title: '', description: '', survey_group_id: '', status: 'draft' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Surveys List */}
          <div className="space-y-3">
            {surveys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay encuestas creadas</p>
            ) : (
              surveys.map((survey) => (
                <div key={survey.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  {editingSurveyId === survey.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={surveyFormData.title}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <textarea
                        value={surveyFormData.description}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={2}
                      />
                      <select
                        value={surveyFormData.survey_group_id}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, survey_group_id: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Sin grupo</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={surveyFormData.status}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, status: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="draft">Borrador</option>
                        <option value="active">Activa</option>
                        <option value="archived">Archivada</option>
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateSurvey(survey.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Save className="w-3 h-3" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingSurveyId(null);
                            setSurveyFormData({ title: '', description: '', survey_group_id: '', status: 'draft' });
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                          <X className="w-3 h-3" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{survey.title}</h3>
                          {getStatusBadge(survey.status)}
                        </div>
                        {survey.description && (
                          <p className="text-gray-600 mb-2">{survey.description}</p>
                        )}
                        {survey.survey_groups && (
                          <p className="text-sm text-gray-500">
                            Grupo: {survey.survey_groups.name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditSurvey(survey)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
