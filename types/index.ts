export type Rang = {
  rang: string;
  rasm: string;
};

export type Mahsulot = {
  id: number;
  nom: string;
  tavsif: string;
  narx: number;
  chegirma_narx: number | null;
  miqdor: number;
  sheet_id: number;
  varoq_nomi: string;
  link: string;
  ranglar: Rang[];
  rasmlar?: string[];
  yaratilgan_vaqt: string; // yoki: Date agar ISO format bo‘lsa
  sheet_nomi: string;
};

export type Mahsulotlar = Mahsulot[];
