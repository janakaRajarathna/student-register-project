-- Create Database
CREATE DATABASE IF NOT EXISTS assignment_system;
USE assignment_system;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer') NOT NULL
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    lecturer_id INT,
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    lecturer_id INT,
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT,
    student_id INT,
    file_path VARCHAR(255) NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    submission_id INT PRIMARY KEY,
    grade DECIMAL(5,2) CHECK (grade BETWEEN 0 AND 100),
    feedback TEXT,
    graded_by INT,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (graded_by) REFERENCES users(id)
);

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