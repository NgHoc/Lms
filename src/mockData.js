// Mock Data representing PostgreSQL tables: COURSES, LESSONS, QUESTIONS, QUESTION_OPTIONS

export const COURSES = [
  {
    id: "c-100",
    code: "MLN101",
    title: "Triết học Mác - Lênin & CNXHKH",
    description: "Sứ mệnh lịch sử giai cấp công nhân, hình thái kinh tế xã hội và phép biện chứng duy vật.",
    lessonsCount: 3,
    questionsCount: 30
  },
  {
    id: "c-101",
    code: "CS101",
    title: "Cấu trúc dữ liệu & Thuật toán",
    description: "Học phần nền tảng về giải thuật, mảng, danh sách liên kết, cây và đồ thị.",
    lessonsCount: 4,
    questionsCount: 65
  },
  {
    id: "c-102",
    code: "SE202",
    title: "Kiến trúc hệ thống & Thiết kế Cơ sở dữ liệu",
    description: "Thiết kế hệ thống phân tán, chuẩn hóa DB, SQL và RESTful API.",
    lessonsCount: 3,
    questionsCount: 45
  }
];

export const LESSONS = [
  { id: "l-100", courseId: "c-100", lessonNumber: 1, title: "Bài 1: Sứ mệnh lịch sử của giai cấp công nhân" },
  { id: "l-101", courseId: "c-100", lessonNumber: 2, title: "Bài 2: Chủ nghĩa xã hội và thời kỳ quá độ" },
  { id: "l-1", courseId: "c-101", lessonNumber: 1, title: "Bài 1: Mảng và Thuật toán Sắp xếp" },
  { id: "l-2", courseId: "c-101", lessonNumber: 2, title: "Bài 2: Danh sách liên kết & Ngăn xếp (Stack/Queue)" },
  { id: "l-3", courseId: "c-101", lessonNumber: 3, title: "Bài 3: Cây nhị phân và Cây tìm kiếm BST" },
  { id: "l-4", courseId: "c-101", lessonNumber: 4, title: "Bài 4: Đồ thị & Thuật toán BFS/DFS" }
];

export const MOCK_QUESTIONS = [
  // LESSON MLN - Type 3: Table Match Drag & Drop (Câu 12)
  {
    id: "q-mln-12",
    lessonId: "l-100",
    type: "DRAG_DROP",
    dragMode: "match",
    content: "Kéo thả các đáp án khớp với các phát biểu từ 1–3 vào vị trí dưới đây:",
    matchPairs: [
      {
        blankId: "BLANK_0",
        leftText: "Thực hiện sự nghiệp giải phóng thế giới ấy, đó là sứ mệnh lịch sử của ___ hiện đại.",
        leftWithBlank: "Thực hiện sự nghiệp giải phóng thế giới ấy, đó là sứ mệnh lịch sử của [BLANK_0] hiện đại.",
        rightAnswer: "giai cấp vô sản"
      },
      {
        blankId: "BLANK_1",
        leftText: "Sứ mệnh lịch sử của giai cấp công nhân là ___ khỏi áp bức, bất công, bóc lột.",
        leftWithBlank: "Sứ mệnh lịch sử của giai cấp công nhân là [BLANK_1] khỏi áp bức, bất công, bóc lột.",
        rightAnswer: "giải phóng con người"
      },
      {
        blankId: "BLANK_2",
        leftText: "Giai cấp công nhân là ___ và có tinh thần cách mạng triệt để.",
        leftWithBlank: "Giai cấp công nhân là [BLANK_2] và có tinh thần cách mạng triệt để.",
        rightAnswer: "giai cấp cách mạng"
      }
    ],
    extractedBlanks: [
      { blankId: "BLANK_0", answer: "giai cấp vô sản" },
      { blankId: "BLANK_1", answer: "giải phóng con người" },
      { blankId: "BLANK_2", answer: "giai cấp cách mạng" }
    ],
    dragItems: ["giai cấp công nhân", "giải phóng con người", "giai cấp vô sản", "giai cấp cách mạng"],
    correctAnswers: {
      "BLANK_0": "giai cấp vô sản",
      "BLANK_1": "giải phóng con người",
      "BLANK_2": "giai cấp cách mạng"
    },
    explanation: "Theo Chủ nghĩa Mác - Lênin, giai cấp vô sản hiện đại gánh vác sứ mệnh lịch sử giải phóng loài người khỏi áp bức, bất công."
  },
  // LESSON MLN - Type 3: Table Categorize Drag & Drop (Câu 13)
  {
    id: "q-mln-13",
    lessonId: "l-100",
    type: "DRAG_DROP",
    dragMode: "categorize",
    content: "Kéo thả các yếu tố sau đây vào cột tương ứng:",
    columns: [
      {
        header: "Điều kiện chủ quan để giai cấp công nhân thực hiện được sứ mệnh lịch sử:",
        items: [
          "Địa vị chính trị – xã hội của giai cấp công nhân",
          "Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng"
        ]
      },
      {
        header: "Điều kiện khách quan quy định sứ mệnh lịch sử của giai cấp công nhân:",
        items: [
          "Đảng Cộng sản",
          "Địa vị kinh tế của giai cấp công nhân"
        ]
      }
    ],
    dragItems: [
      "Địa vị chính trị – xã hội của giai cấp công nhân",
      "Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng",
      "Đảng Cộng sản",
      "Địa vị kinh tế của giai cấp công nhân"
    ],
    correctAnswers: {
      "COL_0_ITEM_0": "Địa vị chính trị – xã hội của giai cấp công nhân",
      "COL_0_ITEM_1": "Sự phát triển của bản thân giai cấp công nhân cả về số lượng và chất lượng",
      "COL_1_ITEM_0": "Đảng Cộng sản",
      "COL_1_ITEM_1": "Địa vị kinh tế của giai cấp công nhân"
    },
    explanation: "Điều kiện chủ quan gồm địa vị chính trị - xã hội và sự phát triển nội tại của giai cấp công nhân. Điều kiện khách quan gồm địa vị kinh tế và vai trò lãnh đạo của Đảng Cộng sản."
  },
  // LESSON MLN - Type 1: Single Choice
  {
    id: "q-mln-01",
    lessonId: "l-100",
    type: "SINGLE_CHOICE",
    content: "Quy luật nào là hạt nhân của phép biện chứng duy vật?",
    imageUrl: null,
    explanation: "Quy luật thống nhất và đấu tranh giữa các mặt đối lập (quy luật mâu thuẫn) là hạt nhân của phép biện chứng.",
    options: [
      { id: "opt-m1", key: "A", text: "Quy luật lượng - chất", isCorrect: false },
      { id: "opt-m2", key: "B", text: "Quy luật mâu thuẫn (Thống nhất và đấu tranh giữa các mặt đối lập)", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-m3", key: "C", text: "Quy luật phủ định của phủ định", isCorrect: false },
      { id: "opt-m4", key: "D", text: "Quy luật quan hệ sản xuất phù hợp với trình độ phát triển của lực lượng sản xuất", isCorrect: false }
    ]
  },
  // LESSON 1 - Type 1: Single Choice
  {
    id: "q-101",
    lessonId: "l-1",
    type: "SINGLE_CHOICE",
    content: "Độ phức tạp thời gian trung bình của thuật toán QuickSort là bao nhiêu?",
    imageUrl: null,
    explanation: "QuickSort chia để trị có độ phức tạp trung bình là O(n log n), trường hợp xấu nhất khi mảng đã sắp xếp là O(n^2).",
    options: [
      { id: "opt-1", key: "A", text: "O(n)", isCorrect: false },
      { id: "opt-2", key: "B", text: "O(n log n)", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-3", key: "C", text: "O(n^2)", isCorrect: false },
      { id: "opt-4", key: "D", text: "O(log n)", isCorrect: false }
    ]
  },
  // LESSON 1 - Type 1: Multi Choice
  {
    id: "q-102",
    lessonId: "l-1",
    type: "MULTI_CHOICE",
    content: "Chọn 2 thuật toán sắp xếp có thuộc tính Ổn định (Stable Sorting):",
    imageUrl: null,
    explanation: "MergeSort và BubbleSort giữ nguyên thứ tự tương đối của các phần tử có giá trị bằng nhau.",
    options: [
      { id: "opt-5", key: "A", text: "Merge Sort", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-6", key: "B", text: "Quick Sort", isCorrect: false },
      { id: "opt-7", key: "C", text: "Bubble Sort", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-8", key: "D", text: "Heap Sort", isCorrect: false }
    ]
  },
  // LESSON 1 - Type 2: True/False
  {
    id: "q-103",
    lessonId: "l-1",
    type: "TRUE_FALSE",
    content: "Xác định tính Đúng / Sai của các phát biểu sau về mảng tĩnh (Static Array):",
    imageUrl: null,
    explanation: "Mảng tĩnh có kích thước cố định tại thời điểm biên dịch, truy cập ngẫu nhiên qua chỉ số O(1).",
    options: [
      { id: "tf-1", key: "1", text: "Kích thước mảng có thể co giãn linh hoạt trong khi chương trình đang chạy.", isCorrect: false, detectedColor: "#FF0000" },
      { id: "tf-2", key: "2", text: "Thời gian truy cập phần tử mảng theo chỉ số (Index) là O(1).", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-3", key: "3", text: "Các phần tử mảng tĩnh được cấp phát trên bộ nhớ nằm liên tiếp nhau.", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-4", key: "4", text: "Chèn một phần tử vào đầu mảng tĩnh có độ phức tạp là O(1).", isCorrect: false, detectedColor: "#FF0000" }
    ]
  },
  // LESSON 1 - Type 3: Fill-in-the-blank / Drag & Drop
  {
    id: "q-104",
    lessonId: "l-1",
    type: "DRAG_DROP",
    content: "Kéo thả các mảnh ghép thuật toán vào vị trí thích hợp:",
    templateText: "Thuật toán [BLANK_0] sử dụng nguyên lý Chia để trị, trong khi thuật toán [BLANK_1] duy trì một tập hợp các phần tử chưa sắp xếp và liên tục tìm giá trị nhỏ nhất.",
    dragItems: ["MergeSort", "SelectionSort", "InsertionSort", "LinearSearch"],
    correctAnswers: { "BLANK_0": "MergeSort", "BLANK_1": "SelectionSort" },
    explanation: "MergeSort chia đôi mảng rồi trộn lại. SelectionSort chọn phần tử nhỏ nhất chèn vào vị trí đúng."
  },
  // LESSON 2 - Type 1: Single Choice
  {
    id: "q-201",
    lessonId: "l-2",
    type: "SINGLE_CHOICE",
    content: "Cấu trúc dữ liệu Ngăn xếp (Stack) hoạt động theo nguyên tắc nào?",
    imageUrl: null,
    explanation: "Stack tuân theo LIFO (Last In First Out) - Vào sau ra trước.",
    options: [
      { id: "opt-201", key: "A", text: "FIFO (First In First Out)", isCorrect: false },
      { id: "opt-202", key: "B", text: "LIFO (Last In First Out)", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-203", key: "C", text: "LILO (Last In Last Out)", isCorrect: false },
      { id: "opt-204", key: "D", text: "Priority-based", isCorrect: false }
    ]
  },
  // LESSON 2 - Type 2: True/False
  {
    id: "q-202",
    lessonId: "l-2",
    type: "TRUE_FALSE",
    content: "Xác định tính Đúng / Sai về Hàng đợi (Queue) và Danh sách liên kết (Linked List):",
    imageUrl: null,
    explanation: "Queue tuân theo FIFO. Danh sách liên kết đơn chỉ lưu con trỏ next.",
    options: [
      { id: "tf-201", key: "1", text: "Phép toán Push trong Queue lấy phần tử ở đầu hàng đợi.", isCorrect: false, detectedColor: "#FF0000" },
      { id: "tf-202", key: "2", text: "Danh sách liên kết kép mỗi nút chứa 2 con trỏ prev và next.", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-203", key: "3", text: "Hàng đợi ưu tiên (Priority Queue) thường được cài đặt bằng Heap.", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-204", key: "4", text: "Linked List có khả năng truy cập trực tiếp phần tử thứ k trong thời gian O(1).", isCorrect: false, detectedColor: "#FF0000" }
    ]
  },
  // LESSON 2 - Type 3: Fill-in-the-blank
  {
    id: "q-203",
    lessonId: "l-2",
    type: "DRAG_DROP",
    content: "Hoàn thiện các thao tác trên Ngăn xếp (Stack):",
    templateText: "Hàm [BLANK_0] dùng để thêm một phần tử vào đỉnh Stack, còn hàm [BLANK_1] dùng để lấy ra và xóa phần tử ở đỉnh Stack.",
    dragItems: ["push()", "pop()", "peek()", "enqueue()"],
    correctAnswers: { "BLANK_0": "push()", "BLANK_1": "pop()" },
    explanation: "Push thêm vào đỉnh, Pop lấy khỏi đỉnh."
  },
  // LESSON 3 - Type 1: Single Choice
  {
    id: "q-301",
    lessonId: "l-3",
    type: "SINGLE_CHOICE",
    content: "Trong Cây tìm kiếm nhị phân (BST), thuộc tính nào sau đây luôn ĐÚNG với mọi nút N?",
    imageUrl: null,
    explanation: "BST quy định: Mọi giá trị cây con trái < N.val < mọi giá trị cây con phải.",
    options: [
      { id: "opt-301", key: "A", text: "Cây con trái <= N < Cây con phải", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-302", key: "B", text: "Cây con trái >= N >= Cây con phải", isCorrect: false },
      { id: "opt-303", key: "C", text: "Cây con trái có số nút bằng cây con phải", isCorrect: false },
      { id: "opt-304", key: "D", text: "Nút gốc luôn chứa giá trị lớn nhất", isCorrect: false }
    ]
  },
  // LESSON 3 - Type 2: True/False
  {
    id: "q-302",
    lessonId: "l-3",
    type: "TRUE_FALSE",
    content: "Xác định tính Đúng / Sai về các phép duyệt cây nhị phân:",
    imageUrl: null,
    explanation: "Duyệt In-order (Nút trái -> Gốc -> Nút phải) trên BST thu được dãy số tăng dần.",
    options: [
      { id: "tf-301", key: "1", text: "Duyệt In-Order trên cây BST trả về danh sách các phần tử đã được sắp xếp tăng dần.", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-302", key: "2", text: "Duyệt Pre-Order thăm Nút Gốc trước khi thăm các cây con.", isCorrect: true, detectedColor: "#FF0000" },
      { id: "tf-303", key: "3", text: "Chiều cao của cây nhị phân hoàn hảo chứa N nút là O(N).", isCorrect: false, detectedColor: "#FF0000" },
      { id: "tf-304", key: "4", text: "Cây AVL là một dạng cây nhị phân tìm kiếm tự cân bằng.", isCorrect: true, detectedColor: "#FF0000" }
    ]
  },
  // LESSON 4 - Type 1: Multi Choice
  {
    id: "q-401",
    lessonId: "l-4",
    type: "MULTI_CHOICE",
    content: "Chọn 2 thuật toán tìm đường đi ngắn nhất trên đồ thị:",
    imageUrl: null,
    explanation: "Dijkstra và Bellman-Ford là hai thuật toán phổ biến để tìm đường đi ngắn nhất.",
    options: [
      { id: "opt-401", key: "A", text: "Dijkstra", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-402", key: "B", text: "Kruskal", isCorrect: false },
      { id: "opt-403", key: "C", text: "Bellman-Ford", isCorrect: true, detectedColor: "#FF0000" },
      { id: "opt-404", key: "D", text: "Prim", isCorrect: false }
    ]
  }
];

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
