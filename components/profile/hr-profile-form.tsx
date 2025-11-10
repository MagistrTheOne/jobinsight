"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, Building2, Briefcase, Phone, Linkedin, Globe, MapPin, User } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

interface HRProfile {
  id?: string;
  company: string;
  department?: string;
  position?: string;
  phone?: string;
  linkedin?: string;
  bio?: string;
  specialties?: string[];
  industries?: string[];
  experience?: number;
  location?: string;
  website?: string;
}

export function HRProfileForm() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<HRProfile>({
    company: "",
    department: "",
    position: "",
    phone: "",
    linkedin: "",
    bio: "",
    specialties: [],
    industries: [],
    experience: undefined,
    location: "",
    website: "",
  });
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newIndustry, setNewIndustry] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile({
          ...data.profile,
          specialties: Array.isArray(data.profile.specialties) ? data.profile.specialties : [],
          industries: Array.isArray(data.profile.industries) ? data.profile.industries : [],
        });
      }
    } catch (error) {
      console.error("Failed to load HR profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/hr/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Профиль HR успешно сохранен");
        setProfile(data.profile);
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error("Ошибка сохранения профиля: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !profile.specialties?.includes(newSpecialty.trim())) {
      setProfile({
        ...profile,
        specialties: [...(profile.specialties || []), newSpecialty.trim()],
      });
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfile({
      ...profile,
      specialties: profile.specialties?.filter(s => s !== specialty) || [],
    });
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !profile.industries?.includes(newIndustry.trim())) {
      setProfile({
        ...profile,
        industries: [...(profile.industries || []), newIndustry.trim()],
      });
      setNewIndustry("");
    }
  };

  const removeIndustry = (industry: string) => {
    setProfile({
      ...profile,
      industries: profile.industries?.filter(i => i !== industry) || [],
    });
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
    <Card className="bg-black/60 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Профиль HR специалиста
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Заполните информацию о себе для работы в режиме HR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-white flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Компания *
            </Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              placeholder="Название компании"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Отдел/Департамент
            </Label>
            <Input
              id="department"
              value={profile.department || ""}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              placeholder="HR, Recruitment, etc."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position" className="text-white">
              Должность
            </Label>
            <Input
              id="position"
              value={profile.position || ""}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
              placeholder="HR Manager, Recruiter, etc."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-white">
              Опыт работы (лет)
            </Label>
            <Input
              id="experience"
              type="number"
              value={profile.experience || ""}
              onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || undefined })}
              placeholder="5"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Телефон
            </Label>
            <Input
              id="phone"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-white flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Локация
            </Label>
            <Input
              id="location"
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Москва, Россия"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin" className="text-white flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin"
              value={profile.linkedin || ""}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
              placeholder="linkedin.com/in/username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-white flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Сайт компании
            </Label>
            <Input
              id="website"
              value={profile.website || ""}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
              placeholder="https://company.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-white">
            О себе
          </Label>
          <Textarea
            id="bio"
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            placeholder="Расскажите о себе, вашем опыте и специализации..."
            rows={4}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Специализации</Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {profile.specialties?.map((spec) => (
              <Badge key={spec} variant="outline" className="bg-blue-600/20 border-blue-500/30 text-blue-300">
                {spec}
                <button
                  onClick={() => removeSpecialty(spec)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              placeholder="Добавить специализацию"
              className="bg-white/5 border-white/10 text-white"
            />
            <Button type="button" onClick={addSpecialty} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Отрасли</Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {profile.industries?.map((ind) => (
              <Badge key={ind} variant="outline" className="bg-purple-600/20 border-purple-500/30 text-purple-300">
                {ind}
                <button
                  onClick={() => removeIndustry(ind)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addIndustry())}
              placeholder="Добавить отрасль"
              className="bg-white/5 border-white/10 text-white"
            />
            <Button type="button" onClick={addIndustry} size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !profile.company}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить профиль"}
        </Button>
      </CardContent>
    </Card>
  );
}

