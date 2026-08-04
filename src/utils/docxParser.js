import JSZip from 'jszip';

/**
 * Two-Pass Smart Docx Parser with Table Support
 *
 * Handles:
 *   - Dạng 1: A/B/C/D (trắc nghiệm đơn/nhiều đáp án - cả text đỏ toàn dòng)
 *   - Dạng 2: Đúng/Sai (có số thứ tự hoặc không có số, Đúng/Sai ở dòng riêng)
 *   - Dạng 3a: Điền khuyết inline (từ khóa đỏ trong đoạn văn)
 *   - Dạng 3b: Bảng Match (cột trái có ____, cột phải bôi đỏ là đáp án)
 *   - Dạng 3c: Bảng Phân loại (categorize - tiêu đề cột + cells đỏ)
 */
export async function parseDocxFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    const docXmlFile = zip.file("word/document.xml");
    if (!docXmlFile) throw new Error("File không chứa cấu trúc Word Document standard (.docx)");

    const xmlText = await docXmlFile.async("string");
    const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");
    const bodyEl = xmlDoc.getElementsByTagName("w:body")[0];
    if (!bodyEl) throw new Error("Không tìm thấy phần thân tài liệu (w:body)");

    // ─── PASS 1: Flatten body children into a typed node list ────────────────
    const nodes = [];
    const directChildren = Array.from(bodyEl.childNodes).filter(n =>
      n.nodeName === "w:p" || n.nodeName === "w:tbl"
    );

    for (const child of directChildren) {
      if (child.nodeName === "w:p") {
        const para = extractPara(child);
        if (para.text) nodes.push({ kind: "para", ...para });
      } else if (child.nodeName === "w:tbl") {
        const tableData = extractTable(child);
        nodes.push({ kind: "table", tableData });
      }
    }

    // ─── PASS 2: Build question list ──────────────────────────────────────────
    const questions = [];
    let i = 0;

    while (i < nodes.length) {
      const node = nodes[i];

      if (node.kind !== "para" || !node.isQuestion) {
        i++;
        continue;
      }

      // ── Extract question header ──────────────────────────────────────────
      const qHeaderMatch = node.text.match(/^(Câu\s*\d+|Câu hỏi\s*\d+)[\:\.]?\s*([\s\S]*)/i);
      let questionContent = qHeaderMatch ? qHeaderMatch[2].trim() : node.text;

      i++;

      // ── Accumulate multi-line question body ──────────────────────────────
      while (
        i < nodes.length &&
        nodes[i].kind === "para" &&
        !nodes[i].isQuestion &&
        !nodes[i].optADMatch &&
        !nodes[i].optNumMatch &&
        !nodes[i].isTFLabel &&
        !looksLikeOptionStart(nodes, i)
      ) {
        questionContent += "\n" + nodes[i].text;
        i++;
      }

      // ── Check for drag items list paragraph (semicolon-separated) ────────
      let explicitDragItems = [];
      if (
        i < nodes.length &&
        nodes[i].kind === "para" &&
        !nodes[i].isQuestion &&
        !nodes[i].optADMatch &&
        !nodes[i].optNumMatch &&
        nodes[i].text.includes(";")
      ) {
        explicitDragItems = nodes[i].text
          .split(";")
          .map(s => s.trim())
          .filter(Boolean);
        i++;
      }

      // ── A/B/C/D type ─────────────────────────────────────────────────────
      if (i < nodes.length && nodes[i].kind === "para" && nodes[i].optADMatch) {
        const options = [];
        while (i < nodes.length && nodes[i].kind === "para" && nodes[i].optADMatch) {
          let optBody = nodes[i].optADMatch.body;
          let isCorrect = nodes[i].isAllRed || nodes[i].anyRed;
          const optKey = nodes[i].optADMatch.key;
          i++;

          // Multi-line option accumulation
          while (
            i < nodes.length &&
            nodes[i].kind === "para" &&
            !nodes[i].optADMatch &&
            !nodes[i].isQuestion &&
            !nodes[i].isTFLabel &&
            !nodes[i].optNumMatch
          ) {
            optBody += "\n" + nodes[i].text;
            if (nodes[i].isAllRed || nodes[i].anyRed) isCorrect = true;
            i++;
          }

          options.push({ key: optKey, text: optBody, isCorrect, detectedColor: isCorrect ? "#FF0000" : "default" });
        }

        const correctCount = options.filter(o => o.isCorrect).length;
        const txtLower = questionContent.toLowerCase();
        let qType = "SINGLE_CHOICE";
        if (correctCount > 1 || txtLower.includes("chọn 2") || txtLower.includes("nhiều đáp án")) {
          qType = "MULTI_CHOICE";
        }

        questions.push({ rawText: node.text, content: questionContent, parsedType: qType, options });
        continue;
      }

      // ── Numbered True/False ───────────────────────────────────────────────
      if (i < nodes.length && nodes[i].kind === "para" && nodes[i].optNumMatch) {
        const options = [];
        while (i < nodes.length && nodes[i].kind === "para" && nodes[i].optNumMatch) {
          let optBody = nodes[i].optNumMatch.body;
          const optKey = nodes[i].optNumMatch.key;
          i++;

          // Multi-line option body
          while (
            i < nodes.length &&
            nodes[i].kind === "para" &&
            !nodes[i].optNumMatch &&
            !nodes[i].isQuestion &&
            !nodes[i].isTFLabel &&
            !nodes[i].optADMatch
          ) {
            optBody += "\n" + nodes[i].text;
            i++;
          }

          // Consume Đúng/Sai label
          let tfResult = false;
          if (i < nodes.length && nodes[i].kind === "para" && nodes[i].isTFLabel) {
            tfResult = nodes[i].tfValue;
            i++;
          }

          options.push({ key: optKey, text: optBody, isCorrect: tfResult, detectedColor: "#FF0000" });
        }

        questions.push({ rawText: node.text, content: questionContent, parsedType: "TRUE_FALSE", options });
        continue;
      }

      // ── Unnumbered True/False (text → Đúng/Sai on next line) ─────────────
      if (i < nodes.length && detectUnnumberedTFBlock(nodes, i)) {
        const options = [];
        let optKey = 1;
        while (i < nodes.length && nodes[i].kind === "para" && !nodes[i].isQuestion) {
          if (nodes[i].isTFLabel) { i++; continue; }
          if (nodes[i].optADMatch || nodes[i].optNumMatch) break;

          let optBody = nodes[i].text;
          i++;

          // Multi-line option body
          while (
            i < nodes.length &&
            nodes[i].kind === "para" &&
            !nodes[i].isTFLabel &&
            !nodes[i].isQuestion &&
            !nodes[i].optADMatch &&
            !nodes[i].optNumMatch
          ) {
            optBody += "\n" + nodes[i].text;
            i++;
          }

          let tfResult = false;
          if (i < nodes.length && nodes[i].kind === "para" && nodes[i].isTFLabel) {
            tfResult = nodes[i].tfValue;
            i++;
          }

          options.push({ key: String(optKey++), text: optBody, isCorrect: tfResult, detectedColor: "#FF0000" });
          if (i < nodes.length && nodes[i].kind === "para" && nodes[i].isQuestion) break;
        }

        questions.push({ rawText: node.text, content: questionContent, parsedType: "TRUE_FALSE", options });
        continue;
      }

      // ── TABLE-based Drag & Drop ───────────────────────────────────────────
      if (i < nodes.length && nodes[i].kind === "table") {
        const tableData = nodes[i].tableData;
        i++;

        const q = buildDragDropFromTable(node.text, questionContent, tableData, explicitDragItems);
        questions.push(q);
        continue;
      }

      // ── Inline Drag & Drop (red keywords in question text) ────────────────
      const allRedKeywords = [];
      let template = questionContent;
      node.runs.filter(r => r.isRed).forEach(r => {
        const kw = r.text.trim();
        if (kw && !["đúng", "sai"].includes(kw.toLowerCase())) {
          const blankId = `BLANK_${allRedKeywords.length}`;
          template = template.replace(kw, ` [${blankId}] `);
          allRedKeywords.push({ blankId, answer: kw });
        }
      });

      if (allRedKeywords.length > 0) {
        questions.push({
          rawText: node.text,
          content: questionContent,
          parsedType: "DRAG_DROP",
          dragMode: "inline",
          renderedTemplate: template,
          extractedBlanks: allRedKeywords,
          dragItems: allRedKeywords.map(b => b.answer),
          correctAnswers: Object.fromEntries(allRedKeywords.map(b => [b.blankId, b.answer]))
        });
        continue;
      }

      // Fallback
      questions.push({ rawText: node.text, content: questionContent, parsedType: "SINGLE_CHOICE", options: [] });
    }

    if (questions.length === 0) return generateFallbackFromText(nodes.filter(n => n.kind === "para").map(n => n.text).join("\n"));
    return questions;

  } catch (err) {
    console.error("Docx parsing error:", err);
    throw err;
  }
}

// ─── Build DRAG_DROP question from a Word table ──────────────────────────────
function buildDragDropFromTable(rawText, questionContent, tableData, explicitDragItems) {
  const rows = tableData.rows;
  if (rows.length === 0) {
    return { rawText, content: questionContent, parsedType: "DRAG_DROP", dragMode: "inline", renderedTemplate: questionContent, extractedBlanks: [], dragItems: [], correctAnswers: {} };
  }

  const firstRow = rows[0];

  // Check if left cells in rows contain blank markers like ____ or _____
  const hasBlankMarkers = rows.some(r => r[0] && /_{2,}|___+|\[.*?\]/.test(r[0].text));

  if (!hasBlankMarkers && firstRow.length >= 2 && rows.length >= 2) {
    // ── CATEGORIZE TABLE (Câu 13 type) ──────────────────────────────────────
    const headers = firstRow.map(cell => cell.text.trim());
    const columns = headers.map((h, colIdx) => ({
      header: h,
      items: []
    }));

    // Collect ONLY red text items from subsequent rows
    let totalRedItems = 0;
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      row.forEach((cell, colIdx) => {
        if (colIdx < columns.length) {
          cell.redTexts.forEach(rt => {
            const cleanText = rt.trim();
            if (cleanText && !columns[colIdx].items.includes(cleanText)) {
              columns[colIdx].items.push(cleanText);
              totalRedItems++;
            }
          });
        }
      });
    }

    // Fallback: If no red texts found in row >= 1, collect all text paragraphs from row >= 1
    if (totalRedItems === 0) {
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        row.forEach((cell, colIdx) => {
          if (colIdx < columns.length && cell.text.trim()) {
            const lines = cell.text.split('\n').map(l => l.trim()).filter(Boolean);
            lines.forEach(line => {
              if (line && !columns[colIdx].items.includes(line)) {
                columns[colIdx].items.push(line);
              }
            });
          }
        });
      }
    }

    // Build drag items and blanks
    const allItems = columns.flatMap(col => col.items);
    const correctAnswers = {};
    const extractedBlanks = [];
    columns.forEach((col, colIdx) => {
      col.items.forEach((item, itemIdx) => {
        const blankId = `COL_${colIdx}_ITEM_${itemIdx}`;
        correctAnswers[blankId] = item;
        extractedBlanks.push({ blankId, answer: item, targetColumn: colIdx, columnHeader: col.header });
      });
    });

    return {
      rawText,
      content: questionContent,
      parsedType: "DRAG_DROP",
      dragMode: "categorize",
      columns,
      extractedBlanks,
      dragItems: shuffleArray([...allItems]),
      correctAnswers,
      renderedTemplate: questionContent
    };
  }

  // ── MATCH TABLE (Câu 12 type): left=blank text, right=red answer ──────────
  const matchPairs = [];
  const extractedBlanks = [];
  const correctAnswers = {};

  for (const row of rows) {
    if (row.length < 2) continue;
    const leftCell = row[0];
    const rightCell = row[row.length - 1];

    const leftText = leftCell.text.trim();
    const rightAnswer = rightCell.redTexts.join("").trim() || rightCell.text.trim();

    if (!leftText || !rightAnswer) continue;

    const blankId = `BLANK_${matchPairs.length}`;
    const leftWithBlank = leftText.replace(/_{2,}|___+|\[.*?\]/g, `[${blankId}]`);

    matchPairs.push({ leftText, leftWithBlank, rightAnswer, blankId });
    extractedBlanks.push({ blankId, answer: rightAnswer });
    correctAnswers[blankId] = rightAnswer;
  }

  const dragItemsFromAnswers = matchPairs.map(p => p.rightAnswer);
  const dragItems = explicitDragItems.length > 0
    ? explicitDragItems
    : shuffleArray([...new Set(dragItemsFromAnswers)]);

  return {
    rawText,
    content: questionContent,
    parsedType: "DRAG_DROP",
    dragMode: "match",
    matchPairs,
    extractedBlanks,
    dragItems,
    correctAnswers,
    renderedTemplate: questionContent
  };
}

// ─── Extract a paragraph node from w:p element ───────────────────────────────
function extractPara(pEl) {
  const runs = Array.from(pEl.getElementsByTagName("w:r"));

  const pPr = pEl.getElementsByTagName("w:pPr")[0];
  let pRed = false;
  if (pPr) {
    const pColor = getAttr(pPr, "w:color", "w:val");
    const pHighlight = getAttr(pPr, "w:highlight", "w:val");
    if (isRedColor(pColor) || isRedHighlight(pHighlight)) {
      pRed = true;
    }
  }

  let fullText = "";
  const runObjs = [];
  let anyRed = pRed;
  let totalLen = 0;
  let redLen = 0;

  for (const r of runs) {
    const tEls = Array.from(r.getElementsByTagName("w:t"));
    const rText = tEls.map(t => t.textContent).join("");
    if (!rText) continue;

    const colorVal = getAttr(r, "w:color", "w:val");
    const highlightVal = getAttr(r, "w:highlight", "w:val");
    const isRed = pRed || isRedColor(colorVal) || isRedHighlight(highlightVal);

    runObjs.push({ text: rText, isRed });
    fullText += rText;
    totalLen += rText.length;
    if (isRed) { redLen += rText.length; anyRed = true; }
  }

  const text = fullText.trim();
  const isAllRed = totalLen > 0 && (redLen / totalLen) >= 0.85;
  const textLower = text.toLowerCase().trim();
  const isTFLabel = textLower === "đúng" || textLower === "sai";
  const optADMatch = text.match(/^([A-D])[\.\)\:\-]\s+([\s\S]+)/i);
  const optNumMatch = text.match(/^(\d+)[\.\)]\s+([\s\S]+)/);
  const isQuestion = /^(Câu\s*\d+|Câu hỏi\s*\d+)[\:\.]?\s*/i.test(text);

  return {
    text,
    runs: runObjs,
    anyRed,
    isAllRed,
    isTFLabel,
    tfValue: isTFLabel ? (textLower === "đúng" ? true : false) : null,
    optADMatch: optADMatch ? { key: optADMatch[1].toUpperCase(), body: optADMatch[2].trim() } : null,
    optNumMatch: optNumMatch ? { key: optNumMatch[1], body: optNumMatch[2].trim() } : null,
    isQuestion,
  };
}

// ─── Extract a table from w:tbl element ─────────────────────────────────────
function extractTable(tblEl) {
  const rows = [];

  const directChildren = Array.from(tblEl.childNodes);
  const trEls = [];
  for (const child of directChildren) {
    if (child.nodeName === 'w:tr') {
      trEls.push(child);
    } else if (child.nodeName !== 'w:tblPr' && child.nodeName !== 'w:tblGrid') {
      const subTrs = Array.from(child.childNodes || []).filter(n => n.nodeName === 'w:tr');
      trEls.push(...subTrs);
    }
  }

  for (const tr of trEls) {
    const rowCells = [];
    const tcEls = Array.from(tr.childNodes).filter(n => n.nodeName === 'w:tc');

    for (const tc of tcEls) {
      let cellText = '';
      let hasRed = false;
      const redTexts = [];

      const pEls = Array.from(tc.childNodes).filter(n => n.nodeName === 'w:p');
      for (const p of pEls) {
        const pData = extractPara(p);
        if (!pData.text) continue;

        cellText += (cellText ? '\n' : '') + pData.text;

        if (pData.anyRed) {
          hasRed = true;
          const paraRedText = pData.runs
            .filter(r => r.isRed)
            .map(r => r.text)
            .join('')
            .trim();
          if (paraRedText) {
            redTexts.push(paraRedText);
          } else if (pData.anyRed) {
            redTexts.push(pData.text.trim());
          }
        }
      }

      rowCells.push({ text: cellText.trim(), hasRed, redTexts });
    }

    if (rowCells.length > 0 && rowCells.some(c => c.text.trim())) {
      rows.push(rowCells);
    }
  }

  return { rows };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAttr(node, childTag, attrName) {
  const children = node.getElementsByTagName(childTag);
  return children.length > 0 ? children[0].getAttribute(attrName) : null;
}

function isRedColor(val) {
  if (!val) return false;
  const v = val.toUpperCase().trim();
  if (v === "RED" || v === "DARKRED" || v === "MAGENTA") return true;

  const redPrefixes = ["FF0", "F43", "F44", "EF4", "E53", "DC2", "D32", "C62", "B91", "CC0", "C00", "E00", "D90", "E60", "ED1", "CE1", "A61", "990"];
  if (redPrefixes.some(p => v.startsWith(p))) return true;

  if (/^[0-9A-F]{6}$/.test(v)) {
    const r = parseInt(v.substring(0, 2), 16);
    const g = parseInt(v.substring(2, 4), 16);
    const b = parseInt(v.substring(4, 6), 16);
    if (r > 130 && r > g + 35 && r > b + 35) {
      return true;
    }
  }
  return false;
}

function isRedHighlight(val) {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  return v === "red" || v === "darkred" || v === "magenta";
}

function detectUnnumberedTFBlock(nodes, i) {
  let idx = i;
  let tfCount = 0;
  while (idx < nodes.length && nodes[idx].kind === "para" && !nodes[idx].isQuestion) {
    if (nodes[idx].isTFLabel) tfCount++;
    if (nodes[idx].optADMatch || nodes[idx].optNumMatch) break;
    idx++;
    if (tfCount >= 2) return true;
  }
  return false;
}

function looksLikeOptionStart(nodes, i) {
  if (i >= nodes.length || nodes[i].kind !== "para") return false;
  return nodes[i].optADMatch !== null || nodes[i].optNumMatch !== null || detectUnnumberedTFBlock(nodes, i);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateFallbackFromText(rawText) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  let cur = null;

  lines.forEach(line => {
    if (/^(câu|câu hỏi)\s*\d+/i.test(line)) {
      if (cur) result.push(cur);
      cur = { rawText: line, content: line, options: [], parsedType: "SINGLE_CHOICE" };
    } else if (cur && /^[A-D][\.\)]/i.test(line)) {
      cur.options.push({ key: line[0].toUpperCase(), text: line.slice(2).trim(), isCorrect: false });
    }
  });

  if (cur) result.push(cur);
  return result;
}
