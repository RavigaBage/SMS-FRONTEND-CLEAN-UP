export interface Subject {
  name: string;
  description?: string;
}

export interface Programme {
  id: string;
  title: string;
  levelRange: string;
  tagline: string;
  icon: string;
  subjects: Subject[];
}

export const curriculumData: Record<string, Programme> = {
  "early-years": {
    id: "early-years",
    title: "Early Years",
    levelRange: "Crèche & Nursery",
    tagline: "Nurturing curious minds through play-based learning in a warm, safe environment.",
    icon: "🌱",
    subjects: [
      { name: "Numeracy" },
      { name: "Literacy" },
      { name: "Creativity" },
      { name: "Jolly Phonics" },
      { name: "Practical Life" }
    ]
  },
  "kindergarten": {
    id: "kindergarten",
    title: "Kindergarten",
    levelRange: "KG 1 – KG 2",
    tagline: "Building foundational skills in literacy, numeracy and creativity.",
    icon: "🎨",
    subjects: [
      { name: "OWOP (Our World Our People)" },
      { name: "Numeracy" },
      { name: "Literacy" },
      { name: "Creativity" },
      { name: "Jolly Phonics" },
      { name: "Practical Life" }
    ]
  },
  "primary": {
    id: "primary",
    title: "Primary School",
    levelRange: "Class 1 – Class 6",
    tagline: "A rigorous GES curriculum developing well-rounded, confident learners.",
    icon: "📚",
    subjects: [
      { name: "Mathematics" },
      { name: "English Language" },
      { name: "Science" },
      { name: "OWOP / Social Studies" },
      { name: "Religious & Moral Education (RME)" },
      { name: "BDT / Career Technology" },
      { name: "Home Economics" },
      { name: "Creative Arts" },
      { name: "ICT / Computing" },
      { name: "Twi / Fante" },
      { name: "Robotics / UCMAS" },
      { name: "French" },
      { name: "Physical Education" }
    ]
  },
  "junior-high": {
    id: "junior-high",
    title: "Junior High School",
    levelRange: "Form 1 – Form 3",
    tagline: "Preparing students for the BECE with academic excellence and character.",
    icon: "🎓",
    subjects: [
      { name: "English Language" },
      { name: "Mathematics" },
      { name: "Social Studies" },
      { name: "Integrated Science" },
      { name: "Religious & Moral Education (RME)" },
      { name: "BDT / Pre-Technical Skills" },
      { name: "Home Economics" },
      { name: "ICT" },
      { name: "French" },
      { name: "Fante / Asante Twi" }
    ]
  }
};