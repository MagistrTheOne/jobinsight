"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  DollarSign,
  User,
  Edit,
  Edit3,
  Trash2,
  Star,
  StarOff,
  Plus,
  Save,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResumeVersion {
  id: string;
  title: string;
  content: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export function JobSeekerProfile() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState("");
  const [salaryExpectation, setSalaryExpectation] = useState("");
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [editingResume, setEditingResume] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [renamingResume, setRenamingResume] = useState<string | null>(null);
  const [newResumeName, setNewResumeName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  // Горячие клавиши: F2 — переименование, Ctrl+S — сохранение
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2" && !renamingResume) {
        e.preventDefault();
        const first = resumes[0];
        if (first) startRenaming(first.id, first.title);
      } else if (e.key === "Escape" && renamingResume) {
        setRenamingResume(null);
        setNewResumeName("");
      } else if (e.key === "Enter" && renamingResume) {
        e.preventDefault();
        handleRenameResume(renamingResume);
      } else if (e.ctrlKey && e.key.toLowerCase() === "s" && editingResume) {
        e.preventDefault();
        handleSaveResume(editingResume);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [resumes, renamingResume, editingResume, editingContent]);

  // предупреждение при несохранённом редактировании
  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (editingResume) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [editingResume]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        fetch("/api/user/info"),
        fetch("/api/resume/versions"),
      ]);
      const profile = await p.json();
      if (profile.success && profile.user) {
        setBio(profile.user.bio || "");
        setSalaryExpectation(profile.user.salaryExpectation || "");
      }
      const resumesData = await r.json();
      if (resumesData.success && resumesData.resumes) setResumes(resumesData.resumes);
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, salaryExpectation }),
      });
      const data = await res.json();
      if (data.success) toast.success("Профиль успешно обновлён");
      else throw new Error(data.error || "Ошибка сохранения");
    } catch (e: any) {
      toast.error("Ошибка сохранения: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме установлено по умолчанию");
        await loadProfile();
      } else throw new Error(data.error);
    } catch (e: any) {
      toast.error("Ошибка: " + e.message);
    }
  };

  const handleDeleteResume = async (id: string) => {
    toast.promise(
      (async () => {
        const res = await fetch(`/api/resume/versions/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        await loadProfile();
      })(),
      {
        loading: "Удаление...",
        success: "Резюме удалено",
        error: "Ошибка удаления",
      }
    );
  };

  const handleRenameResume = async (id: string) => {
    if (!newResumeName.trim()) return setRenamingResume(null);
    try {
      const res = await fetch(`/api/resume/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newResumeName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме переименовано");
        await loadProfile();
      } else throw new Error(data.error);
    } catch (e: any) {
      toast.error("Ошибка переименования: " + e.message);
    } finally {
      setRenamingResume(null);
      setNewResumeName("");
    }
  };

  const startRenaming = (id: string, title: string) => {
    setRenamingResume(id);
    setNewResumeName(title);
  };

  const handleEditResume = (r: ResumeVersion) => {
    setEditingResume(r.id);
    setEditingContent(r.content);
  };

  const handleSaveResume = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме обновлено");
        setEditingResume(null);
        await loadProfile();
      } else throw new Error(data.error);
    } catch (e: any) {
      toast.error("Ошибка: " + e.message);
    }
  };

  if (loading)
    return (
      <Card className="bg-linear-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Профиль */}
      <Card className="bg-linear-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Дополнительная информация
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Расскажите о себе и желаемой зарплате
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">
              О себе
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Расскажите о себе, опыте, целях..."
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 p-3 min-h-[100px] focus:ring-1 focus:ring-blue-500/40 hover:bg-white/10 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salaryExpectation" className="text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Желаемая зарплата
            </Label>
            <Input
              id="salaryExpectation"
              value={salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              placeholder="200 000 руб. или договорная"
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500/40 hover:bg-white/10 transition-all"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Сохранить
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Резюме */}
      <Card className="bg-linear-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Мои резюме
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Управление версиями и редактирование
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard?tab=resume-builder")}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">У вас пока нет резюме</p>
              <Button
                onClick={() => router.push("/dashboard?tab=resume-builder")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" /> Создать первое
              </Button>
            </div>
          ) : (
            resumes.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {renamingResume === r.id ? (
                        <Input
                          value={newResumeName}
                          onChange={(e) => setNewResumeName(e.target.value)}
                          onBlur={() => handleRenameResume(r.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameResume(r.id);
                            if (e.key === "Escape") {
                              setRenamingResume(null);
                              setNewResumeName("");
                            }
                          }}
                          className="h-6 px-1 py-0 text-sm font-semibold bg-transparent border-none text-white focus:bg-white/10 focus:ring-0"
                          autoFocus
                        />
                      ) : (
                        <h4
                          className="text-white font-semibold cursor-pointer hover:text-blue-400 transition-colors"
                          onClick={() => startRenaming(r.id, r.title)}
                          title="Кликните для переименования или F2"
                        >
                          {r.title}
                        </h4>
                      )}
                      {r.isDefault === 1 && (
                        <Badge variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-300 text-xs">
                          По умолчанию
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">
                      Обновлено: {new Date(r.updatedAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {r.isDefault !== 1 && (
                      <Button
                        onClick={() => handleSetDefaultResume(r.id)}
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                        title="Установить по умолчанию"
                      >
                        <StarOff className="h-4 w-4" />
                      </Button>
                    )}
                    {r.isDefault === 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 drop-shadow-[0_0_4px_rgba(59,130,246,0.7)]"
                        title="Резюме по умолчанию"
                        disabled
                      >
                        <Star className="h-4 w-4 fill-blue-400" />
                      </Button>
                    )}
                    <Button
                      onClick={() => startRenaming(r.id, r.title)}
                      variant="ghost"
                      size="sm"
                      className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                      title="Переименовать (F2)"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {editingResume !== r.id && (
                      <Button
                        onClick={() => handleEditResume(r)}
                        variant="ghost"
                        size="sm"
                        className="text-neutral-400 hover:text-white hover:bg-white/10 rounded-md"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteResume(r.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingResume === r.id ? (
                  <div className="space-y-2 mt-3">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={8}
                      className="bg-white/5 border-white/10 text-white font-mono text-sm leading-relaxed focus:ring-1 focus:ring-blue-500/40 transition-all"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveResume(r.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-all"
                      >
                        <Save className="h-3 w-3 mr-2" /> Сохранить
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingResume(null);
                          setEditingContent("");
                        }}
                        size="sm"
                        variant="outline"
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p
                      className="text-sm text-neutral-300 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {r.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
