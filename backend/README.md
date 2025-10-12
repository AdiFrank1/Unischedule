# UniSchedule Backend (FastAPI)

## Run (dev)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API base: `http://localhost:8000`

### Endpoint
- `POST /api/schedules/generate`
  - Body (JSON):
    ```json
    {
      "csv": "Course,Section,Day,Start,End,Location\nAlgorithms,A1,Sun,10:00,12:00,Room 1",
      "preferences": {"earliest": 9, "latest": 18, "limit": 10}
    }
    ```
  - Returns: list of valid, ranked schedules.
