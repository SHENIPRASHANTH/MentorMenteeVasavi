document.addEventListener('DOMContentLoaded', () => {
    const mentorLoginForm = document.getElementById('mentor-login-form');
    const studentLoginForm = document.getElementById('student-login-form');

    if (mentorLoginForm) {
        mentorLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('mentor-email').value;
            const password = document.getElementById('mentor-password').value;

            try {
                const response = await fetch('/api/mentors/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = data.redirectUrl;
                } else {
                    alert(data.msg);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        });
    }

    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('student-email').value;
            const password = document.getElementById('student-password').value;

            try {
                const response = await fetch('/api/students/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    window.location.href = data.redirectUrl;
                } else {
                    alert(data.msg);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        });
    }

    // Code for fetching and displaying mentor's students and student performance
    const studentsListDiv = document.getElementById('students-list');
    if (studentsListDiv) {
        fetch('/api/mentors/me')
            .then(response => response.json())
            .then(mentor => {
                fetch(`/api/mentors/${mentor._id}/students`)
                    .then(response => response.json())
                    .then(students => {
                        students.forEach(student => {
                            const studentElement = document.createElement('div');
                            studentElement.textContent = student.name;
                            studentElement.style.cursor = 'pointer';
                            studentElement.addEventListener('click', () => {
                                fetch(`/api/students/${student._id}/performance`)
                                    .then(response => response.json())
                                    .then(performanceData => {
                                        const performanceDiv = document.getElementById('student-performance');
                                        performanceDiv.textContent = `Performance: ${performanceData.performance}`;
                                    });
                            });
                            studentsListDiv.appendChild(studentElement);
                        });
                    });
            });
    }

    const performanceDetailsDiv = document.getElementById('performance-details');
    if (performanceDetailsDiv) {
        fetch('/api/students/me')
            .then(response => response.json())
            .then(student => {
                fetch(`/api/students/${student._id}/performance`)
                    .then(response => response.json())
                    .then(performanceData => {
                        performanceDetailsDiv.textContent = `Performance: ${performanceData.performance}`;
                    });
            });
    }
});
