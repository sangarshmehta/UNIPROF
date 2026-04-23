alter table if exists teachers
add column if not exists timetable_image text not null default '';
