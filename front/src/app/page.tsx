"use client";

import { BiBriefcase, BiUser } from "react-icons/bi";

import { AuthCardLink } from "@/components/auth/AuthCardLink";
import { AuthShell } from "@/components/auth/AuthShell";
import { Signature } from "@/components/icons";

export default function RoleSelectPage() {
  return (
    <AuthShell
      accentLabel="Access portal"
      title="Нэвтрэх төрлөө сонгоно уу"
      description="Нэг ижил систем дотор HR баг болон ажилтан өөрийн ажлын урсгал руу шууд орно."
      icon={<Signature />}
      showBackLink={false}
    >
      <div className="space-y-4">
        <AuthCardLink
          href="/auth/hr"
          icon={<BiBriefcase className="h-6 w-6" />}
          title="HR нэвтрэх"
          description="Хүний нөөцийн самбар, хүсэлт, ажилтны бүртгэл, аудитын урсгал руу орно."
        />
        <AuthCardLink
          href="/auth/employee"
          icon={<BiUser className="h-6 w-6" />}
          title="Ажилтан нэвтрэх"
          description="Өөрийн баримт бичиг, профайл, аудитын мэдээлэл болон мэдэгдлээ харна."
        />
      </div>
    </AuthShell>
  );
}
