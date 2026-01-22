<script setup>
import { FacilityService } from '@/service/FacilityService';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref } from 'vue';

const toast = useToast();
const confirm = useConfirm();

const facilities = ref(null);
const loading = ref(true);
const allFacilities = ref(null);
const searchCode = ref('');
const searchName = ref('');
const searchAddress = ref('');
const first = ref(0);

const addDialogVisible = ref(false);
const newFacilityCode = ref('');
const newFacilityName = ref('');
const newFacilityAddress = ref('');

const editDialogVisible = ref(false);
const editFacility = ref(null);
const editFacilityCode = ref('');
const editFacilityName = ref('');
const editFacilityAddress = ref('');

onBeforeMount(() => {
    allFacilities.value = FacilityService.getFacilities();
    facilities.value = allFacilities.value;
    loading.value = false;
});

function clearFilter() {
    facilities.value = allFacilities.value;
    searchCode.value = '';
    searchName.value = '';
    searchAddress.value = '';
}

function search() {
    let filtered = allFacilities.value.filter((fac) => {
        let match = true;
        if (searchCode.value) {
            match = match && fac.code.toLowerCase().includes(searchCode.value.toLowerCase());
        }
        if (searchName.value) {
            match = match && fac.name.toLowerCase().includes(searchName.value.toLowerCase());
        }
        if (searchAddress.value) {
            match = match && fac.address.toLowerCase().includes(searchAddress.value.toLowerCase());
        }
        return match;
    });
    facilities.value = filtered;
}

function refresh() {
    clearFilter();
    loading.value = true;
    allFacilities.value = FacilityService.getFacilities();
    facilities.value = allFacilities.value;
    loading.value = false;
}

function addFacility() {
    newFacilityCode.value = '';
    newFacilityName.value = '';
    newFacilityAddress.value = '';
    addDialogVisible.value = true;
}

function saveFacility() {
    if (!newFacilityCode.value.trim() || !newFacilityName.value.trim() || !newFacilityAddress.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ mã, tên và địa chỉ cơ sở.', life: 3000 });
        return;
    }
    const newId = Math.max(...allFacilities.value.map((f) => f.id)) + 1;
    const newFacility = {
        id: newId,
        code: newFacilityCode.value.trim(),
        name: newFacilityName.value.trim(),
        address: newFacilityAddress.value.trim()
    };
    allFacilities.value.push(newFacility);
    facilities.value = [...allFacilities.value];
    addDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm cơ sở mới.', life: 3000 });
}

function cancelAdd() {
    addDialogVisible.value = false;
}

function editFacilityItem(facility) {
    editFacility.value = facility;
    editFacilityCode.value = facility.code;
    editFacilityName.value = facility.name;
    editFacilityAddress.value = facility.address;
    editDialogVisible.value = true;
}

function saveEditFacility() {
    if (!editFacilityCode.value.trim() || !editFacilityName.value.trim() || !editFacilityAddress.value.trim()) {
        toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập đầy đủ mã, tên và địa chỉ cơ sở.', life: 3000 });
        return;
    }
    editFacility.value.code = editFacilityCode.value.trim();
    editFacility.value.name = editFacilityName.value.trim();
    editFacility.value.address = editFacilityAddress.value.trim();
    facilities.value = [...allFacilities.value];
    editDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã chỉnh sửa cơ sở.', life: 3000 });
}

function cancelEdit() {
    editDialogVisible.value = false;
}

function deleteFacilityItem(facility) {
    confirm.require({
        message: `Bạn có chắc chắn muốn xóa cơ sở "${facility.name}"?`,
        header: 'Xác nhận xóa',
        acceptLabel: 'Xóa',
        rejectLabel: 'Hủy',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-times',
        acceptClass: 'p-button-danger',
        rejectClass: 'p-button-secondary',
        accept: () => {
            const index = allFacilities.value.findIndex((f) => f.id === facility.id);
            if (index > -1) {
                allFacilities.value.splice(index, 1);
                facilities.value = [...allFacilities.value];
                toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa cơ sở.', life: 3000 });
            }
        }
    });
}
</script>

<template>
    <div class="card">
        <div class="flex justify-between items-center mb-4">
            <h5 class="m-0">Quản lý cơ sở</h5>
            <Button label="Thêm mới" icon="pi pi-plus" @click="addFacility" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div class="col-span-1">
                <label for="searchCode" class="block text-sm font-medium mb-2">Mã cơ sở</label>
                <InputText id="searchCode" v-model="searchCode" placeholder="Nhập mã cơ sở" />
            </div>
            <div class="col-span-1">
                <label for="searchName" class="block text-sm font-medium mb-2">Tên cơ sở</label>
                <InputText id="searchName" v-model="searchName" placeholder="Nhập tên cơ sở" />
            </div>
            <div class="col-span-1">
                <label for="searchAddress" class="block text-sm font-medium mb-2">Địa chỉ</label>
                <InputText id="searchAddress" v-model="searchAddress" placeholder="Nhập địa chỉ" />
            </div>
            <div class="col-span-1 flex gap-2 items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="refresh" />
            </div>
        </div>

        <DataTable :value="facilities" :paginator="true" :rows="10" :rowsPerPageOptions="[5, 10, 25]" dataKey="id" :rowHover="true" :loading="loading" :first="first" v-model:first="first" showGridlines responsiveLayout="scroll">
            <template #empty> Không tìm thấy cơ sở nào. </template>
            <template #loading> Đang tải dữ liệu cơ sở. Vui lòng chờ. </template>
            <Column header="STT" style="min-width: 8rem">
                <template #body="{ index }">
                    {{ first + index + 1 }}
                </template>
            </Column>
            <Column field="code" header="Mã" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.code }}
                </template>
            </Column>
            <Column field="name" header="Tên" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.name }}
                </template>
            </Column>
            <Column field="address" header="Địa chỉ" style="min-width: 15rem">
                <template #body="{ data }">
                    {{ data.address }}
                </template>
            </Column>
            <Column header="Hành động" style="min-width: 10rem">
                <template #body="{ data }">
                    <Button icon="pi pi-pencil" severity="info" text rounded @click="editFacilityItem(data)" v-tooltip.top="'Chỉnh sửa'" />
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteFacilityItem(data)" v-tooltip.top="'Xóa'" />
                </template>
            </Column>
        </DataTable>
    </div>

    <Toast />
    <ConfirmPopup />
    <Dialog v-model:visible="addDialogVisible" modal header="Thêm cơ sở mới" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="newCode" class="block text-sm font-medium mb-2">Mã cơ sở *</label>
                <InputText id="newCode" v-model="newFacilityCode" placeholder="Nhập mã cơ sở" class="w-full" />
            </div>
            <div>
                <label for="newName" class="block text-sm font-medium mb-2">Tên cơ sở *</label>
                <InputText id="newName" v-model="newFacilityName" placeholder="Nhập tên cơ sở" class="w-full" />
            </div>
            <div>
                <label for="newAddress" class="block text-sm font-medium mb-2">Địa chỉ *</label>
                <InputText id="newAddress" v-model="newFacilityAddress" placeholder="Nhập địa chỉ" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelAdd" />
            <Button label="Lưu" icon="pi pi-check" @click="saveFacility" />
        </template>
    </Dialog>

    <Dialog v-model:visible="editDialogVisible" modal header="Chỉnh sửa cơ sở" style="width: 400px">
        <div class="flex flex-col gap-4">
            <div>
                <label for="editCode" class="block text-sm font-medium mb-2">Mã cơ sở *</label>
                <InputText id="editCode" v-model="editFacilityCode" placeholder="Nhập mã cơ sở" class="w-full" />
            </div>
            <div>
                <label for="editName" class="block text-sm font-medium mb-2">Tên cơ sở *</label>
                <InputText id="editName" v-model="editFacilityName" placeholder="Nhập tên cơ sở" class="w-full" />
            </div>
            <div>
                <label for="editAddress" class="block text-sm font-medium mb-2">Địa chỉ *</label>
                <InputText id="editAddress" v-model="editFacilityAddress" placeholder="Nhập địa chỉ" class="w-full" />
            </div>
        </div>
        <template #footer>
            <Button label="Hủy" icon="pi pi-times" severity="secondary" @click="cancelEdit" />
            <Button label="Lưu" icon="pi pi-check" @click="saveEditFacility" />
        </template>
    </Dialog>
</template>
