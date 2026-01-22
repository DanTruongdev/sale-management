<script setup>
import { EmployeeService } from '@/service/EmployeeService';
import { FacilityService } from '@/service/FacilityService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();

const employees = ref(null);
const loading = ref(true);
const allEmployees = ref(null);
const facilities = ref(null);
const searchName = ref('');
const searchPosition = ref('');
const searchPhone = ref('');
const first = ref(0);

const addDialogVisible = ref(false);
const newEmployeeName = ref('');
const newEmployeePosition = ref('');
const newEmployeeDob = ref(null);
const newEmployeeImage = ref('');
const newEmployeePhone = ref('');
const newEmployeeCitizenId = ref('');
const newEmployeeAddress = ref('');
const newEmployeeFacilityId = ref(null);

const editDialogVisible = ref(false);
const editEmployee = ref(null);
const editEmployeeName = ref('');
const editEmployeePosition = ref('');
const editEmployeeDob = ref(null);
const editEmployeeImage = ref('');
const editEmployeePhone = ref('');
const editEmployeeCitizenId = ref('');
const editEmployeeAddress = ref('');
const editEmployeeFacilityId = ref(null);

const facilityOptions = computed(() => {
    return facilities.value ? facilities.value.map((f) => ({ label: f.name, value: f.id })) : [];
});

onBeforeMount(() => {
    allEmployees.value = EmployeeService.getEmployees();
    employees.value = allEmployees.value;
    facilities.value = FacilityService.getFacilities();
    loading.value = false;
});

function clearFilter() {
    employees.value = allEmployees.value;
    searchName.value = '';
    searchPosition.value = '';
    searchPhone.value = '';
}

function search() {
    let filtered = allEmployees.value.filter((emp) => {
        let match = true;
        if (searchName.value) {
            match = match && emp.name.toLowerCase().includes(searchName.value.toLowerCase());
        }
        if (searchPosition.value) {
            match = match && emp.position.toLowerCase().includes(searchPosition.value.toLowerCase());
        }
        if (searchPhone.value) {
            match = match && emp.phone.includes(searchPhone.value);
        }
        return match;
    });
    employees.value = filtered;
}

function refresh() {
    clearFilter();
    loading.value = true;
    allEmployees.value = EmployeeService.getEmployees();
    employees.value = allEmployees.value;
    loading.value = false;
}

function addEmployee() {
    newEmployeeName.value = '';
    newEmployeePosition.value = '';
    newEmployeeDob.value = null;
    newEmployeeImage.value = '';
    newEmployeePhone.value = '';
    newEmployeeCitizenId.value = '';
    newEmployeeAddress.value = '';
    newEmployeeFacilityId.value = null;
    addDialogVisible.value = true;
}

function saveEmployee() {
    if (!newEmployeeName.value.trim() || !newEmployeePosition.value.trim() || !newEmployeePhone.value.trim() || !newEmployeeCitizenId.value.trim() || !newEmployeeAddress.value.trim() || !newEmployeeFacilityId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin nhân viên.', life: 3000 });
        return;
    }
    const newId = Math.max(...allEmployees.value.map((e) => e.id)) + 1;
    const newEmployee = {
        id: newId,
        name: newEmployeeName.value.trim(),
        position: newEmployeePosition.value.trim(),
        dob: newEmployeeDob.value,
        image: newEmployeeImage.value.trim(),
        phone: newEmployeePhone.value.trim(),
        citizenId: newEmployeeCitizenId.value.trim(),
        address: newEmployeeAddress.value.trim(),
        facilityId: newEmployeeFacilityId.value
    };
    allEmployees.value.push(newEmployee);
    employees.value = [...allEmployees.value];
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm nhân viên mới.', life: 3000 });
}

function cancelAdd() {
    addDialogVisible.value = false;
}

function editEmployeeItem(employee) {
    editEmployee.value = employee;
    editEmployeeName.value = employee.name;
    editEmployeePosition.value = employee.position;
    editEmployeeDob.value = employee.dob;
    editEmployeeImage.value = employee.image;
    editEmployeePhone.value = employee.phone;
    editEmployeeCitizenId.value = employee.citizenId;
    editEmployeeAddress.value = employee.address;
    editEmployeeFacilityId.value = employee.facilityId;
    editDialogVisible.value = true;
}

function saveEditEmployee() {
    if (!editEmployeeName.value.trim() || !editEmployeePosition.value.trim() || !editEmployeePhone.value.trim() || !editEmployeeCitizenId.value.trim() || !editEmployeeAddress.value.trim() || !editEmployeeFacilityId.value) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ thông tin nhân viên.', life: 3000 });
        return;
    }
    editEmployee.value.name = editEmployeeName.value.trim();
    editEmployee.value.position = editEmployeePosition.value.trim();
    editEmployee.value.dob = editEmployeeDob.value;
    editEmployee.value.image = editEmployeeImage.value.trim();
    editEmployee.value.phone = editEmployeePhone.value.trim();
    editEmployee.value.citizenId = editEmployeeCitizenId.value.trim();
    editEmployee.value.address = editEmployeeAddress.value.trim();
    editEmployee.value.facilityId = editEmployeeFacilityId.value;
    employees.value = [...allEmployees.value];
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chỉnh sửa nhân viên.', life: 3000 });
}

function cancelEdit() {
    editDialogVisible.value = false;
}

function deleteEmployeeItem(employee) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.name}"?`,
        header: 'Xác nhận xóa',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-times',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            const index = allEmployees.value.findIndex((e) => e.id === employee.id);
            if (index > -1) {
                allEmployees.value.splice(index, 1);
                employees.value = [...allEmployees.value];
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa nhân viên.', life: 3000 });
            }
        }
    });
}

function formatDate(value) {
    return value.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getFacilityName(facilityId) {
    const facility = facilities.value.find((f) => f.id === facilityId);
    return facility ? facility.name : '';
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Quản lý nhân viên</h5>
            <Button label="Thêm mới" icon="pi pi-plus" @click="addEmployee" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="col-span-1">
                <label for="searchName" class="block text-sm font-medium mb-2">Tên nhân viên</label>
                <InputText id="searchName" v-model="searchName" placeholder="Nhập tên nhân viên" />
            </div>
            <div class="col-span-1">
                <label for="searchPosition" class="block text-sm font-medium mb-2">Chức vụ</label>
                <InputText id="searchPosition" v-model="searchPosition" placeholder="Nhập chức vụ" />
            </div>
            <div class="col-span-1">
                <label for="searchPhone" class="block text-sm font-medium mb-2">Số điện thoại</label>
                <InputText id="searchPhone" v-model="searchPhone" placeholder="Nhập số điện thoại" />
            </div>
            <div class="col-span-1 flex gap-2 items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="refresh" />
            </div>
        </div>

        <DataTable :value="employees" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" dataKey="id" :rowHover="true" :loading="loading" :first="first" v-model:first="first" showGridlines responsiveLayout="scroll">
            <template #empty> Không tìm thấy nhân viên nào. </template>
            <template #loading> Đang tải dữ liệu nhân viên. Vui lòng chờ. </template>
            <Column header="STT" style="min-width: 8rem">
                <template #body="{ index }">
                    {{ first + index + 1 }}
                </template>
            </Column>
            <Column header="Ảnh" style="min-width: 6rem">
                <template #body="{ data }">
                    <img :src="data.image" alt="Avatar" class="w-12 h-12 rounded-full" />
                </template>
            </Column>
            <Column field="name" header="Tên" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="position" header="Chức vụ" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.position }}
                </template>
            </Column>
            <Column field="dob" header="Ngày sinh" dataType="date" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ formatDate(data.dob) }}
                </template>
            </Column>
            <Column field="phone" header="Số điện thoại" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.phone }}
                </template>
            </Column>
            <Column field="address" header="Địa chỉ" style="min-width: 15rem">
                <template #body="{ data }">
                    {{ data.address }}
                </template>
            </Column>
            <Column header="Cơ sở" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ getFacilityName(data.facilityId) }}
                </template>
            </Column>
            <Column header="Hành động" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="info" text rounded @click="editEmployeeItem(data)" v-tooltip.top="'Chỉnh sửa'" />
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteEmployeeItem(data)" v-tooltip.top="'Xóa'" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Toast />
    <ConfirmPopup />
    <Dialog v-model:visible="addDialogVisible" modal header="Thêm nhân viên mới" style="width: 500px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="newName" class="block text-sm font-medium mb-2">Tên nhân viên *</label>
                <InputText id="newName" v-model="newEmployeeName" placeholder="Nhập tên nhân viên" class="w-full" />
            </div>
            <div>
                <label for="newPosition" class="block text-sm font-medium mb-2">Chức vụ *</label>
                <InputText id="newPosition" v-model="newEmployeePosition" placeholder="Nhập chức vụ" class="w-full" />
            </div>
            <div>
                <label for="newDob" class="block text-sm font-medium mb-2">Ngày sinh</label>
                <DatePicker id="newDob" v-model="newEmployeeDob" dateFormat="dd/mm/yy" placeholder="Chọn ngày sinh" class="w-full" />
            </div>
            <div>
                <label for="newImage" class="block text-sm font-medium mb-2">Ảnh (URL)</label>
                <InputText id="newImage" v-model="newEmployeeImage" placeholder="Nhập URL ảnh" class="w-full" />
            </div>
            <div>
                <label for="newPhone" class="block text-sm font-medium mb-2">Số điện thoại *</label>
                <InputText id="newPhone" v-model="newEmployeePhone" placeholder="Nhập số điện thoại" class="w-full" />
            </div>
            <div>
                <label for="newCitizenId" class="block text-sm font-medium mb-2">CMND/CCCD *</label>
                <InputText id="newCitizenId" v-model="newEmployeeCitizenId" placeholder="Nhập CMND/CCCD" class="w-full" />
            </div>
            <div>
                <label for="newAddress" class="block text-sm font-medium mb-2">Địa chỉ *</label>
                <InputText id="newAddress" v-model="newEmployeeAddress" placeholder="Nhập địa chỉ" class="w-full" />
            </div>
            <div>
                <label for="newFacilityId" class="block text-sm font-medium mb-2">Cơ sở *</label>
                <Dropdown id="newFacilityId" v-model="newEmployeeFacilityId" :options="facilityOptions" optionLabel="label" optionValue="value" placeholder="Chọn cơ sở" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelAdd" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEmployee" />
        </template>
    </Dialog>

    <Dialog v-model:visible="editDialogVisible" modal header="Chỉnh sửa nhân viên" style="width: 500px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="editName" class="block text-sm font-medium mb-2">Tên nhân viên *</label>
                <InputText id="editName" v-model="editEmployeeName" placeholder="Nhập tên nhân viên" class="w-full" />
            </div>
            <div>
                <label for="editPosition" class="block text-sm font-medium mb-2">Chức vụ *</label>
                <InputText id="editPosition" v-model="editEmployeePosition" placeholder="Nhập chức vụ" class="w-full" />
            </div>
            <div>
                <label for="editDob" class="block text-sm font-medium mb-2">Ngày sinh</label>
                <DatePicker id="editDob" v-model="editEmployeeDob" dateFormat="dd/mm/yy" placeholder="Chọn ngày sinh" class="w-full" />
            </div>
            <div>
                <label for="editImage" class="block text-sm font-medium mb-2">Ảnh (URL)</label>
                <InputText id="editImage" v-model="editEmployeeImage" placeholder="Nhập URL ảnh" class="w-full" />
            </div>
            <div>
                <label for="editPhone" class="block text-sm font-medium mb-2">Số điện thoại *</label>
                <InputText id="editPhone" v-model="editEmployeePhone" placeholder="Nhập số điện thoại" class="w-full" />
            </div>
            <div>
                <label for="editCitizenId" class="block text-sm font-medium mb-2">CMND/CCCD *</label>
                <InputText id="editCitizenId" v-model="editEmployeeCitizenId" placeholder="Nhập CMND/CCCD" class="w-full" />
            </div>
            <div>
                <label for="editAddress" class="block text-sm font-medium mb-2">Địa chỉ *</label>
                <InputText id="editAddress" v-model="editEmployeeAddress" placeholder="Nhập địa chỉ" class="w-full" />
            </div>
            <div>
                <label for="editFacilityId" class="block text-sm font-medium mb-2">Cơ sở *</label>
                <Dropdown id="editFacilityId" v-model="editEmployeeFacilityId" :options="facilityOptions" optionLabel="label" optionValue="value" placeholder="Chọn cơ sở" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelEdit" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEditEmployee" />
        </template>
    </Dialog>
</template>
