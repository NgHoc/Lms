

// Helper to generate full question bank for 60m test (duplicates / procedural generation for rich pool)
export function getQuestionsForTestMode(courseId, mode, selectedLessonId) {
  let pool = MOCK_QUESTIONS.filter(q => {
    const lesson = LESSONS.find(l => l.id === q.lessonId);
    return lesson && lesson.courseId === courseId;
  });

  if (mode === "TEST_15") {
    // 15 mins: 15 questions from 1 lesson
    let lessonQs = pool.filter(q => q.lessonId === selectedLessonId);
    if (lessonQs.length === 0) lessonQs = pool;
    return generateRandomQuestions(lessonQs, 15);
  } else if (mode === "TEST_30") {
    // 30 mins: 30 questions from 3 lessons (10 per lesson)
    const lessons = LESSONS.filter(l => l.courseId === courseId).slice(0, 3);
    let result = [];
    lessons.forEach(l => {
      let lQs = pool.filter(q => q.lessonId === l.id);
      result.push(...generateRandomQuestions(lQs, 10));
    });
    return result;
  } else {
    // 60 mins: 50 questions from entire course
    return generateRandomQuestions(pool, 50);
  }
}

function generateRandomQuestions(sourceArray, targetCount) {
  if (sourceArray.length === 0) return [];
  let result = [];
  let index = 0;
  while (result.length < targetCount) {
    let item = sourceArray[index % sourceArray.length];
    // create deep copy with unique session instance ID
    result.push({
      ...item,
      instanceId: `inst-${result.length + 1}-${item.id}`
    });
    index++;
  }
  return result;
}
