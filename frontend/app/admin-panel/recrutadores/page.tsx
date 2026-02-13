'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import recruiterService from '@/services/recruiterService';
import companyService from '@/services/companyService';
import { Recruiter, Company } from '@/types';
import { PencilSquare, Trash, PersonPlus, Check2, X as XIcon } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';
import { confirmDialog } from '@/lib/confirmDialog';

export default function RecrutadoresPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
    company: '' as string,
    is_staff: false,
    is_active: true,
  });

  // Guard: redirect non-superusers
  useEffect(() => {
    if (user && !user.is_superuser) {
      router.push('/admin-panel');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recruitersData, companiesData] = await Promise.all([
          recruiterService.getRecruiters(),
          companyService.getAllCompanies(),
        ]);
        setRecruiters(Array.isArray(recruitersData) ? recruitersData : []);
        setCompanies(companiesData);
      } catch {
        setError('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRecruiter(null);
    setFormData({
      name: '',
      last_name: '',
      email: '',
      password: '',
      company: '',
      is_staff: false,
      is_active: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setFormData({
      name: recruiter.name,
      last_name: recruiter.last_name || '',
      email: recruiter.email,
      password: '',
      company: recruiter.company ? String(recruiter.company) : '',
      is_staff: recruiter.is_staff,
      is_active: recruiter.is_active,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (editingRecruiter) {
        // Update
        const updateData: Record<string, unknown> = {
          name: formData.name,
          last_name: formData.last_name,
          company: formData.company ? Number(formData.company) : null,
          is_staff: formData.is_staff,
          is_active: formData.is_active,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        const updated = await recruiterService.updateRecruiter(editingRecruiter.id, updateData);
        setRecruiters(prev => prev.map(r => r.id === updated.id ? updated : r));
        toast.success('Recrutador atualizado com sucesso!');
      } else {
        // Create
        const created = await recruiterService.createRecruiter({
          name: formData.name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          company: formData.company ? Number(formData.company) : undefined,
          is_staff: formData.is_staff,
        });
        setRecruiters(prev => [created, ...prev]);
        toast.success('Recrutador criado com sucesso!');
      }
      setShowModal(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      if (axiosErr.response?.data) {
        const errors: Record<string, string> = {};
        Object.entries(axiosErr.response.data).forEach(([key, value]) => {
          errors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFormErrors(errors);
      } else {
        toast.error('Erro ao salvar recrutador');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recruiter: Recruiter) => {
    if (!(await confirmDialog(`Tem certeza que deseja excluir o recrutador "${recruiter.name}"?`))) {
      return;
    }
    try {
      await recruiterService.deleteRecruiter(recruiter.id);
      setRecruiters(prev => prev.filter(r => r.id !== recruiter.id));
      toast.success('Recrutador excluído com sucesso!');
    } catch {
      toast.error('Erro ao excluir recrutador');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCompanyName = (companyId: number | null) => {
    if (!companyId) return '—';
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : `ID: ${companyId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Carregando recrutadores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Recrutadores</h1>
          <p className="text-slate-500 mt-1">
            {recruiters.length} recrutador(es) cadastrado(s)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          <PersonPlus className="h-4 w-4" />
          <span>Novo Recrutador</span>
        </button>
      </div>

      {/* Table */}
      {recruiters.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhum recrutador cadastrado</p>
          <button
            onClick={openCreateModal}
            className="text-sky-600 hover:text-sky-500 mt-2 inline-block"
          >
            Criar primeiro recrutador &rarr;
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Staff
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recruiters.map((recruiter) => (
                  <tr key={recruiter.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {recruiter.name} {recruiter.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {recruiter.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {recruiter.company_name || getCompanyName(recruiter.company)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          recruiter.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {recruiter.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {recruiter.is_staff ? (
                        <Check2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(recruiter.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openEditModal(recruiter)}
                          className="text-sky-600 hover:text-sky-800 transition-colors"
                          title="Editar"
                        >
                          <PencilSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(recruiter)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingRecruiter ? 'Editar Recrutador' : 'Novo Recrutador'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome
                    <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Ex: Maria"
                  />
                  <p className="text-xs text-slate-400 mt-1">Primeiro nome do recrutador</p>
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sobrenome
                    <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                    placeholder="Ex: Silva"
                  />
                  <p className="text-xs text-slate-400 mt-1">Sobrenome completo</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                  {!editingRecruiter && (
                    <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingRecruiter}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none ${
                    editingRecruiter ? 'bg-slate-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Ex: maria.silva@empresa.com"
                />
                <p className="text-xs text-slate-400 mt-1">
                  {editingRecruiter ? 'O email não pode ser alterado' : 'Email corporativo para login no sistema'}
                </p>
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Senha
                  {editingRecruiter ? (
                    <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
                  ) : (
                    <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
                  )}
                </label>
                <input
                  type="password"
                  required={!editingRecruiter}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                  placeholder={editingRecruiter ? 'Nova senha (opcional)' : 'Crie uma senha segura'}
                />
                <p className="text-xs text-slate-400 mt-1">
                  {editingRecruiter
                    ? 'Preencha apenas se quiser alterar a senha atual'
                    : 'Mínimo 8 caracteres'}
                </p>
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Empresa
                  <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                >
                  <option value="">Sem empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={String(company.id)}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Selecione a empresa que o recrutador irá gerenciar</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_staff}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_staff: e.target.checked }))}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-slate-700">
                      Staff
                      <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
                    </span>
                  </label>
                  <p className="text-xs text-slate-400 mt-1 ml-6">Permite acesso ao painel administrativo do Django</p>
                </div>

                {editingRecruiter && (
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm text-slate-700">
                        Ativo
                        <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
                      </span>
                    </label>
                    <p className="text-xs text-slate-400 mt-1 ml-6">Desmarque para bloquear o acesso deste recrutador</p>
                  </div>
                )}
              </div>

              {formErrors.non_field_errors && (
                <p className="text-red-500 text-sm">{formErrors.non_field_errors}</p>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingRecruiter ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
