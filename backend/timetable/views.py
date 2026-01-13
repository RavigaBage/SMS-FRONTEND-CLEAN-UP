from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import (
    TimetableEntry,
    TeachingAssignment,
    SchoolClass,
    Term,
    WeekDay,
    TimeSlot
)

def check_teacher_double_booking(teacher, weekday, time_slot):
    return TimetableEntry.objects.filter(
        weekday=weekday,
        time_slot=time_slot,
        teaching_assignment__teacher=teacher
    ).exists()


def check_class_double_booking(school_class, weekday, time_slot):
    return TimetableEntry.objects.filter(
        school_class=school_class,
        weekday=weekday,
        time_slot=time_slot
    ).exists()


def detect_conflicts(school_class, teaching_assignment, weekday, time_slot):
    conflicts = []

    if check_class_double_booking(school_class, weekday, time_slot):
        conflicts.append("Class already has a subject in this slot")

    if check_teacher_double_booking(
        teaching_assignment.teacher, weekday, time_slot
    ):
        conflicts.append("Teacher is already assigned at this time")

    return conflicts

@require_http_methods(["POST"])
@transaction.atomic
def create_timetable_entry(request):
    data = request.POST

    school_class = SchoolClass.objects.get(id=data["school_class"])
    term = Term.objects.get(id=data["term"])
    weekday = WeekDay.objects.get(id=data["weekday"])
    time_slot = TimeSlot.objects.get(id=data["time_slot"])
    teaching_assignment = TeachingAssignment.objects.get(
        id=data["teaching_assignment"]
    )

    conflicts = detect_conflicts(
        school_class, teaching_assignment, weekday, time_slot
    )

    if conflicts:
        return JsonResponse({
            "status": "conflict",
            "conflicts": conflicts
        }, status=400)

    entry = TimetableEntry.objects.create(
        school_class=school_class,
        term=term,
        weekday=weekday,
        time_slot=time_slot,
        teaching_assignment=teaching_assignment,
        status="completed"
    )

    return JsonResponse({
        "status": "success",
        "entry_id": entry.id
    })

@require_http_methods(["PUT"])
@transaction.atomic
def update_timetable_entry(request, entry_id):
    data = request.POST
    entry = TimetableEntry.objects.select_for_update().get(id=entry_id)

    weekday = WeekDay.objects.get(id=data["weekday"])
    time_slot = TimeSlot.objects.get(id=data["time_slot"])
    teaching_assignment = TeachingAssignment.objects.get(
        id=data["teaching_assignment"]
    )

    conflicts = detect_conflicts(
        entry.school_class, teaching_assignment, weekday, time_slot
    )

    if conflicts:
        entry.status = "conflict"
        entry.save()
        return JsonResponse({
            "status": "conflict",
            "conflicts": conflicts
        }, status=400)

    entry.weekday = weekday
    entry.time_slot = time_slot
    entry.teaching_assignment = teaching_assignment
    entry.status = "completed"
    entry.save()

    return JsonResponse({"status": "updated"})

@require_http_methods(["DELETE"])
def delete_timetable_entry(request, entry_id):
    TimetableEntry.objects.filter(id=entry_id).delete()
    return JsonResponse({"status": "deleted"})

def get_class_timetable(request, class_id, term_id):
    timetable = TimetableEntry.objects.filter(
        school_class_id=class_id,
        term_id=term_id
    ).select_related(
        "weekday",
        "time_slot",
        "teaching_assignment__subject",
        "teaching_assignment__teacher"
    )

    data = [
        {
            "weekday": t.weekday.name,
            "time": str(t.time_slot),
            "subject": t.teaching_assignment.subject.name,
            "teacher": str(t.teaching_assignment.teacher),
        }
        for t in timetable
    ]

    return JsonResponse(data, safe=False)


def get_teacher_timetable(request, teacher_id, term_id):
    timetable = TimetableEntry.objects.filter(
        teaching_assignment__teacher_id=teacher_id,
        term_id=term_id
    )

    return JsonResponse(list(timetable.values()), safe=False)
