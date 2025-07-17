export const users = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Administrator', joined: '2023-01-15' },
  { id: 2, name: 'Coordinator User', email: 'coordinator@example.com', role: 'Coordinator', joined: '2023-02-20' },
  { id: 3, name: 'Teacher User', email: 'teacher@example.com', role: 'Teacher', joined: '2023-03-10' },
  { id: 4, name: 'Student User', email: 'student@example.com', role: 'Student', joined: '2023-09-01' },
  { id: 5, name: 'John Doe', email: 'john.d@example.com', role: 'Teacher', joined: '2022-08-21' },
  { id: 6, name: 'Jane Smith', email: 'jane.s@example.com', role: 'Student', joined: '2023-09-01' },
];

export const campuses = [
  { id: 1, name: 'Main Campus', location: 'City Center', director: 'Dr. Alice Johnson' },
  { id: 2, name: 'North Campus', location: 'North Suburbs', director: 'Mr. Bob Williams' },
  { id: 3, name: 'South Campus', location: 'South District', director: 'Ms. Carol White' },
];

export const programs = [
  { id: 1, name: 'Computer Science', campus: 'Main Campus', duration: '4 Years' },
  { id: 2, name: 'Business Administration', campus: 'Main Campus', duration: '4 Years' },
  { id: 3, name: 'Mechanical Engineering', campus: 'North Campus', duration: '5 Years' },
  { id: 4, name: 'Fine Arts', campus: 'South Campus', duration: '3 Years' },
];

export const subjects = [
  { id: 1, name: 'Introduction to Programming', program: 'Computer Science', teacher: 'Dr. Alan Turing' },
  { id: 2, name: 'Data Structures', program: 'Computer Science', teacher: 'Dr. Ada Lovelace' },
  { id: 3, name: 'Marketing Principles', program: 'Business Administration', teacher: 'Prof. Philip Kotler' },
  { id: 4, name: 'Thermodynamics', program: 'Mechanical Engineering', teacher: 'Dr. James Watt' },
];

export const teachers = [
  { id: 1, name: 'Dr. Alan Turing' },
  { id: 2, name: 'Dr. Ada Lovelace' },
  { id: 3, name: 'Prof. Philip Kotler' },
  { id: 4, name: 'Dr. James Watt' },
  { id: 5, name: 'Prof. Marie Curie' },
];

export const evaluations = [
  { id: 1, student: 'Jane Smith', feedback: 'Great class, very engaging!', rating: 5, date: '2024-05-10' },
  { id: 2, student: 'Student User', feedback: 'The professor is very knowledgeable but the pace is a bit fast.', rating: 4, date: '2024-05-11' },
  { id: 3, student: 'John Appleseed', feedback: 'I learned a lot. The practical examples were very helpful.', rating: 5, date: '2024-05-12' },
];

export const supervisions = [
    { id: 1, date: new Date(), teacher: 'Dr. Alan Turing', subject: 'Intro to Programming', coordinator: 'Coordinator User' },
    { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 2)), teacher: 'Dr. Ada Lovelace', subject: 'Data Structures', coordinator: 'Coordinator User' },
    { id: 3, date: new Date(new Date().setDate(new Date().getDate() + 5)), teacher: 'Prof. Philip Kotler', subject: 'Marketing Principles', coordinator: 'Coordinator User' },
];
