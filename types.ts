export interface Lesson {
  title: string;
  description: string;
}

export interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  title:string;
  description: string;
  modules: Module[];
}

export interface Source {
  uri: string;
  title: string;
  snippet?: string;
}

export interface SavedCourse {
  id: string;
  topic: string;
  savedAt: string;
  course: Course;
  sources: Source[];
}
