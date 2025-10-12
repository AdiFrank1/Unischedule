// יצירת טבלת מערכת שבועית: כל שורה היא שעת התחלה או סיום של שיעור בפועל בלבד, עם צבע שונה לכל קורס
function renderWeeklyTable(blocks) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
  const daysHeb = {Sun: "א'", Mon: "ב'", Tue: "ג'", Wed: "ד'", Thu: "ה'", Fri: "ו'"};
  // צבע שונה לכל קורס
  const courseNames = Array.from(new Set(blocks.map(b => b.course)));
  const courseColor = name => `course-color-${courseNames.indexOf(name) % 8}`;
  // מציאת כל שעת התחלה או סיום ייחודית כלשהי (מכל הימים)
  let timesSet = new Set();
  blocks.forEach(b => { timesSet.add(b.start); timesSet.add(b.end); });
  let times = Array.from(timesSet).sort((a, b) => a - b);
  // בניית טבלה
  const table = document.createElement("table");
  table.className = "weekly-grid";
  // Header
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  trh.appendChild(document.createElement("th")); // ריק לשעות
  days.forEach(d => {
    const th = document.createElement("th");
    th.textContent = `יום ${daysHeb[d]}`;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  // Body
  const tbody = document.createElement("tbody");
  // ניהול תאים "תפוסים" ע"י rowspan
  const skip = {};
  for (let i = 0; i < times.length - 1; i++) {
    const t = times[i];
    const nextT = times[i+1];
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = fmtTime(t);
    th.style.fontWeight = "normal";
    tr.appendChild(th);
    days.forEach(d => {
      skip[d] = skip[d] || 0;
      if (skip[d] > 0) {
        skip[d]--;
        return;
      }
      // חפש שיעור שמתחיל בדיוק עכשיו
      const found = blocks.find(b => b.day === d && b.start === t);
      if (found) {
        // rowspan לפי הזמן עד סוף השיעור או עד תחילת שיעור אחר
        let span = 1;
        let j = i+1;
        while (j < times.length && times[j] < found.end) { span++; j++; }
        skip[d] = span - 1;
        const td = document.createElement("td");
        td.rowSpan = span;
        td.className = courseColor(found.course);
        td.style.verticalAlign = "top";
        td.style.fontSize = "0.98em";
        td.innerHTML = `<b>${found.course}</b> <span style='font-size:0.9em'>(${found.section})</span><br>${found.location ? found.location + '<br>' : ''}${fmtTime(found.start)}-${fmtTime(found.end)}`;
        tr.appendChild(td);
      } else {
        // בדוק אם "בתוך" שיעור אחר
        const inside = blocks.some(b => b.day === d && b.start < t && b.end > t);
        if (!inside) {
          const td = document.createElement("td");
          tr.appendChild(td);
        }
      }
    });
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

const $ = (sel) => document.querySelector(sel);
const API = "http://localhost:8000/api/schedules/generate";

// --- טבלת קלט דינמית ---
const columns = [
  { key: "Course", label: "קורס" },
  { key: "Section", label: "סוג (הרצאה/תרגול)" },
  { key: "Day", label: "יום" },
  { key: "Start", label: "התחלה" },
  { key: "End", label: "סיום" },
  { key: "Location", label: "מיקום" },
];

let inputRows = [
  { Course: "Algorithms", Section: "", Day: "Sun", Start: "10:00", End: "12:00", Location: "Building A 101" },
  { Course: "Algorithms", Section: "", Day: "Wed", Start: "10:00", End: "12:00", Location: "Building A 101" },
  { Course: "Algorithms", Section: "", Day: "Sun", Start: "08:30", End: "10:00", Location: "Building B 202" },
  { Course: "Algorithms", Section: "", Day: "Wed", Start: "08:30", End: "10:00", Location: "Building B 202" },
  { Course: "Data Structures", Section: "", Day: "Mon", Start: "12:00", End: "14:00", Location: "Comp Lab" },
  { Course: "Data Structures", Section: "", Day: "Mon", Start: "14:00", End: "16:00", Location: "Comp Lab" },
  { Course: "Linear Algebra", Section: "", Day: "Tue", Start: "09:00", End: "11:00", Location: "Room 12" },
  { Course: "Linear Algebra", Section: "", Day: "Thu", Start: "09:00", End: "11:00", Location: "Room 12" },
  { Course: "Linear Algebra", Section: "", Day: "Tue", Start: "11:00", End: "13:00", Location: "Room 15" },
  { Course: "Linear Algebra", Section: "", Day: "Thu", Start: "11:00", End: "13:00", Location: "Room 15" },
];

function renderInputTable() {
  const root = $("#input-table");
  root.innerHTML = "";
  const table = document.createElement("table");
  table.className = "table";
  // Header
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  // עמודת מחק ראשונה
  const thDel = document.createElement("th");
  thDel.textContent = "";
  trh.appendChild(thDel);
  columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  // Body
  const tbody = document.createElement("tbody");
  inputRows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    // עמודת מחק ראשונה
    const tdDel = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.textContent = "🗑️";
    btnDel.title = "מחק שורה";
    btnDel.style.background = "none";
    btnDel.style.border = "none";
    btnDel.style.cursor = "pointer";
    btnDel.addEventListener("click", () => {
      inputRows.splice(idx, 1);
      renderInputTable();
    });
    tdDel.appendChild(btnDel);
    tr.appendChild(tdDel);
    columns.forEach(col => {
      const td = document.createElement("td");
      if (col.key === "Section") {
        const sel = document.createElement("select");
          const emptyOpt = document.createElement("option");
          emptyOpt.value = "";
          emptyOpt.textContent = "";
          sel.appendChild(emptyOpt);
          ["הרצאה", "תרגול"].forEach(optVal => {
            const opt = document.createElement("option");
            opt.value = optVal;
            opt.textContent = optVal;
            sel.appendChild(opt);
          });
          sel.value = row[col.key] || "";
        sel.style.width = "100%";
        sel.addEventListener("change", () => {
          inputRows[idx][col.key] = sel.value;
        });
        td.appendChild(sel);
      } else if (col.key === "Day") {
        const sel = document.createElement("select");
        const days = [
          { val: "Sun", label: "ראשון" },
          { val: "Mon", label: "שני" },
          { val: "Tue", label: "שלישי" },
          { val: "Wed", label: "רביעי" },
          { val: "Thu", label: "חמישי" },
          { val: "Fri", label: "שישי" }
        ];
        days.forEach(d => {
          const opt = document.createElement("option");
          opt.value = d.val;
          opt.textContent = d.label;
          sel.appendChild(opt);
        });
        sel.value = row[col.key] || "Sun";
        sel.style.width = "100%";
        sel.addEventListener("change", () => {
          inputRows[idx][col.key] = sel.value;
        });
        td.appendChild(sel);
      } else {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.value = row[col.key];
        inp.style.width = "100%";
        inp.addEventListener("input", e => {
          inputRows[idx][col.key] = inp.value;
        });
        td.appendChild(inp);
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);
  // Add row button
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+ הוסף שורה";
  addBtn.className = "add-row-btn";
  addBtn.addEventListener("click", () => {
    inputRows.push({ Course: "", Section: "", Day: "", Start: "", End: "", Location: "" });
    renderInputTable();
  });
  root.appendChild(addBtn);
}

function tableToCSV() {
  const header = columns.map(c => c.key).join(",");
  // סינון שורות ריקות או ללא סוג
  const rows = inputRows
    .filter(row => row.Course && row.Section && row.Day && row.Start && row.End)
    .map(row => columns.map(c => row[c.key]).join(","));
  return [header, ...rows].join("\n");
}


// הוספת select לסינון לפי כמות ימים
window.addEventListener("DOMContentLoaded", () => {
  renderInputTable();
  const filterDiv = document.createElement("div");
  filterDiv.style.margin = "16px 0 8px 0";
  filterDiv.style.display = "flex";
  filterDiv.style.alignItems = "center";
  filterDiv.style.gap = "10px";
  filterDiv.innerHTML = `
    <label style="font-weight:500;">סנן לפי מספר ימים:
      <select id="days-filter">
        <option value="">הצג הכל</option>
        <option value="3">3 ימים</option>
        <option value="4">4 ימים</option>
        <option value="5">5 ימים</option>
        <option value="6">6 ימים</option>
      </select>
    </label>
  `;
  const resultsSection = document.querySelector("#results");
  if (resultsSection && resultsSection.parentNode) {
    resultsSection.parentNode.insertBefore(filterDiv, resultsSection);
  }
});

$("#generate").addEventListener("click", async () => {
  $("#error").textContent = "";
  $("#results").innerHTML = "";

  // בדיקת כפילויות מוחלטות
  const seen = new Set();
  let hasDuplicate = false;
  for (const row of inputRows) {
    const key = columns.map(c => (row[c.key] || "").trim()).join("||");
    if (seen.has(key)) {
      hasDuplicate = true;
      break;
    }
    seen.add(key);
  }
  if (hasDuplicate) {
    $("#error").textContent = "יש שורות זהות לחלוטין — מחק או ערוך אחת מהן.";
    return;
  }

  const csv = tableToCSV();
  const earliest = parseInt($("#earliest").value, 10);
  const latest = parseInt($("#latest").value, 10);
  const limit = parseInt($("#limit").value, 10);
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv, preferences: { earliest, latest, limit } }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Server error");
    }
    const data = await res.json();
    renderResults(data);
  } catch (e) {
    $("#error").textContent = e.message;
  }
});

function fmtTime(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}


function renderResults(data) {
  const root = $("#results");
  root.innerHTML = "";
  // קבלת ערך הסינון
  const daysFilter = document.getElementById("days-filter");
  let filterVal = daysFilter && daysFilter.value ? parseInt(daysFilter.value, 10) : null;
  let filtered = data.solutions;
  if (filterVal) {
    filtered = filtered.filter(sol => sol.metrics.num_days === filterVal);
  }
  // מיון לפי score (הכי טובים למעלה)
  filtered = filtered.slice().sort((a, b) => a.metrics.score - b.metrics.score);
  // הגבלת top N
  const limit = parseInt($("#limit").value, 10) || 10;
  filtered = filtered.slice(0, limit);


  const header = document.createElement("div");
  header.className = "card";
  header.innerHTML = `<h2>נמצאו ${filtered.length} מערכות תקינות${filterVal ? ` (${filterVal} ימים)` : ""} • מציגות ${filtered.length}</h2>`;
  root.appendChild(header);

  // סדר ימים קבוע
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  filtered.forEach((sol, i) => {
    const card = document.createElement("div");
    card.className = "result-card";
    const choiceStr = Object.entries(sol.choice).map(([c, s]) => `${c}: ${s}`).join(", ");
    const m = sol.metrics;
    card.innerHTML = `
      <h3>פתרון #${i+1}
        <span class="badge">ימים: ${m.num_days}</span>
        <span class="badge">פערים: ${Math.floor(m.total_gaps/60)}h ${(m.total_gaps%60).toString().padStart(2,"0")}m</span>
        <span class="badge">התחלה: ${fmtTime(m.earliest)}</span>
        <span class="badge">סיום: ${fmtTime(m.latest)}</span>
      </h3>
      <div class="meta">בחירת מקצים: ${choiceStr}</div>
      <button class="print-btn export-pdf-btn">� ייצוא ל-PDF</button>
      <table class="table">
        <thead>
          <tr><th>Course</th><th>Section</th><th>Day</th><th>Start</th><th>End</th><th>Location</th></tr>
        </thead>
        <tbody>
          ${sol.blocks
            .slice()
            .sort((a, b) => {
              const dayA = dayOrder.indexOf(a.day);
              const dayB = dayOrder.indexOf(b.day);
              if (dayA !== dayB) return dayA - dayB;
              return a.start - b.start;
            })
            .map(b => `<tr>
              <td>${b.course}</td>
              <td>${b.section === 'תרגול' || b.section === 'הרצאה' ? b.section : ''}</td>
              <td>${b.day}</td>
              <td>${fmtTime(b.start)}</td>
              <td>${fmtTime(b.end)}</td>
              <td>${b.location||""}</td>
            </tr>`).join("")}
        </tbody>
      </table>
    `;
    // הוספת טבלת מערכת שבועית
    const weeklyTable = renderWeeklyTable(sol.blocks);
    card.appendChild(weeklyTable);
    // ייצוא ל-PDF רק של המערכת השבועית
    setTimeout(() => {
      const btn = card.querySelector('.export-pdf-btn');
      if (btn && window.jspdf && window.html2canvas) {
        btn.onclick = async () => {
          btn.disabled = true;
          btn.textContent = 'מייצא...';
          const element = weeklyTable;
          const canvas = await window.html2canvas(element, {scale:2, backgroundColor:'#fff'});
          const imgData = canvas.toDataURL('image/png');
          const pdf = new window.jspdf.jsPDF({orientation:'landscape', unit:'pt', format:'a4'});
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pageWidth - 40;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
          pdf.save('schedule.pdf');
          btn.textContent = '📄 ייצוא ל-PDF';
          btn.disabled = false;
        };
      }
    }, 0);
    root.appendChild(card);
  });
// כפתור חזור לראש העמוד
function addBackToTopBtn() {
  if (document.getElementById('back-to-top')) return;
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.title = 'חזור לראש העמוד';
  btn.innerHTML = '↑';
  btn.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 200 ? 'flex' : 'none';
  });
}
addBackToTopBtn();
// עיצוב בסיסי למערכת שבועית
const style = document.createElement('style');
style.innerHTML = `
.weekly-grid { border-collapse: collapse; width: 100%; margin: 18px 0 8px 0; background: #f8fafc; }
.weekly-grid th, .weekly-grid td { border: 1px solid #e5e7eb; padding: 6px 4px; text-align: center; min-width: 80px; }
.weekly-grid th { background: #e0e7ff; font-weight: 600; }
.weekly-grid td { background: #fff; }
.weekly-grid td[rowspan] { background: #eef2ff; font-weight: 500; color: #3730a3; }
`;
document.head.appendChild(style);

  // שינוי סינון - רנדר מחדש
  const daysFilterEl = document.getElementById("days-filter");
  if (daysFilterEl && !daysFilterEl._bound) {
    daysFilterEl.addEventListener("change", () => renderResults(data));
    daysFilterEl._bound = true;
  }


}
