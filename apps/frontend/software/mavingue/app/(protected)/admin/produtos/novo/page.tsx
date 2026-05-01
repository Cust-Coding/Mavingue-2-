"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { productsApi } from "@/features/products/api";
import { getErrorMessage } from "@/lib/errors";
import { 
  Package, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  X,
  Loader2
} from "lucide-react";

export default function NovoProduto() {
  const [form, setForm] = useState({ name: "", description: "", price: "", urlImg: "" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validacao arquivo
    if (!file.type.startsWith('image/')) {
      setErr("Por favor, selecione um arquivo de imagem válido.");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErr("A imagem/foto deve ter no máximo 5Mb, nada fora disso é permitido.");
      return;
    }
    
    setErr("");
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/proxy/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setForm((current) => ({ ...current, urlImg: data.url }));
      } else {
        setErr(data.error || 'Falha no upload da imagem');
      }
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Não foi possível carregar a imagem"));
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.name.trim()) {
      setErr("O nome do produto é obrigatório.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      setErr("Por favor, insira um preço válido.");
      return;
    }

    try {
      await productsApi.create({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        urlImg: form.urlImg,
      });
      setOk("Produto criado com sucesso!");
      setForm({ name: "", description: "", price: "", urlImg: "" });
      // Limpar o campo de arquivo
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (reason: unknown) {
      setErr(getErrorMessage(reason, "Erro ao criar produto"));
    }
  }

  const removeImage = () => {
    setForm({ ...form, urlImg: "" });
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const triggerFileUpload = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Novo Produto</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 shadow-sm mb-6 ">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Package className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Novo Produto!!</h1>
            <p className="text-sm text-slate-500">Adicione um novo produto ao catálogo</p>
          </div>
        </div>
      </div>

      {/* Msg */}
      {err && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{err}</span>
        </div>
      )}
      
      {ok && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{ok}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-md font-semibold text-slate-800">Informações do produto</h2>
          <p className="text-xs text-slate-400 mt-1">Preencha os dados abaixo</p>
        </div>

        <div className="p-5 space-y-4">
          {/* NomeP */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Ex.: Cimento Portland 50kg"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Describ */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              placeholder="Descrição detalhada do produto..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-24 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Preco */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preço (MT) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full"
            />
          </div>

          {/* foto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Imagem do produto</label>
            <div 
              onClick={triggerFileUpload}
              className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 hover:bg-slate-100 transition cursor-pointer"
            >
              <div className="text-center">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-2" />
                    <p className="text-xs text-slate-500">A enviar imagem...</p>
                  </div>
                ) : form.urlImg ? (
                  <div className="relative inline-block">
                    <img
                      src={form.urlImg}
                      alt="Preview"
                      className="max-w-[200px] max-h-[150px] rounded-lg border border-slate-200 object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="text-green-600 hover:text-orange-700">
                        Clique para enviar
                      </span>
                      <p className="mt-1 text-xs text-slate-400">Só PNG, JPG até 5MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setForm({ name: "", description: "", price: "", urlImg: "" });
              setErr("");
              setOk("");
              const fileInput = document.getElementById('file-upload') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }}
          >
            Desfazer
          </Button>
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            Criar Produto
          </Button>
        </div>
      </form>
    </div>
  );
}