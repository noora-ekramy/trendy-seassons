"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(t("sent_success"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  const contactInfo = [
    { icon: MapPin, label: t("address"), value: t("address_value") },
    { icon: Phone, label: t("phone"), value: t("phone_value") },
    { icon: Mail, label: t("email_label"), value: t("email_value") },
    { icon: Clock, label: t("hours"), value: t("hours_value") },
  ];

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mb-14 text-center">
          <h1 className="mb-4 font-display text-4xl font-light tracking-tight text-[#4A433A] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[#6B6358]">{t("subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-light text-[#4A433A]">
                {t("send_message")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-[#4A433A]">{t("name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 border-border/70 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-[#4A433A]">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="mt-1 border-border/70 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="subject" className="text-[#4A433A]">{t("subject")}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="mt-1 border-border/70 bg-background/50"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-[#4A433A]">{t("message")}</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="mt-1 border-border/70 bg-background/50"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? t("sending") : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/80">
                    <info.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-display text-base font-medium text-[#4A433A]">{info.label}</h3>
                    <p className="text-sm text-[#6B6358]">{info.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
