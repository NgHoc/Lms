import { COURSES as initialCourses, LESSONS as initialLessons, MOCK_QUESTIONS as initialQuestions } from '../mockData';

// Keys for LocalStorage
export const STORAGE_KEYS = {
  COURSES: 'lms_courses_v2',
  LESSONS: 'lms_lessons_v2',
  QUESTIONS: 'lms_questions_v2',
  HISTORY: 'lms_history_v2'
};

// Clear legacy v1 mock cache if present in user's browser
try {
  localStorage.removeItem('lms_courses_v1');
  localStorage.removeItem('lms_lessons_v1');
  localStorage.removeItem('lms_questions_v1');
  localStorage.removeItem('lms_history_v1');
} catch (e) {}

// Initialize State from LocalStorage or empty arrays
export function getInitialCourses() {
  const saved = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialCourses || [];
}

export function getInitialLessons() {
  const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialLessons || [];
}

export function getInitialQuestions() {
  const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return initialQuestions || [];
}

export function getInitialHistory() {
  const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return [];
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

export function saveHistoryToStorage(history) {
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function addHistoryItem(item) {
  const current = getInitialHistory();
  const updated = [item, ...current];
  saveHistoryToStorage(updated);
  return updated;
}

export function clearHistoryFromStorage() {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  return [];
}

export function clearAllStorageData() {
  localStorage.removeItem(STORAGE_KEYS.COURSES);
  localStorage.removeItem(STORAGE_KEYS.LESSONS);
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}
