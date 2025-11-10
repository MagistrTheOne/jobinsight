"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Briefcase, Save, CheckCircle2, Upload, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { HRProfileForm } from "./hr-profile-form";
import { JobSeekerProfile } from "./job-seeker-profile";

export function UserProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<"user" | "hr">("user");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/info");
      const data = await res.json();
      if (data.success && data.user) {
        setRole((data.user.role === "hr" ? "hr" : "user") as "user" | "hr");
        setName(data.user.name || "");
        setTitle(data.user.title || "");
        if (data.user.image) {
          setAvatarPreview(data.user.image);
        }
      }
    } catch (error) {
      console.error("Failed to load user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error("Выберите изображение");
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Сначала загружаем аватар, если есть
      let avatarUrl = user?.image || null;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarRes = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });
        
        if (avatarRes.ok) {
          const avatarData = await avatarRes.json();
          if (avatarData.success && avatarData.url) {
            avatarUrl = avatarData.url;
          }
        } else {
          toast.error("Ошибка загрузки аватара");
        }
      }

      // Обновляем профиль
      const res = await fetch("/api/user/info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name,
          title,
          image: avatarUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Профиль успешно обновлен");
        // Обновляем данные пользователя в store
        if (data.user) {
          setUser(data.user);
        }
        // Очищаем файл после успешной загрузки
        setAvatarFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error("Ошибка сохранения: " + error.message);
    } finally {
      setSaving(false);
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
      <Card className="bg-black/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Настройки профиля
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Выберите роль и заполните основную информацию
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-3">
            <Label className="text-white text-base font-semibold">Аватар</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-white/20">
                <AvatarImage src={avatarPreview || user?.image || undefined} />
                <AvatarFallback className="bg-white/10 text-white text-lg">
                  {name ? name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {avatarPreview ? "Изменить" : "Загрузить"}
                </Button>
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Рекомендуемый размер: 200x200px. Максимальный размер: 5MB
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-white text-base font-semibold">Роль</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value as "user" | "hr")}>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user" className="cursor-pointer flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Соискатель</div>
                      <div className="text-sm text-neutral-400">Ищу работу, нужна помощь с резюме и откликами</div>
                    </div>
                    {role === "user" && (
                      <Badge variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-300">
                        Активна
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer">
                <RadioGroupItem value="hr" id="hr" />
                <Label htmlFor="hr" className="cursor-pointer flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white flex items-center gap-2">
                        HR специалист
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-sm text-neutral-400">Ищу кандидатов, автоматизация рекрутинга</div>
                    </div>
                    {role === "hr" && (
                      <Badge variant="outline" className="bg-purple-600/20 border-purple-500/30 text-purple-300">
                        Активна
                      </Badge>
                    )}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Имя
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Должность
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="CEO, Developer, HR Manager, etc."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Сохранение..." : "Сохранить настройки"}
          </Button>
        </CardContent>
      </Card>

      {role === "hr" && (
        <HRProfileForm />
      )}

      {role === "user" && (
        <JobSeekerProfile />
      )}
    </div>
  );
}

