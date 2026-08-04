import { COURSES as initialCourses, LESSONS as initialLessons, MOCK_QUESTIONS as initialQuestions } from '../mockData';

// Keys for LocalStorage
const STORAGE_KEYS = {
  COURSES: 'lms_courses_v1',
  LESSONS: 'lms_lessons_v1',
  QUESTIONS: 'lms_questions_v1',
  HISTORY: 'lms_history_v1'
};

// Initialize State from LocalStorage or default mockData
export function getInitialCourses() {
  const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialCourses;
}

export function getInitialLessons() {
  const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialLessons;
}

export function getInitialQuestions() {
  const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialQuestions;
}

export function saveCoursesToStorage(courses) {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

export function saveLessonsToStorage(lessons) {
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
}

export function saveQuestionsToStorage(questions) {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
}
