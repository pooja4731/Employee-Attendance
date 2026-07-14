from datetime import datetime, date


def today_str() -> str:
    return date.today().isoformat()


def now_time_str() -> str:
    return datetime.now().strftime("%I:%M %p")


def parse_hms(check_in_iso: str, check_out_iso: str) -> float:
    t_in = datetime.fromisoformat(check_in_iso)
    t_out = datetime.fromisoformat(check_out_iso)
    delta = t_out - t_in
    return round(delta.total_seconds() / 3600, 2)


def format_hours(hours: float) -> str:
    h = int(hours)
    m = int(round((hours - h) * 60))
    return f"{h}h {m:02d}m"


def compute_status(hours: float) -> str:
    if hours <= 0:
        return "Absent"
    if hours < 5:
        return "Half Day"
    return "Present"
