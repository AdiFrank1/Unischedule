from dataclasses import dataclass
from typing import Optional

@dataclass(frozen=True)
class Block:
    course: str
    section: str
    day: str      # "Sun".."Sat"
    start: int    # minutes from midnight
    end: int
    location: str = ""

    def as_tuple(self):
        return (self.day, self.start, self.end, self.course, self.section, self.location)
