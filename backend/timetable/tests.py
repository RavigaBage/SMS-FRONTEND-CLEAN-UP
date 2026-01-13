from django.test import TestCase
from django.utils import timezone
from accounts.models import SmsUser
from .models import (
    AcademicYear, Term, SchoolClass, Department, Subject,
    Teacher, TeachingAssignment, WeekDay, TimeSlot, TimetableEntry
)

class TimetableModelsTest(TestCase):
    def setUp(self):
        # Create a user for Teacher
        self.user = SmsUser.objects.create_user(username="teacher1", password="testpass")
        
        # Academic year and term
        self.academic_year = AcademicYear.objects.create(name="2025/2026", is_active=True)
        self.term = Term.objects.create(
            academic_year=self.academic_year,
            name="Term 1",
            start_date=timezone.now().date(),
            end_date=timezone.now().date()
        )
        
        # School class
        self.school_class = SchoolClass.objects.create(
            name="Grade 10A",
            academic_year=self.academic_year
        )
        
        # Department and subject
        self.department = Department.objects.create(name="Science")
        self.subject = Subject.objects.create(
            name="Biology",
            department=self.department,
            periods_per_week=5
        )
        
        # Teacher and assignment
        self.teacher = Teacher.objects.create(user=self.user, staff_id="T1001")
        self.assignment = TeachingAssignment.objects.create(
            teacher=self.teacher,
            subject=self.subject,
            school_class=self.school_class,
            academic_year=self.academic_year
        )
        
        # Weekday and timeslot
        self.weekday = WeekDay.objects.create(name="Monday", order=1)
        self.timeslot = TimeSlot.objects.create(
            start_time=timezone.now().time(),
            end_time=timezone.now().time(),
            is_break=False
        )
    
    def test_timetable_entry_creation(self):
        entry = TimetableEntry.objects.create(
            school_class=self.school_class,
            term=self.term,
            weekday=self.weekday,
            time_slot=self.timeslot,
            teaching_assignment=self.assignment,
            status="draft"
        )
        self.assertEqual(str(entry), f"{self.school_class} | {self.weekday} | {self.timeslot}")
        self.assertEqual(entry.teaching_assignment.teacher, self.teacher)
        self.assertEqual(entry.status, "draft")

    def test_unique_assignment_constraint(self):
        # Trying to create duplicate assignment for same teacher, subject, class
        with self.assertRaises(Exception):
            TeachingAssignment.objects.create(
                teacher=self.teacher,
                subject=self.subject,
                school_class=self.school_class
            )

    def test_subject_department_link(self):
        self.assertEqual(self.subject.department, self.department)
    
    def test_teacher_user_link(self):
        self.assertEqual(self.teacher.user.username, "teacher1")
