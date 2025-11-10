"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Plus,
  Save,
  Building2,
  Briefcase,
  Phone,
  Linkedin,
  Globe,
  MapPin,
  User,
} from "lucide-react";
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
          specialties: Array.isArray(data.profile.specialties)
            ? data.profile.specialties
            : [],
          industries: Array.isArray(data.profile.industries)
            ? data.profile.industries
            : [],
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
    if (
      newSpecialty.trim() &&
      !profile.specialties?.includes(newSpecialty.trim())
    ) {
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
      specialties: profile.specialties?.filter((s) => s !== specialty) || [],
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
      industries: profile.industries?.filter((i) => i !== industry) || [],
    });
  };

  if (loading) {
    return (
      <Card className="bg-linear-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.6)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-linear-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-xl border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.6)] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5 text-blue-400" />
          Профиль HR специалиста
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Заполните информацию о себе для работы в режиме HR
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: "company",
              label: "Компания *",
              icon: <Building2 className="h-4 w-4" />,
              value: profile.company,
              placeholder: "Название компании",
              onChange: (v: string) => setProfile({ ...profile, company: v }),
              required: true,
            },
            {
              id: "department",
              label: "Отдел/Департамент",
              icon: <Briefcase className="h-4 w-4" />,
              value: profile.department || "",
              placeholder: "HR, Recruitment, etc.",
              onChange: (v: string) => setProfile({ ...profile, department: v }),
            },
            {
              id: "position",
              label: "Должность",
              icon: null,
              value: profile.position || "",
              placeholder: "HR Manager, Recruiter, etc.",
              onChange: (v: string) => setProfile({ ...profile, position: v }),
            },
            {
              id: "experience",
              label: "Опыт работы (лет)",
              icon: null,
              value: profile.experience || "",
              placeholder: "5",
              onChange: (v: string) =>
                setProfile({
                  ...profile,
                  experience: parseInt(v) || undefined,
                }),
              type: "number",
            },
            {
              id: "phone",
              label: "Телефон",
              icon: <Phone className="h-4 w-4" />,
              value: profile.phone || "",
              placeholder: "+7 (999) 123-45-67",
              onChange: (v: string) => setProfile({ ...profile, phone: v }),
            },
            {
              id: "location",
              label: "Локация",
              icon: <MapPin className="h-4 w-4" />,
              value: profile.location || "",
              placeholder: "Москва, Россия",
              onChange: (v: string) => setProfile({ ...profile, location: v }),
            },
            {
              id: "linkedin",
              label: "LinkedIn",
              icon: <Linkedin className="h-4 w-4" />,
              value: profile.linkedin || "",
              placeholder: "linkedin.com/in/username",
              onChange: (v: string) => setProfile({ ...profile, linkedin: v }),
            },
            {
              id: "website",
              label: "Сайт компании",
              icon: <Globe className="h-4 w-4" />,
              value: profile.website || "",
              placeholder: "https://company.com",
              onChange: (v: string) => setProfile({ ...profile, website: v }),
            },
          ].map((field) => (
            <div key={field.id} className="space-y-2">
              <Label
                htmlFor={field.id}
                className="text-white flex items-center gap-2 after:ml-0.5 after:text-blue-400"
              >
                {field.icon}
                {field.label}
              </Label>
              <Input
                id={field.id}
                type={field.type || "text"}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                placeholder={field.placeholder}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500/40 hover:bg-white/10 transition-all duration-150"
              />
            </div>
          ))}
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
            className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 p-3 min-h-[100px] focus:ring-1 focus:ring-blue-500/40 hover:bg-white/10 transition-all duration-150"
          />
        </div>

        {[
          {
            title: "Специализации",
            items: profile.specialties,
            newItem: newSpecialty,
            setNewItem: setNewSpecialty,
            addItem: addSpecialty,
            removeItem: removeSpecialty,
            color: "blue",
          },
          {
            title: "Отрасли",
            items: profile.industries,
            newItem: newIndustry,
            setNewItem: setNewIndustry,
            addItem: addIndustry,
            removeItem: removeIndustry,
            color: "purple",
          },
        ].map((section) => (
          <div key={section.title} className="space-y-2">
            <Label className="text-white">{section.title}</Label>
            <div className="flex gap-2 flex-wrap mb-2">
              {section.items?.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className={`bg-${section.color}-600/15 border-${section.color}-500/30 text-${section.color}-300 text-[11px] px-2 py-0.5 transition-colors hover:bg-${section.color}-600/25`}
                >
                  {item}
                  <button
                    onClick={() => section.removeItem(item)}
                    className="ml-2 opacity-70 hover:opacity-100 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={section.newItem}
                onChange={(e) => section.setNewItem(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), section.addItem())
                }
                placeholder={`Добавить ${section.title.toLowerCase().slice(0, -1)}`}
                className="bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus:ring-1 focus:ring-blue-500/40 hover:bg-white/10 transition-all duration-150"
              />
              <Button
                type="button"
                onClick={section.addItem}
                size="icon"
                variant="outline"
                className="border-white/10 hover:border-blue-400/40"
              >
                <Plus className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={saving || !profile.company}
          className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all duration-200"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Сохранение..." : "Сохранить профиль"}
        </Button>
      </CardContent>
    </Card>
  );
}
