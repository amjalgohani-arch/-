export interface Achievement {
  id: string;
  year: string;
  titleAr: string;
  titleEn: string;
  icon: string;
}

export interface Period {
  num: number;
  nameAr: string;
  nameEn: string;
  start: string;
  end: string;
  type: "class" | "assembly" | "break" | "dismissal";
  days: "all" | "sun-mon" | "tue-thu";
}

export interface RoomInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: "admin" | "class" | "lab" | "yard" | "facility" | "stair" | "other";
}

export interface FloorLayout {
  floorNum: number;
  titleAr: string;
  titleEn: string;
  rooms: RoomInfo[];
}

export interface SchoolEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  description?: string;
}

export type StaffCategory = "leadership" | "counseling" | "teachers" | "admin" | "special";

export interface StaffMember {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  category: StaffCategory;
  departmentAr: string;
  departmentEn: string;
  locationRoomId?: string; // Links to RoomInfo.id on the interactive map
  locationAr: string;
  locationEn: string;
  floor: 0 | 1 | 2;
  tasksAr?: string[];
  tasksEn?: string[];
  officeHoursAr?: string;
  officeHoursEn?: string;
  emailContact?: string;
  extension?: string;
  avatarIcon?: string;
}

export type AppTheme = "national_day" | "default";

