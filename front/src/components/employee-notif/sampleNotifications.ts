import type { EmployeeNotification } from "@/lib/types";

export const SAMPLE_EMPLOYEE_NOTIFICATIONS: EmployeeNotification[] = [
  {
    id: "sample-notif-contract",
    employeeId: "sample-employee",
    title: "Хөдөлмөрийн гэрээ",
    body:
      "Таны хөдөлмөрийн гэрээ 5 хоногийн дараа дуусна. Хүний нөөцийн хэсгээс ирсэн шинэчилсэн нөхцөл болон хавсралтуудыг шалгаж, шаардлагатай бол гэрээгээ сунгах хүсэлтээ илгээнэ үү. Гэрээ сунгах хүсэлт илгээхээс өмнө хөдөлмөрийн нөхцөл, албан тушаалын тодорхойлолт, нэмэлт нөхцөлүүдтэй анхааралтай танилцана уу.\n\nХэрэв та гэрээгээ сунгах бол энэ 7 хоногт багтаан баримтуудаа баталгаажуулж, шаардлагатай засварыг HR багт мэдэгдэнэ үү. Хариу өгөх хугацаа ойртож байгаа тул систем дээрх файлуудыг нягтлаад гэрээгээ сунгах хүсэлтээ илгээнэ үү...",
    status: "unread",
    createdAt: new Date("2026-03-17T09:10:00+08:00").toISOString(),
    readAt: null,
  },
  {
    id: "sample-notif-probation",
    employeeId: "sample-employee",
    title: "Туршилтын хугацаа",
    body: "Таны туршилтын хугацааны баримт бэлэн болсон.\nШалгаж баталгаажуулна уу.",
    status: "read",
    createdAt: new Date("2026-03-16T15:30:00+08:00").toISOString(),
    readAt: new Date("2026-03-16T16:00:00+08:00").toISOString(),
  },
  {
    id: "sample-notif-profile",
    employeeId: "sample-employee",
    title: "Профайл шинэчлэлт",
    body: "Таны профайл мэдээлэл дутуу байна.\nИмэйл болон GitHub хаягаа шалгана уу.",
    status: "unread",
    createdAt: new Date("2026-03-15T11:45:00+08:00").toISOString(),
    readAt: null,
  },
  {
    id: "sample-notif-salary",
    employeeId: "sample-employee",
    title: "Цалингийн баримт",
    body: "Энэ сарын цалингийн баримт системд нэмэгдлээ.\nFiles хэсгээс харна уу.",
    status: "read",
    createdAt: new Date("2026-03-14T08:20:00+08:00").toISOString(),
    readAt: new Date("2026-03-14T09:00:00+08:00").toISOString(),
  },
];
