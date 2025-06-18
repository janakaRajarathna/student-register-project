-- sample_data.sql

USE assignment_system;

-- USERS
INSERT INTO users (username, password, full_name, email, role, status)
VALUES
  -- Admin
  ('admin', '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq', 'System Admin', 'admin@test.com', 'admin', 1),

  -- Lecturers
  ('lecturer1', '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq', 'Nuwan Jayasekara', 'lec1@test.com', 'lecturer', 1),
  ('lecturer2', '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq', 'Bob Lecturer', 'lec2@test.com', 'lecturer', 1),

  -- Students
  ('best',    '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq',    'Janaka',    'janaka@test.com',    'student', 1),
  ('better',  '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq',  'Themiya',  'Themiya@test.com',  'student', 1),
  ('beast',   '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq',   'Mendis',   'Mendis@test.com',   'student', 1),
  ('bad',     '$2a$10$Z0y0j33ycnAfqYIdl2xxPeb3f272BX41iWKLkkG9VKoM7oCJpL/kq',     'Bandara',     'bandara@test.com',     'student', 1);

-- SUBJECTS
INSERT INTO subjects (name, lecturer_id) VALUES
  ('Introduction to IT', 2),      -- lecturer1
  ('Database Systems', 2),        -- lecturer1
  ('Networking Basics', 3),       -- lecturer2
  ('Web Development', 3);         -- lecturer2

-- ASSIGNMENTS
-- For subject 1 (Introduction to IT)
INSERT INTO assignments (title, description, due_date, subject_id, max_marks, created_by, deadline) VALUES
  ('IT Assignment 1', 'Basics of IT', '2024-07-01 23:59:59', 1, 100, 2, '2024-07-01 23:59:59'),
  ('IT Assignment 2', 'History of Computers', '2024-07-10 23:59:59', 1, 100, 2, '2024-07-10 23:59:59'),
  ('IT Assignment 3', 'Future of IT', '2024-07-20 23:59:59', 1, 100, 2, '2024-07-20 23:59:59');

-- For subject 2 (Database Systems)
INSERT INTO assignments (title, description, due_date, subject_id, max_marks, created_by, deadline) VALUES
  ('DB Assignment 1', 'ER Diagrams', '2024-07-02 23:59:59', 2, 100, 2, '2024-07-02 23:59:59'),
  ('DB Assignment 2', 'SQL Basics', '2024-07-12 23:59:59', 2, 100, 2, '2024-07-12 23:59:59'),
  ('DB Assignment 3', 'Normalization', '2024-07-22 23:59:59', 2, 100, 2, '2024-07-22 23:59:59');

-- For subject 3 (Networking Basics)
INSERT INTO assignments (title, description, due_date, subject_id, max_marks, created_by, deadline) VALUES
  ('Network Assignment 1', 'OSI Model', '2024-07-03 23:59:59', 3, 100, 3, '2024-07-03 23:59:59'),
  ('Network Assignment 2', 'TCP/IP', '2024-07-13 23:59:59', 3, 100, 3, '2024-07-13 23:59:59'),
  ('Network Assignment 3', 'Subnetting', '2024-07-23 23:59:59', 3, 100, 3, '2024-07-23 23:59:59');

-- For subject 4 (Web Development)
INSERT INTO assignments (title, description, due_date, subject_id, max_marks, created_by, deadline) VALUES
  ('Web Assignment 1', 'HTML Basics', '2024-07-04 23:59:59', 4, 100, 3, '2024-07-04 23:59:59'),
  ('Web Assignment 2', 'CSS Styling', '2024-07-14 23:59:59', 4, 100, 3, '2024-07-14 23:59:59'),
  ('Web Assignment 3', 'JavaScript Intro', '2024-07-24 23:59:59', 4, 100, 3, '2024-07-24 23:59:59');
