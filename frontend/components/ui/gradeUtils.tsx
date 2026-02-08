"""
Utility functions for academic operations
"""
from decimal import Decimal
from typing import Dict, List, Tuple
from django.db.models import Avg, Count, Q
from apps.academics.models import Grade, Class, Enrollment


class GradeCalculator:
    """Utility class for grade calculations"""
    
    # Grade scale configuration (can be customized per institution)
    GRADE_SCALE = {
        'A+': (90, 100),
        'A': (85, 89.99),
        'A-': (80, 84.99),
        'B+': (75, 79.99),
        'B': (70, 74.99),
        'B-': (65, 69.99),
        'C+': (60, 64.99),
        'C': (55, 59.99),
        'C-': (50, 54.99),
        'D+': (45, 49.99),
        'D': (40, 44.99),
        'F': (0, 39.99)
    }
    
    GRADE_POINTS = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
    
    # Weighting configuration (Assessment: 30%, Test: 20%, Exam: 50%)
    WEIGHTS = {
        'assessment': 30,
        'test': 20,
        'exam': 50
    }
    
    @classmethod
    def calculate_weighted_scores(cls, grade_obj) -> Dict[str, Decimal]:
        """
        Calculate weighted scores for assessment, test, and exam
        Returns dict with weighted values
        """
        weighted = {
            'weighted_assessment': Decimal('0'),
            'weighted_test': Decimal('0'),
            'weighted_exam': Decimal('0')
        }
        
        if grade_obj.assessment_total > 0:
            percentage = (grade_obj.assessment_score / grade_obj.assessment_total)
            weighted['weighted_assessment'] = percentage * cls.WEIGHTS['assessment']
        
        if grade_obj.test_total > 0:
            percentage = (grade_obj.test_score / grade_obj.test_total)
            weighted['weighted_test'] = percentage * cls.WEIGHTS['test']
        
        if grade_obj.exam_total > 0:
            percentage = (grade_obj.exam_score / grade_obj.exam_total)
            weighted['weighted_exam'] = percentage * cls.WEIGHTS['exam']
        
        return weighted
    
    @classmethod
    def calculate_total_score(cls, weighted_scores: Dict[str, Decimal]) -> Decimal:
        """Calculate total score from weighted components"""
        return sum(weighted_scores.values())
    
    @classmethod
    def get_grade_letter(cls, total_score: float) -> str:
        """Convert numerical score to letter grade"""
        for letter, (min_score, max_score) in cls.GRADE_SCALE.items():
            if min_score <= total_score <= max_score:
                return letter
        return 'F'
    
    @classmethod
    def calculate_gpa(cls, grades: List[Grade]) -> float:
        """Calculate GPA from a list of grades"""
        if not grades:
            return 0.0
        
        total_points = sum(
            cls.GRADE_POINTS.get(grade.grade_letter, 0)
            for grade in grades
        )
        
        return round(total_points / len(grades), 2)
    
    @classmethod
    def get_grade_distribution(cls, grades: List[Grade]) -> Dict[str, int]:
        """Get count of each grade letter"""
        distribution = {letter: 0 for letter in cls.GRADE_SCALE.keys()}
        
        for grade in grades:
            if grade.grade_letter in distribution:
                distribution[grade.grade_letter] += 1
        
        return distribution


class TranscriptGenerator:
    """Utility class for generating transcript data"""
    
    @staticmethod
    def get_student_transcript_data(student, academic_year=None, term=None) -> Dict:
        """
        Generate comprehensive transcript data for a student
        """
        grades_query = student.grades.select_related('subject', 'class_obj')
        
        if academic_year:
            grades_query = grades_query.filter(academic_year=academic_year)
        if term:
            grades_query = grades_query.filter(term=term)
        
        grades = list(grades_query)
        
        return {
            'student_info': {
                'id': student.id,
                'student_id': student.student_id,
                'full_name': f"{student.first_name} {student.last_name}",
                'email': student.email,
                'status': student.status
            },
            'academic_info': {
                'gpa': GradeCalculator.calculate_gpa(grades),
                'total_subjects': len(grades),
                'grade_distribution': GradeCalculator.get_grade_distribution(grades)
            },
            'grades': grades
        }
    
    @staticmethod
    def get_class_performance_summary(class_obj) -> Dict:
        """
        Generate performance summary for an entire class
        """
        grades = Grade.objects.filter(class_obj=class_obj)
        students = class_obj.enrollments.select_related('student')
        
        avg_score = grades.aggregate(Avg('total_score'))['total_score__avg'] or 0
        
        return {
            'class_name': class_obj.class_name,
            'academic_year': class_obj.academic_year,
            'total_students': students.count(),
            'active_students': students.filter(student__status='active').count(),
            'average_score': round(avg_score, 2),
            'grade_distribution': GradeCalculator.get_grade_distribution(list(grades))
        }


class AcademicReportGenerator:
    """Generate various academic reports"""
    
    @staticmethod
    def generate_term_report(student, academic_year: str, term: str) -> Dict:
        """Generate a term report for a student"""
        grades = Grade.objects.filter(
            student=student,
            academic_year=academic_year,
            term=term
        ).select_related('subject')
        
        grades_list = list(grades)
        
        return {
            'student': f"{student.first_name} {student.last_name}",
            'academic_year': academic_year,
            'term': term,
            'subjects': [
                {
                    'subject_name': grade.subject.subject_name,
                    'subject_code': grade.subject.subject_code,
                    'assessment': f"{grade.assessment_score}/{grade.assessment_total}",
                    'test': f"{grade.test_score}/{grade.test_total}",
                    'exam': f"{grade.exam_score}/{grade.exam_total}",
                    'total_score': float(grade.total_score),
                    'grade': grade.grade_letter
                }
                for grade in grades_list
            ],
            'summary': {
                'total_subjects': len(grades_list),
                'gpa': GradeCalculator.calculate_gpa(grades_list),
                'average_score': sum(float(g.total_score) for g in grades_list) / len(grades_list) if grades_list else 0
            }
        }
    
    @staticmethod
    def generate_class_ranking(class_obj, academic_year: str, term: str) -> List[Dict]:
        """
        Generate ranking of students in a class for a specific term
        """
        students = class_obj.enrollments.select_related('student').values_list('student_id', flat=True)
        
        rankings = []
        for student_id in students:
            grades = Grade.objects.filter(
                student_id=student_id,
                academic_year=academic_year,
                term=term
            )
            
            avg_score = grades.aggregate(Avg('total_score'))['total_score__avg'] or 0
            gpa = GradeCalculator.calculate_gpa(list(grades))
            
            rankings.append({
                'student_id': student_id,
                'average_score': round(avg_score, 2),
                'gpa': gpa
            })
        
        # Sort by average score (descending)
        rankings.sort(key=lambda x: x['average_score'], reverse=True)
        
        # Add rank
        for idx, ranking in enumerate(rankings, 1):
            ranking['rank'] = idx
        
        return rankings


def validate_grade_data(grade_data: Dict) -> Tuple[bool, List[str]]:
    """
    Validate grade data before saving
    Returns (is_valid, error_messages)
    """
    errors = []
    
    # Check that scores don't exceed totals
    if grade_data.get('assessment_score', 0) > grade_data.get('assessment_total', 0):
        errors.append("Assessment score cannot exceed assessment total")
    
    if grade_data.get('test_score', 0) > grade_data.get('test_total', 0):
        errors.append("Test score cannot exceed test total")
    
    if grade_data.get('exam_score', 0) > grade_data.get('exam_total', 0):
        errors.append("Exam score cannot exceed exam total")
    
    # Check for negative values
    numeric_fields = [
        'assessment_score', 'assessment_total',
        'test_score', 'test_total',
        'exam_score', 'exam_total'
    ]
    
    for field in numeric_fields:
        if grade_data.get(field, 0) < 0:
            errors.append(f"{field.replace('_', ' ').title()} cannot be negative")
    
    return len(errors) == 0, errors


def get_or_create_grade(student, class_obj, subject, academic_year, term):
    """
    Get existing grade or create new one
    Used to prevent duplicate grade entries
    """
    grade, created = Grade.objects.get_or_create(
        student=student,
        class_obj=class_obj,
        subject=subject,
        academic_year=academic_year,
        term=term,
        defaults={
            'assessment_score': 0,
            'assessment_total': 0,
            'test_score': 0,
            'test_total': 0,
            'exam_score': 0,
            'exam_total': 0
        }
    )
    
    return grade, created
