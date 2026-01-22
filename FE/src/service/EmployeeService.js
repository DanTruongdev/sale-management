export const EmployeeService = {
    getEmployees() {
        return [
            {
                id: 1,
                name: 'Nguyễn Văn A',
                position: 'Manager',
                dob: new Date('1990-01-15'),
                image: 'https://via.placeholder.com/50',
                phone: '0123456789',
                citizenId: '123456789',
                address: '123 Main St, City A',
                facilityId: 1
            },
            {
                id: 2,
                name: 'Trần Thị B',
                position: 'Staff',
                dob: new Date('1992-05-20'),
                image: 'https://via.placeholder.com/50',
                phone: '0987654321',
                citizenId: '987654321',
                address: '456 Elm St, City B',
                facilityId: 2
            },
            {
                id: 3,
                name: 'Lê Văn C',
                position: 'Supervisor',
                dob: new Date('1985-10-10'),
                image: 'https://via.placeholder.com/50',
                phone: '0111111111',
                citizenId: '111111111',
                address: '789 Oak St, City C',
                facilityId: 3
            }
        ];
    }
};
