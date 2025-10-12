from app.core.scheduler import parse_csv, group_by_course_section, backtrack_courses

SAMPLE = """Course,Section,Day,Start,End,Location
Algorithms,A1,Sun,10:00,12:00,Room 1
Algorithms,A1,Wed,10:00,12:00,Room 1
Algorithms,B1,Sun,08:30,10:00,Room 2
Algorithms,B1,Wed,08:30,10:00,Room 2
Data Structures,D1,Mon,12:00,14:00,Lab
Data Structures,D2,Mon,14:00,16:00,Lab
"""

def test_generate():
    blocks = parse_csv(SAMPLE)
    cs = group_by_course_section(blocks)
    courses = sorted(cs.keys())
    sols = []
    backtrack_courses(courses, cs, 0, {}, [], sols)
    assert len(sols) > 0
