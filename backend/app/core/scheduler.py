from typing import List, Dict, Tuple, Optional
from .models import Block

DAY_ORDER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
DAY_TO_IDX = {d:i for i,d in enumerate(DAY_ORDER)}

HEB_TO_ENG = {
    "א": "Sun", "ראשון": "Sun", "יום א": "Sun",
    "ב": "Mon", "שני": "Mon", "יום ב": "Mon",
    "ג": "Tue", "שלישי": "Tue", "יום ג": "Tue",
    "ד": "Wed", "רביעי": "Wed", "יום ד": "Wed",
    "ה": "Thu", "חמישי": "Thu", "יום ה": "Thu",
    "ו": "Fri", "שישי": "Fri", "יום ו": "Fri",
    "ש": "Sat", "שבת": "Sat", "יום ש": "Sat",
}

def normalize_day(s: str) -> Optional[str]:
    if not s:
        return None
    s1 = s.strip()
    if s1 in DAY_TO_IDX:
        return s1
    s2 = s1[:3].capitalize()
    if s2 in DAY_TO_IDX:
        return s2
    s3 = s1.strip().lower()
    for k, v in HEB_TO_ENG.items():
        if s3 == k or s3 == k.lower():
            return v
    return None

def parse_hhmm(t: str) -> int:
    t = t.strip()
    h, m = t.split(":")
    return int(h) * 60 + int(m)

def fmt_hhmm(minutes: int) -> str:
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

def parse_csv(text: str) -> List[Block]:
    lines = [ln.strip() for ln in text.strip().splitlines() if ln.strip()]
    if not lines:
        return []
    # remove header if exists
    if lines[0].lower().startswith("course,section,day,start,end"):
        lines = lines[1:]
    blocks: List[Block] = []
    for i, ln in enumerate(lines, start=1):
        parts = [p.strip() for p in ln.split(",")]
        if len(parts) < 5:
            raise ValueError(f"שורה {i}: צריך לפחות 5 עמודות (Course, Section, Day, Start, End[, Location])")
        course, section, day_s, start_s, end_s = parts[:5]
        location = parts[5] if len(parts) >= 6 else ""
        day = normalize_day(day_s)
        if not day:
            raise ValueError(f"שורה {i}: יום לא תקין: {day_s}")
        try:
            start = parse_hhmm(start_s)
            end = parse_hhmm(end_s)
        except Exception:
            raise ValueError(f"שורה {i}: שעה לא תקינה (HH:MM): {start_s}, {end_s}")
        if end <= start:
            raise ValueError(f"שורה {i}: End חייב להיות אחרי Start")
        blocks.append(Block(course, section, day, start, end, location))
    return blocks

def group_by_course_section(blocks: List[Block]) -> Dict[str, Dict[str, List[Block]]]:
    # כל קורס-סוג (למשל Algorithms-הרצאה) ייחשב כישות נפרדת, רק מה שהוזן בפועל
        cs: Dict[str, Dict[str, List[Block]]] = {}
        for idx, b in enumerate(blocks):
            # רק בלוקים עם section לא ריק
            section_val = b.section.strip()
            if not section_val:
                continue
            course_type = f"{b.course.strip()}__{section_val}"
            cs.setdefault(course_type, {})[f"S{idx}"] = [b]
        return cs

def conflict(b1: Block, b2: Block) -> bool:
    if b1.day != b2.day:
        return False
    return b1.start < b2.end and b2.start < b1.end

def section_conflicts(current_blocks: List[Block], section_blocks: List[Block]) -> bool:
    for nb in section_blocks:
        for cb in current_blocks:
            if conflict(cb, nb):
                return True
    return False

def backtrack_courses(courses: List[str], cs: Dict[str, Dict[str, List[Block]]], i: int,
                      chosen: Dict[str, str], schedule_blocks: List[Block],
                      solutions: List[Tuple[Dict[str,str], List[Block]]], max_solutions: int = 2000):
    if len(solutions) >= max_solutions:
        return
    if i == len(courses):
        solutions.append((chosen.copy(), list(schedule_blocks)))
        return
    course = courses[i]
    sections = list(cs[course].keys())
    for sec in sections:
        blocks = cs[course][sec]
        if section_conflicts(schedule_blocks, blocks):
            continue
        chosen[course] = sec
        schedule_blocks.extend(blocks)
        backtrack_courses(courses, cs, i+1, chosen, schedule_blocks, solutions, max_solutions)
        for _ in range(len(blocks)):
            schedule_blocks.pop()
        del chosen[course]

def compute_metrics(blocks: List[Block], pref_earliest_h: int, pref_latest_h: int) -> Dict:
    by_day: Dict[str, List[Block]] = {}
    for b in blocks:
        by_day.setdefault(b.day, []).append(b)
    for arr in by_day.values():
        arr.sort(key=lambda x: x.start)
    num_days = len(by_day)
    total_gaps = 0
    earliest = 24*60
    latest = 0
    for arr in by_day.values():
        if arr:
            earliest = min(earliest, arr[0].start)
            latest = max(latest, arr[-1].end)
        for i in range(len(arr)-1):
            gap = max(0, arr[i+1].start - arr[i].end)
            total_gaps += gap
    if earliest == 24*60:
        earliest = 0
    early_pref_min = pref_earliest_h * 60
    late_pref_min = pref_latest_h * 60
    early_pen = max(0, early_pref_min - earliest)
    late_pen = max(0, latest - late_pref_min)
    score = num_days * 1000 + total_gaps + early_pen + late_pen
    return dict(
        num_days=num_days,
        total_gaps=total_gaps,
        earliest=earliest,
        latest=latest,
        score=score
    )

def blocks_to_dict(b: Block) -> dict:
    return dict(
        course=b.course, section=b.section, day=b.day,
        start=b.start, end=b.end, location=b.location
    )
