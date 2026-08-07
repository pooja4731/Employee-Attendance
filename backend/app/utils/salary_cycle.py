from datetime import date, timedelta
from calendar import monthrange
 
 
def _next_month(year: int, month: int):
    if month == 12:
        return year + 1, 1
    return year, month + 1
 
 
def _prev_month(year: int, month: int):
    if month == 1:
        return year - 1, 12
    return year, month - 1
 
 
def get_salary_cycle(today: date, start_day: int):
    """
    Returns (cycle_start, cycle_end) for the salary cycle that `today`
    falls into, given the cycle start day configured in Settings.
 
    Example: start_day = 5  ->  5 Aug - 4 Sep, 5 Sep - 4 Oct, ...
    Example: start_day = 1  ->  1 Aug - 31 Aug (normal calendar month)
 
    Works for any month length (28/29/30/31) and leap years automatically,
    using calendar.monthrange instead of any hardcoded day counts.
    """
    year, month = today.year, today.month
 
    # Which month does the *current* cycle start in?
    if today.day >= start_day:
        start_year, start_month = year, month
    else:
        start_year, start_month = _prev_month(year, month)
 
    # Clamp start day to the last day of that month (e.g. start_day=31 in Feb)
    last_day_start_month = monthrange(start_year, start_month)[1]
    actual_start_day = min(start_day, last_day_start_month)
    cycle_start = date(start_year, start_month, actual_start_day)
 
    # The cycle ends the day before the *next* cycle would start.
    next_year, next_month = _next_month(start_year, start_month)
    last_day_next_month = monthrange(next_year, next_month)[1]
    actual_next_start_day = min(start_day, last_day_next_month)
    next_cycle_start = date(next_year, next_month, actual_next_start_day)
 
    cycle_end = next_cycle_start - timedelta(days=1)
 
    return cycle_start, cycle_end