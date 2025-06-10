-- Create Database
CREATE DATABASE IF NOT EXISTS assignment_system;
USE assignment_system;

-- Users Table
------------------------------------------------------------------------------------------------------+
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` text NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('student','lecturer','admin') NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    lecturer_id INT,
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Assignments Table
CREATE TABLE `assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` datetime NOT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `max_marks` int(11) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deadline` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_assignments_created_by` (`created_by`),
  KEY `assignments_ibfk_2` (`subject_id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
);



-- Submissions Table
 CREATE TABLE `submissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `assignment_file` mediumblob DEFAULT NULL,
  `file_type` text NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `student_comment` text NOT NULL,
  `marks` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `marked_by` int(11) DEFAULT NULL,
  `marked_at` timestamp NULL DEFAULT NULL,
  `status` enum('PENDING','MARKED','REJECTED','') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_submissions_assignment_id` (`assignment_id`),
  KEY `idx_submissions_student_id` (`student_id`),
  KEY `idx_submissions_marked_by` (`marked_by`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ;

-- Sample Data (Optional)
INSERT INTO users (name, email, password, role) VALUES
('John Lecturer', 'lecturer@example.com', '$2a$10$ExampleHash', 'lecturer'),
('Alice Student', 'student@example.com', '$2a$10$ExampleHash', 'student');

INSERT INTO subjects (name, lecturer_id) VALUES
('Mathematics', 1),
('Physics', 1);

INSERT INTO assignments (title, description, deadline, lecturer_id) VALUES
('Algebra Basics', 'Complete chapter 1 exercises', '2023-12-31', 1),
('Newton Laws', 'Solve physics problems', '2024-01-15', 1); 