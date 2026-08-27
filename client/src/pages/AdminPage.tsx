import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { catalog, type Command } from "@/lib/catalog";
import { parseCsv, normalizeImportRecord } from "@/lib/import-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Check, Command as CommandIcon, FileJson, Pencil, Power, Star, Trash2, Upload, X } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AdminPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File>();
  const [editing, setEditing] = useState<string>();
  const [editingName, setEditingName] = useState("");
  const [inactive, setInactive] = useState<string[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [featuredIds, setFeaturedIds] = useState<string[]>(catalog.filter((item) => item.featured).map((item) => item.id));
  const createCommand = trpc.admin.create.useMutation();
  const importCommands = trpc.admin.importCommands.useMutation();
  const updateCommand = trpc.admin.update.useMutation();
  const removeCommand = trpc.admin.remove.useMutation();
  const setFeaturedMutation = trpc.admin.setFeatured.useMutation();
  const deactivate = trpc.admin.deactivate.useMutation();
  const isAdmin = user?.role === "admin";
  const adminList = trpc.admin.list.useQuery({ query: search || undefined, limit: 100 }, { enabled: isAdmin });
  const activeBySlug = useMemo(() => new Map((adminList.data || []).map((row) => [row.slug, row.active] as const)), [adminList.data]);
  const featuredBySlug = useMemo(() => new Map((adminList.data || []).map((row) => [row.slug, row.featured] as const)), [adminList.data]);
  const filtered = useMemo(() => catalog.filter((item) => !removed.includes(item.id) && [item.name, item.command, item.category].join(" ").toLowerCase().includes(search.toLowerCase())).slice(0, 14), [removed, search]);
  if (!user) return <div className="grid min-h-screen place-items-center"><div className="text-center"><h1 className="font-display text-2xl font-semibold">Acesso administrativo</h1><Button onClick={() => startLogin()} className="mt-5">Entrar</Button></div></div>;
  if (!isAdmin) return <div className="grid min-h-screen place-items-center p-5"><div className="text-center"><h1 className="font-display text-2xl font-semibold">Acesso restrito</h1><p className="mt-2 text-sm text-black/50">Esta área está disponível apenas para administradores.</p><Button onClick={() => navigate("/")} className="mt-5">Voltar</Button></div></div>;
  function notify(message: string) { toast(message, { icon: <Check className="h-4 w-4" /> }); }
  async function submitImport() {
    if (!file) { toast("Selecione um arquivo primeiro"); return; }
    try {
      const raw = await file.text();
      const format = file.name.toLowerCase().endsWith(".csv") ? "csv" as const : "json" as const;
      const parsed = format === "csv" ? parseCsv(raw) : (Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : JSON.parse(raw).commands || []);
      const normalized = parsed.map(normalizeImportRecord);
      const unique = new Set<string>();
      const duplicate = normalized.some((item: ReturnType<typeof normalizeImportRecord>) => { if (unique.has(item.slug)) return true; unique.add(item.slug); return false; });
      if (!normalized.length || normalized.some((item: ReturnType<typeof normalizeImportRecord>) => !item.slug || !item.slashCommand || !item.name || !item.description || !["PENSAR", "ESCREVER", "CRIAR", "CRESCER"].includes(item.category)) || duplicate) throw new Error("schema");
      const result = await importCommands.mutateAsync({ filename: file.name, format, commands: normalized as never });
      if (result.conflicts.length) toast(`${result.importedCount} importados; ${result.conflicts.length} conflitos`, { description: result.conflicts.slice(0, 2).join(" · ") }); else notify(`${result.importedCount} comandos importados`);
      setFile(undefined); setFileName("");
    } catch { toast("Arquivo inválido", { description: "Use JSON em lista ou CSV com cabeçalho e slugs únicos." }); }
  }
  return <div className="min-h-screen bg-[#fbfbfd]"><header className="border-b border-black/[0.06] bg-white"><div className="container flex h-16 items-center justify-between"><button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-black/55"><ArrowLeft className="h-4 w-4" /> Catálogo</button><span className="flex items-center gap-2 font-display font-semibold"><CommandIcon className="h-4 w-4" /> Admin Console</span><Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">ADMIN</Badge></div></header><main className="container py-12"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Governança do catálogo</p><h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.05em]">Mantenha os comandos em movimento.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-black/50">Crie, revise, destaque, desative ou importe comandos sem sair do centro de operações.</p></div><div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><section className="rounded-3xl border border-black/[0.08] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold">Catálogo</h2><Badge variant="outline">{catalog.length - removed.length} itens</Badge></div><Input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-5 h-11 rounded-xl border-black/10" placeholder="Pesquisar por nome, comando ou área..." /><div className="mt-4 divide-y divide-black/[0.06]">{filtered.map((item) => { const isFeatured = featuredBySlug.get(item.id) ?? featuredIds.includes(item.id); const isActive = activeBySlug.get(item.id) ?? !inactive.includes(item.id); const isEditing = editing === item.id; return <div key={item.id} className="py-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0">{isEditing ? <div className="flex gap-2"><Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="h-9" /><Button size="icon" className="h-9 w-9" onClick={async () => { await updateCommand.mutateAsync({ slug: item.id, data: { name: editingName } }); notify("Comando atualizado"); setEditing(undefined); }}><Check className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditing(undefined)}><X className="h-4 w-4" /></Button></div> : <><span className="font-mono text-xs text-violet-600">{item.command}</span><p className="truncate text-sm font-medium">{item.name}</p></>} </div><div className="flex shrink-0 items-center gap-1"><Badge variant="outline" className="hidden text-[10px] sm:inline-flex">{item.category}</Badge><button title="Editar nome" onClick={() => { setEditing(item.id); setEditingName(item.name); }} className="rounded-lg p-2 text-black/35 hover:bg-violet-50 hover:text-violet-700"><Pencil className="h-3.5 w-3.5" /></button><button title={isFeatured ? "Remover destaque" : "Destacar"} onClick={async () => { const next = !isFeatured; setFeaturedIds(next ? [...featuredIds, item.id] : featuredIds.filter((id) => id !== item.id)); await setFeaturedMutation.mutateAsync({ slug: item.id, featured: next }); }} className={`rounded-lg p-2 ${isFeatured ? "text-amber-500" : "text-black/25 hover:text-amber-500"}`}><Star className={`h-3.5 w-3.5 ${isFeatured ? "fill-current" : ""}`} /></button><button title={isActive ? "Desativar" : "Reativar"} onClick={async () => { const next = !isActive; setInactive(next ? inactive.filter((id) => id !== item.id) : [...inactive, item.id]); await deactivate.mutateAsync({ slug: item.id, active: next }); notify(next ? "Comando reativado" : "Comando desativado"); }} className={`rounded-lg p-2 ${isActive ? "text-black/25 hover:bg-amber-50 hover:text-amber-600" : "text-emerald-600 hover:bg-emerald-50"}`}><Power className="h-3.5 w-3.5" /></button><button title="Excluir definitivamente" onClick={async () => { if (!window.confirm(`Excluir ${item.command}?`)) return; await removeCommand.mutateAsync({ slug: item.id }); setRemoved([...removed, item.id]); notify("Comando excluído"); }} className="rounded-lg p-2 text-black/25 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button></div></div></div>; })}</div></section><section className="rounded-3xl bg-[#17151f] p-5 text-white"><FileJson className="h-7 w-7 text-violet-300" /><h2 className="font-display mt-6 text-xl font-semibold">Importar catálogo</h2><p className="mt-2 text-sm leading-6 text-white/50">Validação de estrutura, slugs duplicados e parser CSV com suporte a campos entre aspas.</p><div className="mt-6 space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs font-semibold text-white/70">Novo comando</p><div className="grid gap-2 sm:grid-cols-2"><Input value={newSlug} onChange={(e) => setNewSlug(e.target.value.replace(/\s+/g, "-").toLowerCase())} className="border-white/10 bg-white/10 text-white placeholder:text-white/35" placeholder="slug-do-comando" /><Input value={newName} onChange={(e) => setNewName(e.target.value)} className="border-white/10 bg-white/10 text-white placeholder:text-white/35" placeholder="Nome do comando" /></div><Button onClick={async () => { if (!newSlug || !newName) { toast("Preencha slug e nome"); return; } await createCommand.mutateAsync({ slug: newSlug, slashCommand: `/${newSlug}`, name: newName, description: `Comando personalizado: ${newName}.`, category: "PENSAR", subcategory: "Importado", objective: "Criar", outputType: "Texto", platform: "Multiplataforma", promptTemplate: `Atue como especialista e execute /${newSlug} para {contexto}, com objetivo {objetivo}.`, tags: "personalizado", difficulty: "Intermediário", featured: false }); notify("Comando criado"); setNewSlug(""); setNewName(""); }} className="h-9 w-full bg-white text-[#17151f] hover:bg-violet-100">Criar comando</Button></div><label className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-8 text-sm text-white/65 hover:border-violet-300 hover:text-white"><Upload className="h-4 w-4" />{fileName || "Selecionar arquivo"}<input type="file" accept=".json,.csv,application/json,text/csv" className="hidden" onChange={(e) => { const picked = e.target.files?.[0]; setFile(picked); setFileName(picked?.name || ""); }} /></label><Button onClick={submitImport} disabled={importCommands.isPending} className="mt-4 h-11 w-full rounded-xl bg-violet-500 hover:bg-violet-400">{importCommands.isPending ? "Importando..." : "Validar e importar"}</Button></section></div></main></div>;
}
