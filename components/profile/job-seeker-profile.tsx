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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, resumesRes] = await Promise.all([
        fetch("/api/user/info"),
        fetch("/api/resume/versions"),
      ]);

      const profileData = await profileRes.json();
      if (profileData.success && profileData.user) {
        setBio(profileData.user.bio || "");
        setSalaryExpectation(profileData.user.salaryExpectation || "");
      }

      const resumesData = await resumesRes.json();
      if (resumesData.success && resumesData.resumes) {
        setResumes(resumesData.resumes);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
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
        body: JSON.stringify({
          bio,
          salaryExpectation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Профиль успешно обновлен");
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error("Ошибка сохранения: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultResume = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resume/versions/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме установлено по умолчанию");
        await loadProfile();
      } else {
        throw new Error(data.error || "Failed to set default");
      }
    } catch (error: any) {
      toast.error("Ошибка: " + error.message);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm("Удалить это резюме?")) return;
    try {
      const res = await fetch(`/api/resume/versions/${resumeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме удалено");
        await loadProfile();
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (error: any) {
      toast.error("Ошибка: " + error.message);
    }
  };

  const handleEditResume = (resume: ResumeVersion) => {
    setEditingResume(resume.id);
    setEditingContent(resume.content);
  };

  const handleSaveResume = async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resume/versions/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editingContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Резюме обновлено");
        setEditingResume(null);
        await loadProfile();
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error("Ошибка: " + error.message);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/60 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* О себе и ЗП */}
      <Card className="bg-black/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Дополнительная информация
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Расскажите о себе и укажите желаемую зарплату
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
              placeholder="Расскажите о себе, вашем опыте, навыках и целях..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
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
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Управление резюме */}
      <Card className="bg-black/60 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Мои резюме
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Управление прикрепленными резюме
              </CardDescription>
            </div>
            <Button
              onClick={() => router.push("/dashboard?tab=resume-builder")}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать резюме
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumes.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">У вас пока нет резюме</p>
              <Button
                onClick={() => router.push("/dashboard?tab=resume-builder")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать первое резюме
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{resume.title}</h4>
                        {resume.isDefault === 1 && (
                          <Badge variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-300 text-xs">
                            По умолчанию
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400">
                        Обновлено: {new Date(resume.updatedAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {resume.isDefault !== 1 && (
                        <Button
                          onClick={() => handleSetDefaultResume(resume.id)}
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-white"
                          title="Установить по умолчанию"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      )}
                      {resume.isDefault === 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400"
                          title="Резюме по умолчанию"
                          disabled
                        >
                          <Star className="h-4 w-4 fill-blue-400" />
                        </Button>
                      )}
                      {editingResume !== resume.id && (
                        <Button
                          onClick={() => handleEditResume(resume)}
                          variant="ghost"
                          size="sm"
                          className="text-neutral-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteResume(resume.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {editingResume === resume.id ? (
                    <div className="space-y-2 mt-3">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        rows={8}
                        className="bg-white/5 border-white/10 text-white font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveResume(resume.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="h-3 w-3 mr-2" />
                          Сохранить
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingResume(null);
                            setEditingContent("");
                          }}
                          size="sm"
                          variant="outline"
                          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-neutral-300 overflow-hidden text-ellipsis" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {resume.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

