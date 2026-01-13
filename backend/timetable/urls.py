# timetable/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Timetable entry CRUD
    #path('entries/', views.list_timetable_entries, name='list_timetable_entries'),
    path('entries/create/', views.create_timetable_entry, name='create_timetable_entry'),
    path('entries/<int:entry_id>/update/', views.update_timetable_entry, name='update_timetable_entry'),
    path('entries/<int:entry_id>/delete/', views.delete_timetable_entry, name='delete_timetable_entry'),

    # Timetable views
    path('class/<int:class_id>/', views.get_class_timetable, name='view_class_timetable'),
    path('teacher/<int:teacher_id>/', views.get_teacher_timetable, name='view_teacher_timetable'),
    #path('term/<int:term_id>/', views.get_term_timetable, name='view_term_timetable'),

    # Optional: conflict resolution check
    #path('entries/<int:entry_id>/check_conflict/', views.check_entry_conflict, name='check_entry_conflict'),
]
