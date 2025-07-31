
import * as fs from 'fs';
import * as path from 'path';
import { setAcademicData, type Career, type Subject } from '@/lib/data';

const mockDataPath = path.join(process.cwd(), 'MockData.json');

const loadMockData = () => {
    try {
        const jsonString = fs.readFileSync(mockDataPath, 'utf-8');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error reading or parsing MockData.json:", error);
        return {};
    }
};

const generateCareersAndSubjects = () => {
    const mockData = loadMockData();
    const loadedCareers: Career[] = [];
    const loadedSubjects: Subject[] = [];
    let careerIdCounter = 1;
    let subjectIdCounter = 1;

    const getSemesterKeyNumber = (key: string) => {
        const match = key.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    for (const careerName in mockData) {
        const careerPlans = mockData[careerName];
        for (const planName in careerPlans) {
            const semestersData = careerPlans[planName];
            
            const semesterKeys = Object.keys(semestersData);
            const semesterCount = semesterKeys.length;

            const newCareer: Career = {
                id: careerIdCounter++,
                name: careerName,
                modality: planName,
                campus: 'Plantel Principal', 
                coordinator: 'Coordinador No Asignado', 
                semesters: semesterCount,
            };
            loadedCareers.push(newCareer);
            
            semesterKeys.forEach((semesterKey) => {
                const semesterNumber = getSemesterKeyNumber(semesterKey);
                const subjectsInSemester = semestersData[semesterKey];

                subjectsInSemester.forEach((subjectName: string) => {
                    const newSubject: Subject = {
                        id: subjectIdCounter++,
                        name: subjectName,
                        career: careerName,
                        semester: semesterNumber,
                    };
                    loadedSubjects.push(newSubject);
                });
            });
        }
    }
    return { loadedCareers, loadedSubjects };
};

export const AcademicData = () => {
    const { loadedCareers, loadedSubjects } = generateCareersAndSubjects();
    setAcademicData(loadedCareers, loadedSubjects);
    return null; 
};
